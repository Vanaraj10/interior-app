package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/Vanaraj10/interior-backend/config"
	"github.com/Vanaraj10/interior-backend/models"
	"github.com/gin-gonic/gin"
)

var (
	db = config.GetDB()
)

type CreateBrandRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	LogoURL     string `json:"logoUrl"`
}

type UpdateBrandRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	LogoURL     string `json:"logoUrl"`
	IsActive    *bool  `json:"isActive"`
}

// CreateBrand creates a new brand
func CreateBrand(c *gin.Context) {
	var req CreateBrandRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	adminID := c.GetInt("admin_id")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin ID not found"})
		return
	}

	now := time.Now()
	query := `
		INSERT INTO brands (name, description, logo_url, admin_id, is_active, created_at, updated_at)
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7)
	`
	db := config.GetDB()
	result, err := db.Exec(query, req.Name, req.Description, req.LogoURL, adminID, true, now, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create brand"})
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get brand ID"})
		return
	}

	brand := models.Brand{
		ID:          int(id),
		Name:        req.Name,
		Description: req.Description,
		LogoURL:     req.LogoURL,
		AdminID:     adminID,
		IsActive:    true,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	c.JSON(http.StatusCreated, gin.H{"brand": brand, "message": "Brand created successfully"})
}

// ListBrands retrieves all brands for the admin
func ListBrands(c *gin.Context) {
	adminID := c.GetInt("admin_id")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin ID not found"})
		return
	}

	// Get query parameters for filtering
	active := c.Query("active")

	query := `
		SELECT id, name, description, logo_url, admin_id, is_active, created_at, updated_at
		FROM brands
		WHERE admin_id = @p1
	`
	args := []interface{}{adminID}

	if active != "" {
		isActive := active == "true"
		query += " AND is_active = @p2"
		args = append(args, isActive)
	}

	query += " ORDER BY name ASC"

	rows, err := db.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch brands"})
		return
	}
	defer rows.Close()

	var brands []models.Brand
	for rows.Next() {
		var brand models.Brand
		err := rows.Scan(&brand.ID, &brand.Name, &brand.Description, &brand.LogoURL,
			&brand.AdminID, &brand.IsActive, &brand.CreatedAt, &brand.UpdatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan brand data"})
			return
		}
		brands = append(brands, brand)
	}

	c.JSON(http.StatusOK, gin.H{"brands": brands})
}

// GetBrand retrieves a specific brand by ID
func GetBrand(c *gin.Context) {
	brandID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid brand ID"})
		return
	}

	adminID := c.GetInt("admin_id")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin ID not found"})
		return
	}

	query := `
		SELECT id, name, description, logo_url, admin_id, is_active, created_at, updated_at
		FROM brands
		WHERE id = @p1 AND admin_id = @p2
	`

	var brand models.Brand
	err = db.QueryRow(query, brandID, adminID).Scan(
		&brand.ID, &brand.Name, &brand.Description, &brand.LogoURL,
		&brand.AdminID, &brand.IsActive, &brand.CreatedAt, &brand.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Brand not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch brand"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"brand": brand})
}

// UpdateBrand updates an existing brand
func UpdateBrand(c *gin.Context) {
	brandID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid brand ID"})
		return
	}

	var req UpdateBrandRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	adminID := c.GetInt("admin_id")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin ID not found"})
		return
	}

	// Check if brand exists and belongs to admin
	var existingBrand models.Brand
	checkQuery := "SELECT id FROM brands WHERE id = @p1 AND admin_id = @p2"
	err = db.QueryRow(checkQuery, brandID, adminID).Scan(&existingBrand.ID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Brand not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
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
	if req.LogoURL != "" {
		updates = append(updates, "logo_url = ?")
		args = append(args, req.LogoURL)
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
	// brandID and adminID will be appended later when constructing execArgs

	// Build SQL Server @p style UPDATE statement
	// Convert each "column = ?" fragment into "column = @pN"
	query := "UPDATE brands SET "
	for i, part := range updates {
		if i > 0 {
			query += ", "
		}
		query += replaceFirstPlaceholder(part, "@p"+strconv.Itoa(i+1))
	}
	// WHERE clause uses next two parameter indexes
	query += " WHERE id = @p" + strconv.Itoa(len(updates)+1) + " AND admin_id = @p" + strconv.Itoa(len(updates)+2)

	// Reconstruct ordered args: all update values (including updated_at) then id & admin_id
	execArgs := append([]interface{}{}, args[:len(updates)]...)
	execArgs = append(execArgs, brandID, adminID)

	if _, err = db.Exec(query, execArgs...); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update brand"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Brand updated successfully"})
}

// DeleteBrand deletes a brand
func DeleteBrand(c *gin.Context) {
	brandID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid brand ID"})
		return
	}

	adminID := c.GetInt("admin_id")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin ID not found"})
		return
	}

	// First check if brand exists and belongs to admin
	var existingBrand models.Brand
	checkQuery := "SELECT id FROM brands WHERE id = @p1 AND admin_id = @p2"
	err = db.QueryRow(checkQuery, brandID, adminID).Scan(&existingBrand.ID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Brand not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Check if brand has any folders
	var folderCount int
	folderQuery := "SELECT COUNT(*) FROM folders WHERE brand_id = ?"
	err = db.QueryRow(folderQuery, brandID).Scan(&folderCount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if folderCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete brand with existing folders. Delete folders first."})
		return
	}

	// Delete the brand
	query := "DELETE FROM brands WHERE id = @p1 AND admin_id = @p2"
	_, err = db.Exec(query, brandID, adminID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete brand"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Brand deleted successfully"})
}

// replaceFirstPlaceholder replaces the first '?' in a fragment with the provided replacement.
func replaceFirstPlaceholder(s, replacement string) string {
	for i := 0; i < len(s); i++ {
		if s[i] == '?' {
			return s[:i] + replacement + s[i+1:]
		}
	}
	return s
}
