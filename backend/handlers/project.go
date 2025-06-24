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
)

// Worker submits a project (order)
func CreateProject(c *gin.Context) {
	workerId := c.GetString("worker_id")
	adminId := c.GetString("admin_id")
	workerObjID, err := primitive.ObjectIDFromHex(workerId)
	adminObjID, err2 := primitive.ObjectIDFromHex(adminId)
	if err != nil || err2 != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid worker or admin ID"})
		return
	}
	var req struct {
		ClientName string      `json:"clientName"`
		Phone      string      `json:"phone"`
		Address    string      `json:"address"`
		HTML       string      `json:"html"`
		RawData    interface{} `json:"rawData"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	project := models.Project{
		ID:         primitive.NewObjectID(),
		WorkerID:   workerObjID,
		AdminID:    adminObjID,
		ClientName: req.ClientName,
		Phone:      req.Phone,
		Address:    req.Address,
		CreatedAt:  time.Now(),
		HTML:       req.HTML,
		RawData:    req.RawData,
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	_, err = db.Collection("projects").InsertOne(ctx, project)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save project"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Project saved"})
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
	err = db.Collection("projects").FindOne(ctx, bson.M{"_id": projectObjID, "adminId": adminId}).Decode(&project)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or not authorized"})
		return
	}
	c.JSON(http.StatusOK, project)
}
