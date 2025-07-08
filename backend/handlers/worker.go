package handlers

import (
	"net/http"

	"github.com/Vanaraj10/interior-backend/config"
	"github.com/Vanaraj10/interior-backend/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Admin creates a worker
func CreateWorker(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
		Name     string `json:"name"`
		Phone    string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	adminId := c.GetInt("admin_id")
	db := config.GetDB()
	// Check if username exists
	var count int
	err := db.QueryRow(`SELECT COUNT(*) FROM workers WHERE username = @p1`, req.Username).Scan(&count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check username"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}
	// Hash password
	hash, _ := HashPassword(req.Password)
	_, err = db.Exec(`INSERT INTO workers (username, password_hash, admin_id, name, phone, created_at) VALUES (@p1, @p2, @p3, @p4, @p5, GETDATE())`,
		req.Username, hash, adminId, req.Name, req.Phone)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create worker"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Worker created"})
}

// Admin deletes a worker
func DeleteWorker(c *gin.Context) {
	workerId := c.Param("id")
	adminId := c.GetInt("admin_id")
	db := config.GetDB()
	res, err := db.Exec(`DELETE FROM workers WHERE id = @p1 AND admin_id = @p2`, workerId, adminId)
	n, _ := res.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete worker"})
		return
	}
	if n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Worker not found or not authorized"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Worker deleted"})
}

// Admin lists all workers
func ListWorkers(c *gin.Context) {
	adminId := c.GetInt("admin_id")
	db := config.GetDB()
	rows, err := db.Query(`SELECT id, username, password_hash, admin_id, name, phone, created_at FROM workers WHERE admin_id = @p1`, adminId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch workers"})
		return
	}
	defer rows.Close()
	var workers []models.Worker
	for rows.Next() {
		var w models.Worker
		err := rows.Scan(&w.ID, &w.Username, &w.PasswordHash, &w.AdminID, &w.Name, &w.Phone, &w.CreatedAt)
		if err == nil {
			workers = append(workers, w)
		}
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
