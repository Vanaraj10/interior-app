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
	"golang.org/x/crypto/bcrypt"
)

// Admin creates a worker
func CreateWorker(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
		Name     string `json:"name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	// TODO: Auth middleware to get adminId from JWT
	adminId := c.GetString("admin_id")
	adminObjID, err := primitive.ObjectIDFromHex(adminId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid admin ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	// Check if username exists
	count, _ := db.Collection("workers").CountDocuments(ctx, bson.M{"username": req.Username})
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}
	// Hash password
	hash, _ := HashPassword(req.Password)
	worker := models.Worker{
		ID:           primitive.NewObjectID(),
		Username:     req.Username,
		PasswordHash: hash,
		AdminID:      adminObjID,
		Name:         req.Name,
		CreatedAt:    time.Now(),
	}
	_, err = db.Collection("workers").InsertOne(ctx, worker)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create worker"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Worker created"})
}

// Admin deletes a worker
func DeleteWorker(c *gin.Context) {
	workerId := c.Param("id")
	adminId := c.GetString("admin_id")
	workerObjID, err := primitive.ObjectIDFromHex(workerId)
	adminObjID, err2 := primitive.ObjectIDFromHex(adminId)
	if err != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid worker or admin ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	res, err := db.Collection("workers").DeleteOne(ctx, bson.M{"_id": workerObjID, "adminId": adminObjID})
	if err != nil || res.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Worker not found or not authorized"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Worker deleted"})
}

// Admin lists all workers
func ListWorkers(c *gin.Context) {
	adminId := c.GetString("admin_id")
	adminObjID, err := primitive.ObjectIDFromHex(adminId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid admin ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	cursor, err := db.Collection("workers").Find(ctx, bson.M{"adminId": adminObjID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch workers"})
		return
	}
	var workers []models.Worker
	if err := cursor.All(ctx, &workers); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse workers"})
		return
	}
	c.JSON(http.StatusOK, workers)
}

// Helper for password hashing
func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}
