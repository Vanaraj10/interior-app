package handlers

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/Vanaraj10/interior-backend/config"
	"github.com/Vanaraj10/interior-backend/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET")) // Use env var in production

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

// Admin login
func AdminLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	var admin models.Admin
	err := db.Collection("admins").FindOne(ctx, bson.M{"username": req.Username}).Decode(&admin)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": admin.ID.Hex(),
		"role":    "admin",
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString(jwtSecret)
	c.JSON(http.StatusOK, LoginResponse{Token: tokenString})
}

// Worker login
func WorkerLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	var worker models.Worker
	err := db.Collection("workers").FindOne(ctx, bson.M{"username": req.Username}).Decode(&worker)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(worker.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  worker.ID.Hex(),
		"role":     "worker",
		"admin_id": worker.AdminID.Hex(),
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString(jwtSecret)
	c.JSON(http.StatusOK, LoginResponse{Token: tokenString})
}
