package handlers

import (
	"encoding/json"
)

// reconstructProjectHTML takes the stored JSON string containing optimized HTML components
// and reconstructs it into a full HTML document for display in the admin panel
func reconstructProjectHTML(htmlJSON string) (string, error) {
	var htmlData ProjectHTMLData
	
	// Parse the JSON string back into our structured data
	if err := json.Unmarshal([]byte(htmlJSON), &htmlData); err != nil {
		// If this fails, it might be old format HTML content
		// Just return the original string
		return htmlJSON, nil
	}
	
	// Use the HTML optimizer to create a full HTML document
	optimizer := NewHTMLOptimizer()
	return optimizer.CreateProjectHTMLFromData(&htmlData), nil
}
