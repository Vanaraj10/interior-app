package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Vanaraj10/interior-backend/config"
	"github.com/Vanaraj10/interior-backend/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
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
		log.Println("BindJSON error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	db := config.GetDB()
	var admin models.Admin
	err := db.QueryRow(`SELECT id, username, password_hash, created_at FROM admins WHERE username = @p1`, req.Username).Scan(&admin.ID, &admin.Username, &admin.PasswordHash, &admin.CreatedAt)
	if err != nil {
		log.Println("DB lookup error for username:", req.Username, "err:", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)); err != nil {
		log.Println("Password mismatch for username:", req.Username)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": admin.ID,
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
	db := config.GetDB()
	var worker models.Worker
	err := db.QueryRow(`SELECT id, username, password_hash, admin_id, name, phone, created_at FROM workers WHERE username = @p1`, req.Username).Scan(&worker.ID, &worker.Username, &worker.PasswordHash, &worker.AdminID, &worker.Name, &worker.Phone, &worker.CreatedAt)
	if err == sql.ErrNoRows || err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(worker.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  worker.ID,
		"role":     "worker",
		"admin_id": worker.AdminID,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString(jwtSecret)
	c.JSON(http.StatusOK, LoginResponse{Token: tokenString})
}
