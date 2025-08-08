package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/Vanaraj10/interior-backend/models"
	"github.com/gin-gonic/gin"
)

type CreateFolderRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	BrandID     int    `json:"brandId" binding:"required"`
}

type UpdateFolderRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	BrandID     *int   `json:"brandId"`
	IsActive    *bool  `json:"isActive"`
}

type FolderWithBrand struct {
	models.Folder
	BrandName string `json:"brandName"`
}

// CreateFolder creates a new folder within a brand
func CreateFolder(c *gin.Context) {
	var req CreateFolderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	adminID := c.GetInt("adminId")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin ID not found"})
		return
	}

	// Verify brand exists and belongs to admin
	var brandExists bool
	brandQuery := "SELECT COUNT(*) > 0 FROM brands WHERE id = ? AND admin_id = ? AND is_active = 1"
	err := db.QueryRow(brandQuery, req.BrandID, adminID).Scan(&brandExists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if !brandExists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid brand ID or brand is not active"})
		return
	}

	now := time.Now()
	query := `
		INSERT INTO folders (name, description, brand_id, admin_id, is_active, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	result, err := db.Exec(query, req.Name, req.Description, req.BrandID, adminID, true, now, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create folder"})
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get folder ID"})
		return
	}

	folder := models.Folder{
		ID:          int(id),
		Name:        req.Name,
		Description: req.Description,
		BrandID:     req.BrandID,
		AdminID:     adminID,
		IsActive:    true,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	c.JSON(http.StatusCreated, gin.H{"folder": folder, "message": "Folder created successfully"})
}

// ListFolders retrieves all folders for a specific brand
func ListFolders(c *gin.Context) {
	adminID := c.GetInt("adminId")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin ID not found"})
		return
	}

	// Get query parameters for filtering
	brandID := c.Query("brandId")
	active := c.Query("active")

	baseQuery := `
		SELECT f.id, f.name, f.description, f.brand_id, f.admin_id, f.is_active,
		       f.created_at, f.updated_at, b.name as brand_name
		FROM folders f
		JOIN brands b ON f.brand_id = b.id
		WHERE f.admin_id = ?
	`
	args := []interface{}{adminID}

	if brandID != "" {
		baseQuery += " AND f.brand_id = ?"
		args = append(args, brandID)
	}

	if active != "" {
		isActive := active == "true"
		baseQuery += " AND f.is_active = ?"
		args = append(args, isActive)
	}

	baseQuery += " ORDER BY f.name ASC"

	rows, err := db.Query(baseQuery, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch folders"})
		return
	}
	defer rows.Close()

	var folders []FolderWithBrand
	for rows.Next() {
		var folder FolderWithBrand
		err := rows.Scan(&folder.ID, &folder.Name, &folder.Description, &folder.BrandID,
			&folder.AdminID, &folder.IsActive, &folder.CreatedAt, &folder.UpdatedAt,
			&folder.BrandName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan folder data"})
			return
		}
		folders = append(folders, folder)
	}

	c.JSON(http.StatusOK, gin.H{"folders": folders})
}

// GetFolder retrieves a specific folder by ID
func GetFolder(c *gin.Context) {
	folderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid folder ID"})
		return
	}

	adminID := c.GetInt("adminId")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin ID not found"})
		return
	}

	query := `
		SELECT f.id, f.name, f.description, f.brand_id, f.admin_id, f.is_active,
		       f.created_at, f.updated_at, b.name as brand_name
		FROM folders f
		JOIN brands b ON f.brand_id = b.id
		WHERE f.id = ? AND f.admin_id = ?
	`

	var folder FolderWithBrand
	err = db.QueryRow(query, folderID, adminID).Scan(
		&folder.ID, &folder.Name, &folder.Description, &folder.BrandID,
		&folder.AdminID, &folder.IsActive, &folder.CreatedAt, &folder.UpdatedAt,
		&folder.BrandName)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Folder not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch folder"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"folder": folder})
}

// UpdateFolder updates an existing folder
func UpdateFolder(c *gin.Context) {
	folderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid folder ID"})
		return
	}

	var req UpdateFolderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	adminID := c.GetInt("adminId")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin ID not found"})
		return
	}

	// Check if folder exists and belongs to admin
	var existingFolder models.Folder
	checkQuery := "SELECT id FROM folders WHERE id = ? AND admin_id = ?"
	err = db.QueryRow(checkQuery, folderID, adminID).Scan(&existingFolder.ID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Folder not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// If brandID is being updated, verify it exists and belongs to admin
	if req.BrandID != nil {
		var brandExists bool
		brandQuery := "SELECT COUNT(*) > 0 FROM brands WHERE id = ? AND admin_id = ? AND is_active = 1"
		err := db.QueryRow(brandQuery, *req.BrandID, adminID).Scan(&brandExists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		if !brandExists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid brand ID or brand is not active"})
			return
		}
	}

	// Build update query dynamically based on which fields were provided
	var updates []string
	var args []interface{}

	if req.Name != "" {
		updates = append(updates, "name = ?")
		args = append(args, req.Name)
	}
	if req.Description != "" {
		updates = append(updates, "description = ?")
		args = append(args, req.Description)
	}
	if req.BrandID != nil {
		updates = append(updates, "brand_id = ?")
		args = append(args, *req.BrandID)
	}
	if req.IsActive != nil {
		updates = append(updates, "is_active = ?")
		args = append(args, *req.IsActive)
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No updates provided"})
		return
	}

	// Add updated_at
	updates = append(updates, "updated_at = ?")
	args = append(args, time.Now())
	args = append(args, folderID, adminID)

	query := "UPDATE folders SET " + updates[0]
	for i := 1; i < len(updates); i++ {
		query += ", " + updates[i]
	}
	query += " WHERE id = ? AND admin_id = ?"

	_, err = db.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update folder"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Folder updated successfully"})
}

// DeleteFolder deletes a folder
func DeleteFolder(c *gin.Context) {
	folderID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid folder ID"})
		return
	}

	adminID := c.GetInt("adminId")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin ID not found"})
		return
	}

	// First check if folder exists and belongs to admin
	var existingFolder models.Folder
	checkQuery := "SELECT id FROM folders WHERE id = ? AND admin_id = ?"
	err = db.QueryRow(checkQuery, folderID, adminID).Scan(&existingFolder.ID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Folder not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Check if folder has any cloths
	var clothCount int
	clothQuery := "SELECT COUNT(*) FROM cloths WHERE folder_id = ?"
	err = db.QueryRow(clothQuery, folderID).Scan(&clothCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if clothCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete folder with existing cloths. Delete cloths first."})
		return
	}

	// Delete the folder
	query := "DELETE FROM folders WHERE id = ? AND admin_id = ?"
	_, err = db.Exec(query, folderID, adminID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete folder"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Folder deleted successfully"})
}
