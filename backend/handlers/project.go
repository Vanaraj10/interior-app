package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Vanaraj10/interior-backend/config"
	"github.com/Vanaraj10/interior-backend/models"
	"github.com/gin-gonic/gin"
)

// Worker submits a project (order)
func CreateProject(c *gin.Context) {
	workerId := c.GetInt("worker_id")
	adminId := c.GetInt("admin_id")
	var req struct {
		ClientName string `json:"clientName"`
		Phone      string `json:"phone"`
		Address    string `json:"address"`
		HTML       string `json:"html"`
		RawData    string `json:"rawData"`
		ProjectID  int    `json:"projectId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	// Optimize HTML for storage using HTMLOptimizer
	optimizer := NewHTMLOptimizer()
	htmlData := optimizer.OptimizeProjectHTML(req.HTML)
	
	// Serialize the optimized HTML data structure to JSON for storage
	// This separates repeating content from variable content
	htmlJSON, err := json.Marshal(htmlData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process HTML"})
		return
	}
	
	// Use the optimized HTML content for storage
	html := string(htmlJSON)

	db := config.GetDB()
	if req.ProjectID > 0 {
		_, err = db.Exec(`UPDATE projects SET client_name=@p1, phone=@p2, address=@p3, html=@p4, raw_data=@p5, updated_at=GETDATE() WHERE id=@p6 AND worker_id=@p7 AND admin_id=@p8`,
			req.ClientName, req.Phone, req.Address, html, req.RawData, req.ProjectID, workerId, adminId)
	} else {
		_, err = db.Exec(`INSERT INTO projects (client_name, phone, address, html, raw_data, worker_id, admin_id, is_completed, created_at, updated_at) VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, 0, GETDATE(), GETDATE())`,
			req.ClientName, req.Phone, req.Address, html, req.RawData, workerId, adminId)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save project"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Project saved/updated"})
}

// Admin lists all projects for their workers
func ListProjects(c *gin.Context) {
	adminId := c.GetInt("admin_id")
	db := config.GetDB()
	rows, err := db.Query(`SELECT id, client_name, phone, address, html, raw_data, worker_id, admin_id, is_completed, created_at, updated_at FROM projects WHERE admin_id = @p1`, adminId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}
	defer rows.Close()
	var projects []models.Project
	for rows.Next() {
		var p models.Project
		err := rows.Scan(&p.ID, &p.ClientName, &p.Phone, &p.Address, &p.HTML, &p.RawData, &p.WorkerID, &p.AdminID, &p.IsCompleted, &p.CreatedAt, &p.UpdatedAt)
		if err == nil {
			projects = append(projects, p)
		}
	}
	c.JSON(http.StatusOK, projects)
}

// Admin gets a specific project
func GetProject(c *gin.Context) {
	adminId := c.GetInt("admin_id")
	projectId := c.Param("id")
	db := config.GetDB()
	var p models.Project
	err := db.QueryRow(`SELECT id, client_name, phone, address, html, raw_data, worker_id, admin_id, is_completed, created_at, updated_at FROM projects WHERE id = @p1 AND admin_id = @p2`, projectId, adminId).Scan(&p.ID, &p.ClientName, &p.Phone, &p.Address, &p.HTML, &p.RawData, &p.WorkerID, &p.AdminID, &p.IsCompleted, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or not authorized"})
		return
	}
	
	// Reconstruct full HTML from optimized storage format
	reconstructedHTML, err := reconstructProjectHTML(p.HTML)
	if err == nil {
		p.HTML = reconstructedHTML
	}
	
	c.JSON(http.StatusOK, p)
}

// Admin toggles isCompleted for a project
func ToggleProjectCompleted(c *gin.Context) {
	adminId := c.GetInt("admin_id")
	projectId := c.Param("id")
	var req struct {
		IsCompleted bool `json:"isCompleted"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	db := config.GetDB()
	res, err := db.Exec(`UPDATE projects SET is_completed = @p1 WHERE id = @p2 AND admin_id = @p3`, req.IsCompleted, projectId, adminId)
	n, _ := res.RowsAffected()
	if err != nil || n == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update project"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// Worker toggles isCompleted for a project
func WorkerToggleProjectCompleted(c *gin.Context) {
	workerId := c.GetInt("worker_id")
	projectId := c.Param("id")
	var req struct {
		IsCompleted bool `json:"isCompleted"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	db := config.GetDB()
	res, err := db.Exec(`UPDATE projects SET is_completed = @p1 WHERE id = @p2 AND worker_id = @p3`, req.IsCompleted, projectId, workerId)
	n, _ := res.RowsAffected()
	if err != nil || n == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update project"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// Worker lists all projects assigned to them
func ListWorkerProjects(c *gin.Context) {
	workerId := c.GetInt("worker_id")
	db := config.GetDB()
	rows, err := db.Query(`SELECT id, client_name, phone, address, html, raw_data, worker_id, admin_id, is_completed, created_at, updated_at FROM projects WHERE worker_id = @p1`, workerId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}
	defer rows.Close()
	var projects []models.Project
	for rows.Next() {
		var p models.Project
		err := rows.Scan(&p.ID, &p.ClientName, &p.Phone, &p.Address, &p.HTML, &p.RawData, &p.WorkerID, &p.AdminID, &p.IsCompleted, &p.CreatedAt, &p.UpdatedAt)
		if err == nil {
			projects = append(projects, p)
		}
	}
	c.JSON(http.StatusOK, projects)
}

// Admin deletes a project
func DeleteProject(c *gin.Context) {
	adminId := c.GetInt("admin_id")
	projectId := c.Param("id")
	db := config.GetDB()
	res, err := db.Exec(`DELETE FROM projects WHERE id = @p1 AND admin_id = @p2`, projectId, adminId)
	n, _ := res.RowsAffected()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project"})
		return
	}
	if n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or not authorized"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
}
