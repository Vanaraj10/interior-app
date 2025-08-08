package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/Vanaraj10/interior-backend/config"
	"github.com/Vanaraj10/interior-backend/models"
	"github.com/gin-gonic/gin"
)

// Helper function for min
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

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

	// Debug log the raw HTML from database
	println("Raw HTML from DB (first 200 chars):", p.HTML[:min(200, len(p.HTML))])

	// Reconstruct full HTML from optimized storage format
	reconstructedHTML, err := reconstructProjectHTML(p.HTML)
	if err == nil {
		p.HTML = reconstructedHTML
		println("HTML successfully reconstructed (length):", len(reconstructedHTML))
	} else {
		println("HTML reconstruction failed:", err.Error())
	}

	c.JSON(http.StatusOK, p)
}

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

// Admin generates stitching unit quotation for curtain projects
func GenerateStitchingQuotation(c *gin.Context) {
	adminId := c.GetInt("admin_id")
	projectId := c.Param("id")

	db := config.GetDB()
	var p models.Project
	err := db.QueryRow(`SELECT id, client_name, phone, address, html, raw_data, worker_id, admin_id, is_completed, created_at, updated_at FROM projects WHERE id = @p1 AND admin_id = @p2`, projectId, adminId).Scan(&p.ID, &p.ClientName, &p.Phone, &p.Address, &p.HTML, &p.RawData, &p.WorkerID, &p.AdminID, &p.IsCompleted, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found or not authorized"})
		return
	} // Parse raw data to extract curtain measurements
	if p.RawData == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No raw data found for this project"})
		return
	}

	// Debug log - show first 200 characters of raw data
	debugData := p.RawData
	if len(debugData) > 200 {
		debugData = debugData[:200] + "..."
	}

	var rawData map[string]interface{}
	if err := json.Unmarshal([]byte(p.RawData), &rawData); err != nil {
		fmt.Printf("JSON parsing error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to parse project data: %v", err)})
		return
	} // Check if this is a curtain project
	measurements, ok := rawData["measurements"].([]interface{})
	if !ok {
		keys := make([]string, 0, len(rawData))
		for k := range rawData {
			keys = append(keys, k)
		}
		fmt.Printf("Measurements not found or not array. Available keys: %v\n", keys)
		c.JSON(http.StatusBadRequest, gin.H{"error": "No measurements array found in project data"})
		return
	}

	if len(measurements) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No measurements found"})
		return
	}

	fmt.Printf("Found %d measurements\n", len(measurements))
	// Check if any measurement is for curtains
	hasCurtains := false
	for i, m := range measurements {
		if measurement, ok := m.(map[string]interface{}); ok {
			if interiorType, exists := measurement["interiorType"]; exists {
				fmt.Printf("Measurement %d: interiorType = %v\n", i, interiorType)
				if interiorType == "curtains" {
					hasCurtains = true
					break
				}
			} else {
				fmt.Printf("Measurement %d: no interiorType field\n", i)
			}
		} else {
			fmt.Printf("Measurement %d: not a map\n", i)
		}
	}

	fmt.Printf("Has curtains: %v\n", hasCurtains)

	if !hasCurtains {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This project does not contain curtain measurements"})
		return
	}

	// Generate stitching-specific HTML content
	stitchingHTML := generateStitchingHTML(p, rawData)

	c.JSON(http.StatusOK, gin.H{
		"html":       stitchingHTML,
		"clientName": p.ClientName,
		"projectId":  p.ID,
	})
}

