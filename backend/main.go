package main

import (
	"net/http"

	"github.com/Vanaraj10/interior-backend/config"
	"github.com/Vanaraj10/interior-backend/handlers"
	"github.com/Vanaraj10/interior-backend/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	config.ConnectMongoDB() // Connect to MongoDB at startup

	r := gin.Default()

	// Add CORS middleware (allow all origins, methods, and headers)
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
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

	adminGroup := r.Group("/api").Use(middleware.AdminAuthMiddleware())
	{
		adminGroup.POST("/workers", handlers.CreateWorker)
		adminGroup.DELETE("/workers/:id", handlers.DeleteWorker)
		adminGroup.GET("/workers", handlers.ListWorkers)
		adminGroup.GET("/projects", handlers.ListProjects)
		adminGroup.GET("/projects/:id", handlers.GetProject)
		adminGroup.PUT("/projects/:id/completed", handlers.ToggleProjectCompleted)
		adminGroup.PUT("/admin/password", handlers.ChangeAdminPassword)
	}

	workerGroup := r.Group("/api").Use(middleware.WorkerAuthMiddleware())
	{
		workerGroup.POST("/projects", handlers.CreateProject)
		workerGroup.PUT("/projects/:id/completed", handlers.WorkerToggleProjectCompleted)
	}

	r.Run(":8080") // listen and serve on 0.0.0.0:8080
}
