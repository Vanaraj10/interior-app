package main

import (
	"log"
	"net/http"
	"os"

	"github.com/Vanaraj10/interior-backend/config"
	"github.com/Vanaraj10/interior-backend/handlers"
	"github.com/Vanaraj10/interior-backend/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	config.ConnectAzureSQL() // Connect to Azure SQL at startup

	// Create database tables if they don't exist
	createDatabaseTables()

	r := gin.Default()

	// Add CORS middleware (allow all origins, methods, and headers)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Allow all origins
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Health check endpoint
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	r.POST("/api/admin/login", handlers.AdminLogin)
	r.POST("/api/worker/login", handlers.WorkerLogin)
	adminGroup := r.Group("/api/admin").Use(middleware.AdminAuthMiddleware())
	{
		adminGroup.POST("/workers", handlers.CreateWorker)
		adminGroup.DELETE("/workers/:id", handlers.DeleteWorker)
		adminGroup.GET("/workers", handlers.ListWorkers)
		adminGroup.GET("/projects", handlers.ListProjects)
		adminGroup.GET("/projects/:id", handlers.GetProject)
		adminGroup.GET("/projects/:id/stitching-quotation", handlers.GenerateStitchingQuotation)
		adminGroup.PUT("/projects/:id/completed", handlers.ToggleProjectCompleted)
		adminGroup.DELETE("/projects/:id", handlers.DeleteProject)
		adminGroup.PUT("/password", handlers.ChangeAdminPassword)

		// Brand routes
		adminGroup.POST("/brands", handlers.CreateBrand)
		adminGroup.GET("/brands", handlers.ListBrands)
		adminGroup.GET("/brands/:id", handlers.GetBrand)
		adminGroup.PUT("/brands/:id", handlers.UpdateBrand)
		adminGroup.DELETE("/brands/:id", handlers.DeleteBrand)

		// Folder routes
		adminGroup.POST("/folders", handlers.CreateFolder)
		adminGroup.GET("/folders", handlers.ListFolders)
		adminGroup.GET("/folders/:id", handlers.GetFolder)
		adminGroup.PUT("/folders/:id", handlers.UpdateFolder)
		adminGroup.DELETE("/folders/:id", handlers.DeleteFolder)

		// Cloth routes
		adminGroup.POST("/cloths", handlers.CreateCloth)
		adminGroup.GET("/cloths", handlers.ListCloths)
		adminGroup.GET("/cloths/:id", handlers.GetCloth)
		adminGroup.PUT("/cloths/:id", handlers.UpdateCloth)
		adminGroup.DELETE("/cloths/:id", handlers.DeleteCloth)
	}

	workerGroup := r.Group("/api/worker").Use(middleware.WorkerAuthMiddleware())
	{
		workerGroup.POST("/projects", handlers.CreateProject)
		workerGroup.PUT("/projects/:id/completed", handlers.WorkerToggleProjectCompleted)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port) // listen and serve on 0.0.0.0:PORT
}

// createDatabaseTables creates the necessary database tables if they don't exist
func createDatabaseTables() {
	// Create brands table
	brandsTable := `
	IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='brands' and xtype='U')
	CREATE TABLE brands (
		id INT IDENTITY(1,1) PRIMARY KEY,
		name NVARCHAR(100) NOT NULL,
		description NVARCHAR(MAX),
		logo_url NVARCHAR(255),
		admin_id INT NOT NULL,
		is_active BIT NOT NULL DEFAULT 1,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL
	)
	`
	_, err := config.GetDB().Exec(brandsTable)
	if err != nil {
		log.Printf("Error creating brands table: %v", err)
	}

	// Create folders table
	foldersTable := `
	IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='folders' and xtype='U')
	CREATE TABLE folders (
		id INT IDENTITY(1,1) PRIMARY KEY,
		name NVARCHAR(100) NOT NULL,
		description NVARCHAR(MAX),
		brand_id INT NOT NULL,
		admin_id INT NOT NULL,
		is_active BIT NOT NULL DEFAULT 1,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL,
		FOREIGN KEY (brand_id) REFERENCES brands(id)
	)
	`
	_, err = config.GetDB().Exec(foldersTable)
	if err != nil {
		log.Printf("Error creating folders table: %v", err)
	}

	// Create cloths table
	clothsTable := `
	IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='cloths' and xtype='U')
	CREATE TABLE cloths (
		id INT IDENTITY(1,1) PRIMARY KEY,
		name NVARCHAR(100) NOT NULL,
		rate DECIMAL(10, 2) NOT NULL,
		description NVARCHAR(MAX),
		image_url NVARCHAR(255),
		folder_id INT NOT NULL,
		brand_id INT NOT NULL,
		admin_id INT NOT NULL,
		is_active BIT NOT NULL DEFAULT 1,
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL,
		FOREIGN KEY (folder_id) REFERENCES folders(id),
		FOREIGN KEY (brand_id) REFERENCES brands(id)
	)
	`
	_, err = config.GetDB().Exec(clothsTable)
	if err != nil {
		log.Printf("Error creating cloths table: %v", err)
	}
}
