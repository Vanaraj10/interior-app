package handlers

import (
	"context"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/Vanaraj10/interior-backend/config"
	"github.com/Vanaraj10/interior-backend/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Worker submits a project (order)
func CreateProject(c *gin.Context) {
	workerId := c.GetString("worker_id")
	adminId := c.GetString("admin_id")
	workerObjID, err := primitive.ObjectIDFromHex(workerId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid worker ID"})
		return
	}
	adminObjID, err2 := primitive.ObjectIDFromHex(adminId)
	if err2 != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid admin ID"})
		return
	}
	var req struct {
		ClientName string      `json:"clientName"`
		Phone      string      `json:"phone"`
		Address    string      `json:"address"`
		HTML       string      `json:"html"`
		RawData    interface{} `json:"rawData"`
		ProjectID  string      `json:"projectId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()

	filter := bson.M{
		"workerId": workerObjID,
		"adminId":  adminObjID,
	}
	if req.ProjectID != "" {
		filter["rawData.id"] = req.ProjectID
	} else {
		filter["clientName"] = req.ClientName
		filter["phone"] = req.Phone
		filter["address"] = req.Address
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

	update := bson.M{
		"$set": bson.M{
			"html":      html,
			"rawData":   req.RawData,
			"updatedAt": time.Now(),
		},
		"$setOnInsert": bson.M{
			"clientName":  req.ClientName,
			"phone":       req.Phone,
			"address":     req.Address,
			"createdAt":   time.Now(),
			"workerId":    workerObjID,
			"adminId":     adminObjID,
			"isCompleted": false,
		},
	}
	opts := options.Update().SetUpsert(true)
	_, err = db.Collection("projects").UpdateOne(ctx, filter, update, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save project"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Project saved/updated"})
}

// Admin lists all projects for their workers
func ListProjects(c *gin.Context) {
	adminId := c.GetString("admin_id")
	adminObjID, err := primitive.ObjectIDFromHex(adminId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid admin ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	cursor, err := db.Collection("projects").Find(ctx, bson.M{"adminId": adminObjID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}
	var projects []models.Project
	if err := cursor.All(ctx, &projects); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse projects"})
		return
	}
	c.JSON(http.StatusOK, projects)
}

// Admin gets a specific project
func GetProject(c *gin.Context) {
	adminId := c.GetString("admin_id")
	adminObjID, err := primitive.ObjectIDFromHex(adminId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid admin ID"})
		return
	}
	projectId := c.Param("id")
	projectObjID, err := primitive.ObjectIDFromHex(projectId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	var project models.Project
	err = db.Collection("projects").FindOne(ctx, bson.M{"_id": projectObjID, "adminId": adminObjID}).Decode(&project)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or not authorized"})
		return
	}
	c.JSON(http.StatusOK, project)
}

// Admin toggles isCompleted for a project
func ToggleProjectCompleted(c *gin.Context) {
	adminId := c.GetString("admin_id")
	projectId := c.Param("id")
	if adminId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	var req struct {
		IsCompleted bool `json:"isCompleted"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	objID, err := primitive.ObjectIDFromHex(projectId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}
	adminObjID, err := primitive.ObjectIDFromHex(adminId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid admin ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	res, err := db.Collection("projects").UpdateOne(ctx,
		bson.M{"_id": objID, "adminId": adminObjID},
		bson.M{"$set": bson.M{"isCompleted": req.IsCompleted}},
	)
	if err != nil || res.MatchedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update project"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// Worker toggles isCompleted for a project
func WorkerToggleProjectCompleted(c *gin.Context) {
	workerId := c.GetString("worker_id")
	workerObjID, err := primitive.ObjectIDFromHex(workerId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid worker ID"})
		return
	}
	projectId := c.Param("id")
	if workerId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	var req struct {
		IsCompleted bool `json:"isCompleted"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	objID, err := primitive.ObjectIDFromHex(projectId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	res, err := db.Collection("projects").UpdateOne(ctx,
		bson.M{"_id": objID, "workerId": workerObjID},
		bson.M{"$set": bson.M{"isCompleted": req.IsCompleted}},
	)
	if err != nil || res.MatchedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update project"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true})
}

// Worker lists all projects assigned to them
func ListWorkerProjects(c *gin.Context) {
	workerId := c.GetString("worker_id")
	workerObjID, err := primitive.ObjectIDFromHex(workerId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid worker ID"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	db := config.GetDB()
	cursor, err := db.Collection("projects").Find(ctx, bson.M{"workerId": workerObjID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch projects"})
		return
	}
	var projects []models.Project
	if err := cursor.All(ctx, &projects); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse projects"})
		return
	}
	c.JSON(http.StatusOK, projects)
}

// Admin deletes a project
func DeleteProject(c *gin.Context) {
	adminId := c.GetString("admin_id")
	projectId := c.Param("id")

	adminObjID, err := primitive.ObjectIDFromHex(adminId)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid admin ID"})
		return
	}

	projectObjID, err := primitive.ObjectIDFromHex(projectId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	db := config.GetDB()

	// Delete the project, ensuring it belongs to the admin
	res, err := db.Collection("projects").DeleteOne(ctx, bson.M{
		"_id":     projectObjID,
		"adminId": adminObjID,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete project"})
		return
	}

	if res.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or not authorized"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
}
