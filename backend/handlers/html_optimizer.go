package handlers

import (
	"net/http"
	"regexp"
	"strings"

	"github.com/Vanaraj10/interior-backend/models"
	"github.com/gin-gonic/gin"
)

// HTMLOptimizer provides methods for optimizing HTML storage
type HTMLOptimizer struct{}

// NewHTMLOptimizer creates a new HTMLOptimizer instance
func NewHTMLOptimizer() *HTMLOptimizer {
	return &HTMLOptimizer{}
}

// OptimizeHTML cleans and optimizes HTML for storage
// Removes backslashes, normalizes whitespace, and converts styles to classes
func (h *HTMLOptimizer) OptimizeHTML(html string) string {
	// Remove all backslashes (\\), excessive whitespace
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

	// Apply common class transformations for inline styles
	html = h.replaceInlineStylesWithClasses(html)

	return html
}

// ExtractBodyContent extracts only the body content from HTML
// This reduces storage by removing redundant head, style, and script tags
func (h *HTMLOptimizer) ExtractBodyContent(html string) string {
	// If the HTML doesn't contain body tags, return it as is
	if !strings.Contains(html, "<body") {
		return html
	}
	
	bodyMatch := regexp.MustCompile(`(?is)<body[^>]*>([\s\S]*?)</body>`).FindStringSubmatch(html)
	if len(bodyMatch) > 1 {
		return bodyMatch[1]
	}
	return html
}

// replaceInlineStylesWithClasses replaces common inline styles with class names
func (h *HTMLOptimizer) replaceInlineStylesWithClasses(html string) string {
	// Define common style-to-class mappings
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

	// Replace repeated inline style patterns with classes
	html = strings.ReplaceAll(html, "style='padding: 8px; border: 1px solid #ddd; text-align: center'", "class='cell-center'")
	html = strings.ReplaceAll(html, "style=\"padding: 8px; border: 1px solid #ddd; text-align: center\"", "class='cell-center'")
	html = strings.ReplaceAll(html, "style='padding: 8px; border: 1px solid #ddd; text-align: right'", "class='cell-right'")
	html = strings.ReplaceAll(html, "style=\"padding: 8px; border: 1px solid #ddd; text-align: right\"", "class='cell-right'")
	html = strings.ReplaceAll(html, "style='padding: 8px; border: 1px solid #ddd; text-align: left'", "class='cell-left'")
	html = strings.ReplaceAll(html, "style=\"padding: 8px; border: 1px solid #ddd; text-align: left\"", "class='cell-left'")

	return html
}

// ProjectHTMLData represents the optimized HTML content structure
type ProjectHTMLData struct {
	BodyContent   string `json:"bodyContent"`   // The main HTML content (body only)
	ProjectType   string `json:"projectType"`   // Type of project (curtain, blinds, etc.)
	ClientDetails string `json:"clientDetails"` // Client information HTML section
}

// OptimizeProjectHTML optimizes project HTML by separating it into components
// for more efficient storage and easier templating
func (h *HTMLOptimizer) OptimizeProjectHTML(html string) *ProjectHTMLData {
	bodyContent := h.ExtractBodyContent(html)
	
	// Extract project type from HTML content
	projectType := "unknown"
	typeRegex := regexp.MustCompile(`(?i)(curtain|blinds|flooring|wallpaper|mosquito.?net)`)
	typeMatch := typeRegex.FindStringSubmatch(bodyContent)
	if len(typeMatch) > 1 {
		projectType = strings.ToLower(typeMatch[1])
	}
	
	// Extract client details section
	clientDetails := ""
	clientDetailsRegex := regexp.MustCompile(`(?is)<div class=['"]client-details['"]>(.*?)</div>`)
	clientMatch := clientDetailsRegex.FindStringSubmatch(bodyContent)
	if len(clientMatch) > 1 {
		clientDetails = clientMatch[1]
	}
	
	return &ProjectHTMLData{
		BodyContent:   bodyContent,
		ProjectType:   projectType,
		ClientDetails: clientDetails,
	}
}

// CreateProjectHTMLFromData reconstructs full HTML from optimized components
func (h *HTMLOptimizer) CreateProjectHTMLFromData(data *ProjectHTMLData) string {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel='stylesheet' href='/global.css'>
    <title>Interior Quotation</title>
</head>
<body>
    ${data.BodyContent}
</body>
</html>`
}
