// Package handlers provides a set of functions to manage and manipulate project data,
// including creating, listing, retrieving, updating, and deleting projects. These functions
// interact with an Azure SQL database and utilize Gin for HTTP request handling.
//
// CreateProject creates or updates a project for a worker or an admin. It sanitizes and cleans
// incoming HTML by removing backslashes, style tags, redundant whitespaces, and transforming
// inline styles into CSS classes. The function inserts or updates a project row in the
// "projects" table based on a filter condition that matches worker and admin IDs.
//
// ListProjects retrieves all projects associated with a given admin. It fetches from the
// "projects" table and returns a JSON response containing the array of matching projects.
//
// GetProject retrieves a specific project by its ID for a given admin. It ensures that the
// requesting admin has access to the project, returning an error if it is not found or if the
// user is not authorized.
//
// ToggleProjectCompleted toggles the completion status of a project for the admin. It updates
// the matching row in the "projects" table, setting the "is_completed" field to the
// requested boolean value.
//
// WorkerToggleProjectCompleted toggles the completion status of a project for the worker. It
// similarly updates the "is_completed" field in the "projects" table, ensuring the worker
// is associated with the updated project.
//
// ListWorkerProjects retrieves all projects assigned to a specific worker. It queries the
// "projects" table for projects matching the worker's ID and returns them as JSON.
//
// DeleteProject removes a specific project for the authenticated admin from the "projects"
// table. It ensures that only the admin who owns the project can delete it and returns
// an appropriate response if the project cannot be found or the user is not authorized.
package handlers

import (
	"net/http"
	"regexp"
	"strings"

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
	// Clean and normalize HTML before saving
	html := req.HTML
	// Remove all backslashes (\\), excessive whitespace, and convert double quotes to single quotes
	html = strings.ReplaceAll(html, "\\", "")
	html = strings.ReplaceAll(html, "\r", " ")
	html = strings.ReplaceAll(html, "\n", " ")
	html = strings.ReplaceAll(html, "\t", " ")
	html = strings.ReplaceAll(html, "\"", "'")   // convert double quotes to single quotes
	html = strings.ReplaceAll(html, "> <", "><") // remove whitespace between tags
	html = strings.TrimSpace(html)

	// Remove all <style>...</style> blocks in the <head> and add a global stylesheet link
	styleTagRe := regexp.MustCompile(`(?is)<style.*?>.*?</style>`)
	headStyleTagRe := regexp.MustCompile(`(?is)(<head.*?>)(.*?<style.*?>.*?</style>)(.*?)(</head>)`)
	if headStyleTagRe.MatchString(html) {
		html = headStyleTagRe.ReplaceAllString(html, `$1<link rel='stylesheet' href='/global.css'>$3$4`)
	} else {
		// If no <style> in <head>, just add the stylesheet after <head>
		headRe := regexp.MustCompile(`(?i)<head.*?>`)
		html = headRe.ReplaceAllString(html, "$0<link rel='stylesheet' href='/global.css'>")
	}
	// Remove any remaining <style>...</style> blocks
	html = styleTagRe.ReplaceAllString(html, "")
	// DO NOT remove inline style attributes

	// Remove all inline style attributes and replace with class names for common patterns
	// Example: style="font-weight: bold" => class="bold"
	// You can expand this mapping as needed for your use case
	styleToClass := []struct{ pattern, class string }{
		{`font-weight:\s*bold`, "bold"},
		{`font-size:\s*10px`, "text-xs"},
		{`font-size:\s*12px`, "text-sm"},
		{`font-size:\s*14px`, "text-base"},
		{`font-size:\s*18px`, "text-lg"},
		{`color:\s*#3b82f6`, "text-primary"},
		{`color:\s*#666`, "text-muted"},
		{`background-color:\s*#f0f9ff`, "bg-summary"},
		{`border-radius:\s*8px`, "rounded"},
		{`border: 1px solid #ddd`, "border"},
		{`padding: 8px`, "p-2"},
		{`text-align:\s*right`, "text-right"},
		{`text-align:\s*center`, "text-center"},
		// Add more as needed
	}
	// Replace inline styles with class names
	html = regexp.MustCompile(`style="([^"]*)"`).ReplaceAllStringFunc(html, func(m string) string {
		styles := regexp.MustCompile(`style="([^"]*)"`).FindStringSubmatch(m)
		if len(styles) < 2 {
			return ""
		}
		styleStr := styles[1]
		classNames := []string{}
		for _, sc := range styleToClass {
			if regexp.MustCompile(sc.pattern).MatchString(styleStr) {
				classNames = append(classNames, sc.class)
			}
		}
		if len(classNames) > 0 {
			return "class='" + strings.Join(classNames, " ") + "'"
		}
		return ""
	})

	// Replace repeated inline style with a single class (handle both single and double quotes, and whitespace)
	html = strings.ReplaceAll(html, "style='padding: 8px; border: 1px solid #ddd; text-align: center'", "class='cell-center'")
	html = strings.ReplaceAll(html, "style=\"padding: 8px; border: 1px solid #ddd; text-align: center\"", "class='cell-center'")
	html = strings.ReplaceAll(html, "style='padding: 8px; border: 1px solid #ddd; text-align: center;'", "class='cell-center'")
	html = strings.ReplaceAll(html, "style=\"padding: 8px; border: 1px solid #ddd; text-align: center;\"", "class='cell-center'")
	// Regex for extra whitespace or attribute order
	reCellCenter := regexp.MustCompile(`style=["']\s*padding: 8px;\s*border: 1px solid #ddd;\s*text-align: center;?\s*["']`)
	html = reCellCenter.ReplaceAllString(html, "class='cell-center'")

	// Replace repeated inline style for right-aligned cells with a single class
	html = strings.ReplaceAll(html, "style='padding: 8px; border: 1px solid #ddd; text-align: right'", "class='cell-right'")
	html = strings.ReplaceAll(html, "style=\"padding: 8px; border: 1px solid #ddd; text-align: right\"", "class='cell-right'")
	html = strings.ReplaceAll(html, "style='padding: 8px; border: 1px solid #ddd; text-align: right;'", "class='cell-right'")
	html = strings.ReplaceAll(html, "style=\"padding: 8px; border: 1px solid #ddd; text-align: right;\"", "class='cell-right'")
	// Regex for extra whitespace or attribute order
	reCellRight := regexp.MustCompile(`style=["']\s*padding: 8px;\s*border: 1px solid #ddd;\s*text-align: right;?\s*["']`)
	html = reCellRight.ReplaceAllString(html, "class='cell-right'")

	db := config.GetDB()
	// Upsert logic: if ProjectID is provided, update; else insert new
	var err error
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
