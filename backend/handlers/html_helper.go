package handlers

import (
	"encoding/json"
	"log"
)

// reconstructProjectHTML takes the stored JSON string containing optimized HTML components
// and reconstructs it into a full HTML document for display in the admin panel
func reconstructProjectHTML(htmlJSON string) (string, error) {
	// Log the incoming data for debugging
	log.Printf("Reconstructing HTML from JSON (length: %d)", len(htmlJSON))

	var htmlData ProjectHTMLData

	// Parse the JSON string back into our structured data
	if err := json.Unmarshal([]byte(htmlJSON), &htmlData); err != nil {
		// If this fails, it might be old format HTML content
		log.Printf("Failed to unmarshal HTML JSON, treating as raw HTML: %v", err)
		return htmlJSON, nil
	}

	// Log the parsed data
	log.Printf("Successfully parsed HTML data - ProjectType: %s, BodyContent length: %d",
		htmlData.ProjectType, len(htmlData.BodyContent))

	// Use the HTML optimizer to create a full HTML document
	optimizer := NewHTMLOptimizer()
	reconstructedHTML := optimizer.CreateProjectHTMLFromData(&htmlData)

	log.Printf("Successfully reconstructed HTML (length: %d)", len(reconstructedHTML))
	return reconstructedHTML, nil
}
