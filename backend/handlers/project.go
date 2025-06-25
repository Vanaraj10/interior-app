package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/Vanaraj10/interior-backend/config"
	"github.com/Vanaraj10/interior-backend/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Worker submits a project (order)
func CreateProject(c *gin.Context) {
	workerId := c.GetString("worker_id")
	adminId := c.GetString("admin_id")
	workerObjID, err := primitive.ObjectIDFromHex(workerId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid worker ID"})
		return
	}
	adminObjID, err2 := primitive.ObjectIDFromHex(adminId)
	if err2 != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid admin ID"})
		return
	}
	var req struct {
		ClientName string      `json:"clientName"`
		Phone      string      `json:"phone"`
		Address    string      `json:"address"`
		HTML       string      `json:"html"`
		RawData    interface{} `json:"rawData"`
		ProjectID  string      `json:"projectId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()

	filter := bson.M{
		"workerId": workerObjID,
		"adminId":  adminObjID,
	}
	if req.ProjectID != "" {
		filter["rawData.id"] = req.ProjectID
	} else {
		filter["clientName"] = req.ClientName
		filter["phone"] = req.Phone
		filter["address"] = req.Address
	}

	update := bson.M{
		"$set": bson.M{
			"html":      req.HTML,
			"rawData":   req.RawData,
			"updatedAt": time.Now(),
		},
		"$setOnInsert": bson.M{
			"clientName":  req.ClientName,
			"phone":       req.Phone,
			"address":     req.Address,
			"createdAt":   time.Now(),
			"workerId":    workerObjID,
			"adminId":     adminObjID,
			"isCompleted": false,
		},
	}
	opts := options.Update().SetUpsert(true)
	_, err = db.Collection("projects").UpdateOne(ctx, filter, update, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save project"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Project saved/updated"})
}

// Admin lists all projects for their workers
func ListProjects(c *gin.Context) {
	adminId := c.GetString("admin_id")
	adminObjID, err := primitive.ObjectIDFromHex(adminId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid admin ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	cursor, err := db.Collection("projects").Find(ctx, bson.M{"adminId": adminObjID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}
	var projects []models.Project
	if err := cursor.All(ctx, &projects); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse projects"})
		return
	}
	c.JSON(http.StatusOK, projects)
}

// Admin gets a specific project
func GetProject(c *gin.Context) {
	adminId := c.GetString("admin_id")
	adminObjID, err := primitive.ObjectIDFromHex(adminId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid admin ID"})
		return
	}
	projectId := c.Param("id")
	projectObjID, err := primitive.ObjectIDFromHex(projectId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	var project models.Project
	err = db.Collection("projects").FindOne(ctx, bson.M{"_id": projectObjID, "adminId": adminObjID}).Decode(&project)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or not authorized"})
		return
	}
	c.JSON(http.StatusOK, project)
}

// Admin toggles isCompleted for a project
func ToggleProjectCompleted(c *gin.Context) {
	adminId := c.GetString("admin_id")
	projectId := c.Param("id")
	if adminId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	var req struct {
		IsCompleted bool `json:"isCompleted"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	objID, err := primitive.ObjectIDFromHex(projectId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}
	adminObjID, err := primitive.ObjectIDFromHex(adminId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid admin ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	res, err := db.Collection("projects").UpdateOne(ctx,
		bson.M{"_id": objID, "adminId": adminObjID},
		bson.M{"$set": bson.M{"isCompleted": req.IsCompleted}},
	)
	if err != nil || res.MatchedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update project"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// Worker toggles isCompleted for a project
func WorkerToggleProjectCompleted(c *gin.Context) {
	workerId := c.GetString("worker_id")
	workerObjID, err := primitive.ObjectIDFromHex(workerId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid worker ID"})
		return
	}
	projectId := c.Param("id")
	if workerId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	var req struct {
		IsCompleted bool `json:"isCompleted"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	objID, err := primitive.ObjectIDFromHex(projectId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	res, err := db.Collection("projects").UpdateOne(ctx,
		bson.M{"_id": objID, "workerId": workerObjID},
		bson.M{"$set": bson.M{"isCompleted": req.IsCompleted}},
	)
	if err != nil || res.MatchedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update project"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// Worker lists all projects assigned to them
func ListWorkerProjects(c *gin.Context) {
	workerId := c.GetString("worker_id")
	workerObjID, err := primitive.ObjectIDFromHex(workerId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid worker ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	cursor, err := db.Collection("projects").Find(ctx, bson.M{"workerId": workerObjID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}
	var projects []models.Project
	if err := cursor.All(ctx, &projects); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse projects"})
		return
	}
	c.JSON(http.StatusOK, projects)
}