func generateStitchingHTML(project models.Project, rawData map[string]interface{}) string {
	measurements, _ := rawData["measurements"].([]interface{})
	rooms, _ := rawData["rooms"].([]interface{})

	// Create a map of rooms for easy lookup
	roomMap := make(map[string]interface{})
	for _, room := range rooms {
		if r, ok := room.(map[string]interface{}); ok {
			if id, exists := r["id"]; exists {
				roomMap[id.(string)] = r
			}
		}
	}

	html := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Stitching Unit Quotation - ` + project.ClientName + `</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
        .client-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .section-title { font-size: 18px; font-weight: bold; color: #2563eb; margin: 25px 0 15px 0; border-bottom: 2px solid #2563eb; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #2563eb; color: white; padding: 12px 8px; text-align: center; font-weight: bold; border: 1px solid #2563eb; }
        td { padding: 10px 8px; border: 1px solid #ddd; vertical-align: top; }
        tr:nth-child(even) td { background-color: #f8f9fa; }
        .room-section { margin-bottom: 30px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .room-header { background: #6b7280; color: white; padding: 10px 15px; margin: -15px -15px 15px -15px; font-weight: bold; border-radius: 8px 8px 0 0; }
        .measurement-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
        .detail-box { background: #f0f9ff; padding: 10px; border-radius: 6px; border-left: 4px solid #2563eb; }
        .detail-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
        .detail-value { color: #1f2937; }
        .parts-highlight { background: #fef3c7; padding: 8px; border-radius: 6px; border-left: 4px solid #f59e0b; }
        .bold { font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>STITCHING UNIT QUOTATION</h1>
        <div style="font-size: 16px; margin-top: 10px;">Technical Specifications for Production</div>
    </div>

    <div class="client-info">
        <h3 style="margin-top: 0; color: #2563eb;">Client Information</h3>
        <div class="info-row">
            <span class="bold">Client Name:</span>
            <span>` + project.ClientName + `</span>
        </div>
        <div class="info-row">
            <span class="bold">Phone:</span>
            <span>` + project.Phone + `</span>
        </div>
        <div class="info-row">
            <span class="bold">Address:</span>
            <span>` + project.Address + `</span>
        </div>
        <div class="info-row">
            <span class="bold">Project ID:</span>
            <span>#` + fmt.Sprintf("%d", project.ID) + `</span>
        </div>
    </div>

    <div class="section-title">CURTAIN MEASUREMENTS & STITCHING DETAILS</div>
`

	// Process curtain measurements grouped by room
	roomMeasurements := make(map[string][]map[string]interface{})

	for _, m := range measurements {
		if measurement, ok := m.(map[string]interface{}); ok {
			if interiorType, exists := measurement["interiorType"]; exists && interiorType == "curtains" {
				roomId := ""
				if rid, exists := measurement["roomId"]; exists && rid != nil {
					roomId = rid.(string)
				} else {
					roomId = "other"
				}

				if roomMeasurements[roomId] == nil {
					roomMeasurements[roomId] = make([]map[string]interface{}, 0)
				}
				roomMeasurements[roomId] = append(roomMeasurements[roomId], measurement)
			}
		}
	}

	// Generate HTML for each room
	for roomId, measurements := range roomMeasurements {
		roomName := "Other Measurements"
		if roomId != "other" {
			if room, exists := roomMap[roomId]; exists {
				if r, ok := room.(map[string]interface{}); ok {
					if name, exists := r["name"]; exists {
						roomName = name.(string)
					}
				}
			}
		}

		html += `
    <div class="room-section">
        <div class="room-header">Room: ` + roomName + `</div>

        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 20%;">Item/Location</th>
                    <th style="width: 12%;">Width</th>
                    <th style="width: 12%;">Height</th>
                    <th style="width: 12%;">Parts</th>
                    <th style="width: 20%;">Stitching Model</th>
                    <th style="width: 19%;">Special Instructions</th>
                </tr>
            </thead>
            <tbody>`

		for i, measurement := range measurements {
			width := getStringValue(measurement, "width", "0")
			height := getStringValue(measurement, "height", "0")
			parts := getStringValue(measurement, "parts", "1")
			if parts == "" {
				parts = getStringValue(measurement, "pieces", "1")
			}
			stitchingModel := getStringValue(measurement, "stitchingModel", "N/A")
			if stitchingModel == "" {
				stitchingModel = getStringValue(measurement, "curtainType", "N/A")
			}
			roomLabel := getStringValue(measurement, "roomLabel", "Item "+(fmt.Sprintf("%d", i+1)))
			opening := getStringValue(measurement, "opening", "")
			hasLining := getBoolValue(measurement, "hasLining")
			liningModel := getStringValue(measurement, "liningModel", "")

			specialInstructions := ""
			if opening != "" {
				specialInstructions += "Opening: " + opening
			}
			if hasLining {
				if specialInstructions != "" {
					specialInstructions += "<br>"
				}
				specialInstructions += "With Lining"
				if liningModel != "" {
					specialInstructions += " (" + liningModel + ")"
				}
			}
			if specialInstructions == "" {
				specialInstructions = "-"
			}

			html += `
                <tr>
                    <td style="text-align: center;">` + fmt.Sprintf("%d", i+1) + `</td>
                    <td>` + roomLabel + `</td>
                    <td style="text-align: center;">` + width + `"</td>
                    <td style="text-align: center;">` + height + `"</td>
                    <td style="text-align: center;"><div class="parts-highlight">` + parts + ` parts</div></td>
                    <td style="text-align: center;">` + stitchingModel + `</td>
                    <td>` + specialInstructions + `</td>
                </tr>`
		}

		html += `
            </tbody>
        </table>
    </div>`
	}

	html += `
    <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #2563eb;">
        <h3 style="margin-top: 0; color: #2563eb;">IMPORTANT NOTES FOR STITCHING UNIT:</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
            <li>All measurements are in inches</li>
            <li>Parts calculation is based on width optimization for standard cloth width</li>
            <li>Verify lining requirements before cutting</li>
            <li>Follow stitching model specifications exactly</li>
            <li>Contact client for any clarifications before proceeding</li>
        </ul>
    </div>

    <div style="margin-top: 30px; text-align: center; padding: 15px; background: #2563eb; color: white; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px;">Generated on ` + project.CreatedAt.Format("2006-01-02 15:04:05") + ` | Project ID: #` + fmt.Sprintf("%d", project.ID) + `</p>
    </div>
</body>
</html>`

	return html
}

// Helper functions for safe value extraction
func getStringValue(data map[string]interface{}, key, defaultValue string) string {
	if val, exists := data[key]; exists && val != nil {
		if str, ok := val.(string); ok {
			return str
		}
		// Try to convert number to string
		if num, ok := val.(float64); ok {
			return fmt.Sprintf("%.0f", num)
		}
	}
	return defaultValue
}

func getBoolValue(data map[string]interface{}, key string) bool {
	if val, exists := data[key]; exists && val != nil {
		if b, ok := val.(bool); ok {
			return b
		}
	}
	return false
}
