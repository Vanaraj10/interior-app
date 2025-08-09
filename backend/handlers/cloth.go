package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/Vanaraj10/interior-backend/models"
	"github.com/gin-gonic/gin"
)

type CreateClothRequest struct {
	Name        string  `json:"name" binding:"required"`
	Rate        float64 `json:"rate" binding:"required"`
	Description string  `json:"description"`
	ImageURL    string  `json:"imageUrl"`
	FolderID    int     `json:"folderId" binding:"required"`
	BrandID     int     `json:"brandId" binding:"required"`
}

type UpdateClothRequest struct {
	Name        string   `json:"name"`
	Rate        *float64 `json:"rate"`
	Description string   `json:"description"`
	ImageURL    string   `json:"imageUrl"`
	FolderID    *int     `json:"folderId"`
	BrandID     *int     `json:"brandId"`
	IsActive    *bool    `json:"isActive"`
}

type ClothWithDetails struct {
	models.Cloth
	FolderName string `json:"folderName"`
	BrandName  string `json:"brandName"`
}

// CreateCloth creates a new cloth item
func CreateCloth(c *gin.Context) {
	var req CreateClothRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	adminID := c.GetInt("admin_id")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin ID not found"})
		return
	}

	// Verify folder exists and belongs to admin
	var folderExists bool
	folderQuery := "SELECT COUNT(*) > 0 FROM folders WHERE id = ? AND admin_id = ? AND is_active = 1"
	err := db.QueryRow(folderQuery, req.FolderID, adminID).Scan(&folderExists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if !folderExists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid folder ID or folder is not active"})
		return
	}

	// Verify brand exists and belongs to admin
	var brandExists bool
	brandQuery := "SELECT COUNT(*) > 0 FROM brands WHERE id = ? AND admin_id = ? AND is_active = 1"
	err = db.QueryRow(brandQuery, req.BrandID, adminID).Scan(&brandExists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if !brandExists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid brand ID or brand is not active"})
		return
	}

	// Verify folder belongs to the specified brand
	var folderBrandMatch bool
	folderBrandQuery := "SELECT COUNT(*) > 0 FROM folders WHERE id = ? AND brand_id = ?"
	err = db.QueryRow(folderBrandQuery, req.FolderID, req.BrandID).Scan(&folderBrandMatch)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if !folderBrandMatch {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Folder does not belong to the specified brand"})
		return
	}

	now := time.Now()
	query := `
		INSERT INTO cloths (name, rate, description, image_url, folder_id, brand_id, admin_id,
		                   is_active, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	result, err := db.Exec(query, req.Name, req.Rate, req.Description, req.ImageURL,
		req.FolderID, req.BrandID, adminID, true, now, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cloth"})
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cloth ID"})
		return
	}

	cloth := models.Cloth{
		ID:          int(id),
		Name:        req.Name,
		Rate:        req.Rate,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		FolderID:    req.FolderID,
		BrandID:     req.BrandID,
		AdminID:     adminID,
		IsActive:    true,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	c.JSON(http.StatusCreated, gin.H{"cloth": cloth, "message": "Cloth created successfully"})
}

// ListCloths retrieves all cloths for the admin with optional filtering
func ListCloths(c *gin.Context) {
	adminID := c.GetInt("admin_id")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin ID not found"})
		return
	}

	// Get query parameters for filtering
	brandID := c.Query("brandId")
	folderID := c.Query("folderId")
	active := c.Query("active")

	baseQuery := `
		SELECT c.id, c.name, c.rate, c.description, c.image_url, c.folder_id, c.brand_id,
		       c.admin_id, c.is_active, c.created_at, c.updated_at,
		       f.name as folder_name, b.name as brand_name
		FROM cloths c
		JOIN folders f ON c.folder_id = f.id
		JOIN brands b ON c.brand_id = b.id
		WHERE c.admin_id = ?
	`
	args := []interface{}{adminID}

	if brandID != "" {
		baseQuery += " AND c.brand_id = ?"
		args = append(args, brandID)
	}

	if folderID != "" {
		baseQuery += " AND c.folder_id = ?"
		args = append(args, folderID)
	}

	if active != "" {
		isActive := active == "true"
		baseQuery += " AND c.is_active = ?"
		args = append(args, isActive)
	}

	baseQuery += " ORDER BY c.name ASC"

	rows, err := db.Query(baseQuery, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cloths"})
		return
	}
	defer rows.Close()

	var cloths []ClothWithDetails
	for rows.Next() {
		var cloth ClothWithDetails
		err := rows.Scan(
			&cloth.ID, &cloth.Name, &cloth.Rate, &cloth.Description, &cloth.ImageURL,
			&cloth.FolderID, &cloth.BrandID, &cloth.AdminID, &cloth.IsActive,
			&cloth.CreatedAt, &cloth.UpdatedAt, &cloth.FolderName, &cloth.BrandName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan cloth data"})
			return
		}
		cloths = append(cloths, cloth)
	}

	c.JSON(http.StatusOK, gin.H{"cloths": cloths})
}

// GetCloth retrieves a specific cloth by ID
func GetCloth(c *gin.Context) {
	clothID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cloth ID"})
		return
	}

	adminID := c.GetInt("admin_id")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin ID not found"})
		return
	}

	query := `
		SELECT c.id, c.name, c.rate, c.description, c.image_url, c.folder_id, c.brand_id,
		       c.admin_id, c.is_active, c.created_at, c.updated_at,
		       f.name as folder_name, b.name as brand_name
		FROM cloths c
		JOIN folders f ON c.folder_id = f.id
		JOIN brands b ON c.brand_id = b.id
		WHERE c.id = ? AND c.admin_id = ?
	`

	var cloth ClothWithDetails
	err = db.QueryRow(query, clothID, adminID).Scan(
		&cloth.ID, &cloth.Name, &cloth.Rate, &cloth.Description, &cloth.ImageURL,
		&cloth.FolderID, &cloth.BrandID, &cloth.AdminID, &cloth.IsActive,
		&cloth.CreatedAt, &cloth.UpdatedAt, &cloth.FolderName, &cloth.BrandName)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cloth not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cloth"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"cloth": cloth})
}

// UpdateCloth updates an existing cloth
func UpdateCloth(c *gin.Context) {
	clothID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cloth ID"})
		return
	}

	var req UpdateClothRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	adminID := c.GetInt("admin_id")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin ID not found"})
		return
	}

	// Check if cloth exists and belongs to admin
	var existingCloth models.Cloth
	checkQuery := "SELECT id FROM cloths WHERE id = ? AND admin_id = ?"
	err = db.QueryRow(checkQuery, clothID, adminID).Scan(&existingCloth.ID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cloth not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// If folder/brand IDs are being updated, verify they exist and belong to admin
	if req.FolderID != nil {
		var folderExists bool
		folderQuery := "SELECT COUNT(*) > 0 FROM folders WHERE id = ? AND admin_id = ? AND is_active = 1"
		err := db.QueryRow(folderQuery, *req.FolderID, adminID).Scan(&folderExists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		if !folderExists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid folder ID or folder is not active"})
			return
		}
	}

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

	// If both folder and brand are being updated, verify they match
	if req.FolderID != nil && req.BrandID != nil {
		var folderBrandMatch bool
		folderBrandQuery := "SELECT COUNT(*) > 0 FROM folders WHERE id = ? AND brand_id = ?"
		err = db.QueryRow(folderBrandQuery, *req.FolderID, *req.BrandID).Scan(&folderBrandMatch)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		if !folderBrandMatch {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Folder does not belong to the specified brand"})
			return
		}
	}

	// If only folder is being updated, verify it belongs to the current brand
	if req.FolderID != nil && req.BrandID == nil {
		var currentBrandID int
		brandIDQuery := "SELECT brand_id FROM cloths WHERE id = ?"
		err = db.QueryRow(brandIDQuery, clothID).Scan(&currentBrandID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}

		var folderBrandMatch bool
		folderBrandQuery := "SELECT COUNT(*) > 0 FROM folders WHERE id = ? AND brand_id = ?"
		err = db.QueryRow(folderBrandQuery, *req.FolderID, currentBrandID).Scan(&folderBrandMatch)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		if !folderBrandMatch {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Folder does not belong to the current brand"})
			return
		}
	}

	// If only brand is being updated, verify the current folder belongs to the new brand
	if req.BrandID != nil && req.FolderID == nil {
		var currentFolderID int
		folderIDQuery := "SELECT folder_id FROM cloths WHERE id = ?"
		err = db.QueryRow(folderIDQuery, clothID).Scan(&currentFolderID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}

		var folderBrandMatch bool
		folderBrandQuery := "SELECT COUNT(*) > 0 FROM folders WHERE id = ? AND brand_id = ?"
		err = db.QueryRow(folderBrandQuery, currentFolderID, *req.BrandID).Scan(&folderBrandMatch)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		if !folderBrandMatch {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Current folder does not belong to the specified brand"})
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
	if req.Rate != nil {
		updates = append(updates, "rate = ?")
		args = append(args, *req.Rate)
	}
	if req.Description != "" {
		updates = append(updates, "description = ?")
		args = append(args, req.Description)
	}
	if req.ImageURL != "" {
		updates = append(updates, "image_url = ?")
		args = append(args, req.ImageURL)
	}
	if req.FolderID != nil {
		updates = append(updates, "folder_id = ?")
		args = append(args, *req.FolderID)
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
	args = append(args, clothID, adminID)

	query := "UPDATE cloths SET " + updates[0]
	for i := 1; i < len(updates); i++ {
		query += ", " + updates[i]
	}
	query += " WHERE id = ? AND admin_id = ?"

	_, err = db.Exec(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cloth"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cloth updated successfully"})
}

// DeleteCloth deletes a cloth
func DeleteCloth(c *gin.Context) {
	clothID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cloth ID"})
		return
	}

	adminID := c.GetInt("admin_id")
	if adminID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin ID not found"})
		return
	}

	// First check if cloth exists and belongs to admin
	var existingCloth models.Cloth
	checkQuery := "SELECT id FROM cloths WHERE id = ? AND admin_id = ?"
	err = db.QueryRow(checkQuery, clothID, adminID).Scan(&existingCloth.ID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cloth not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Delete the cloth
	query := "DELETE FROM cloths WHERE id = ? AND admin_id = ?"
	_, err = db.Exec(query, clothID, adminID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete cloth"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cloth deleted successfully"})
}
