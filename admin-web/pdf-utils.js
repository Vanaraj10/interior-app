/**
 * PDF Utilities for Admin Panel
 * This module provides utilities for creating, displaying, and downloading PDFs 
 * with optimized storage and professional formatting.
 */

// Core styling that can be reused across PDFs
const PDF_CORE_STYLES = `
    body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #fff;
    }

    .header {
        background-color: #f0f9ff;
        padding: 10px;
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid #e0e7ff;
    }

    .client-info {
        margin: 20px 0;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #fafafa;
    }

    .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        padding: 5px 0;
        border-bottom: 1px solid #eee;
    }

    .info-row:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }

    /* Utility classes */
    .bold { font-weight: bold; }
    .text-xs { font-size: 10px; }
    .text-sm { font-size: 12px; }
    .text-base { font-size: 14px; }
    .text-lg { font-size: 18px; }
    .text-xl { font-size: 20px; }
    .text-2xl { font-size: 24px; }
    .text-primary { color: #3b82f6; }
    .text-muted { color: #666; }
    .text-success { color: #10b981; }
    .text-warning { color: #f59e0b; }
    .text-danger { color: #ef4444; }
    .bg-summary { background-color: #f0f9ff; }
    .bg-light { background-color: #f8f9fa; }
    .bg-primary { background-color: #3b82f6; color: white; }
    .rounded { border-radius: 8px; }
    .rounded-sm { border-radius: 4px; }
    .rounded-lg { border-radius: 12px; }
    .border { border: 1px solid #ddd; }
    .border-thick { border: 2px solid #ddd; }
    .p-1 { padding: 4px; }
    .p-2 { padding: 8px; }
    .p-3 { padding: 12px; }
    .p-4 { padding: 16px; }
    .px-2 { padding-left: 8px; padding-right: 8px; }
    .px-3 { padding-left: 12px; padding-right: 12px; }
    .py-2 { padding-top: 8px; padding-bottom: 8px; }
    .py-3 { padding-top: 12px; padding-bottom: 12px; }
    .m-1 { margin: 4px; }
    .m-2 { margin: 8px; }
    .m-3 { margin: 12px; }
    .mb-2 { margin-bottom: 8px; }
    .mb-3 { margin-bottom: 12px; }
    .mt-2 { margin-top: 8px; }
    .mt-3 { margin-top: 12px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }

    /* Cell styling */
    .cell-center {
        padding: 8px;
        border: 1px solid #ddd;
        text-align: center;
        background-color: #fafafa;
    }

    .cell-right {
        padding: 8px;
        border: 1px solid #ddd;
        text-align: right;
        background-color: #fafafa;
    }

    .cell-left {
        padding: 8px;
        border: 1px solid #ddd;
        text-align: left;
        background-color: #fafafa;
    }

    /* Table styling */
    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        font-size: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border-radius: 8px;
        overflow: hidden;
    }

    th {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        padding: 12px 8px;
        text-align: center;
        font-weight: bold;
        border: 1px solid #2563eb;
        position: relative;
    }

    th::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    }

    td {
        padding: 10px 8px;
        border: 1px solid #ddd;
        background-color: #fff;
        transition: background-color 0.2s ease;
    }

    tr:nth-child(even) td {
        background-color: #f8f9fa;
    }

    /* Summary sections */
    .cost-summary {
        margin-top: 20px;
        padding: 15px;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
        border-radius: 8px;
        border: 1px solid #c7d2fe;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .cost-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        padding: 4px 0;
        border-bottom: 1px solid #e0e7ff;
    }

    .cost-row:last-child {
        border-bottom: 2px solid #3b82f6;
        font-weight: bold;
        font-size: 16px;
        padding-top: 8px;
        margin-top: 8px;
    }

    .section-header {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        padding: 12px 16px;
        margin: 20px 0 10px 0;
        border-radius: 8px;
        font-weight: bold;
        font-size: 16px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
    }

    /* Project-specific classes */
    .project-title {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        color: #1f2937;
        margin-bottom: 20px;
        padding: 15px;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
        border-radius: 8px;
        border: 1px solid #c7d2fe;
    }

    /* Print styles */
    @media print {
        * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 15px !important;
            font-size: 12px !important;
        }
        
        .header, th, .section-header, .measurement-header, .total-summary, 
        .cost-summary, .client-info, .project-title {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-inside: avoid !important;
        }
        
        /* Page break controls */
        .measurement-section {
            page-break-inside: avoid !important;
        }
    }
`;

/**
 * Creates a standalone HTML document with proper styling for PDF generation
 * @param {Object} project - The project object containing HTML content
 * @returns {string} Complete HTML document ready for PDF generation
 */
function createStandaloneHTML(project) {
    // Extract only the body content from the project HTML
    const bodyContent = extractBodyContent(project.html);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="print-color-adjust" content="exact">
    <title>Interior Quotation - ${project.clientName}</title>
    <style>
        ${PDF_CORE_STYLES}
        
        /* Additional rendering optimizations for PDF */
        @page {
            margin: 0.5in;
            size: A4;
        }
        
        body {
            margin: 0 !important;
            padding: 20px !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
    </style>
</head>
<body>
    ${bodyContent}
    
    <script>
        // Ensure styles are fully loaded before any print operation
        window.addEventListener('beforeprint', function() {
            // Force style recalculation
            document.body.offsetHeight;
        });
        
        // Wait for all content to load
        window.addEventListener('load', function() {
            setTimeout(function() {
                document.body.style.visibility = 'visible';
            }, 100);
        });
        
        // Force color rendering for all elements
        document.addEventListener('DOMContentLoaded', function() {
            const elements = document.querySelectorAll('*');
            elements.forEach(el => {
                el.style.webkitPrintColorAdjust = 'exact';
                el.style.colorAdjust = 'exact';
                el.style.printColorAdjust = 'exact';
            });
        });
    </script>
</body>
</html>`;
}

/**
 * Extract only the body content from a complete HTML string
 * @param {string} html - Full HTML content
 * @returns {string} Only the body content
 */
function extractBodyContent(html) {
    // If the HTML doesn't contain body tags, return it as is
    if (!html.includes('<body')) {
        return html;
    }
    
    const bodyMatch = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
    return bodyMatch ? bodyMatch[1].trim() : html;
}

/**
 * Displays a project's HTML content in an iframe with proper styling
 * @param {Object} project - Project object containing HTML content
 * @param {HTMLElement} container - Container element to append iframe to
 * @returns {HTMLIFrameElement} The created iframe element
 */
function displayProjectHTML(project, container) {
    // Clear container
    container.innerHTML = '';
    
    if (!project.html) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No HTML content available</p>';
        return null;
    }
    
    // Debug log
    console.log('Displaying project HTML (length):', project.html.length);
    console.log('HTML preview:', project.html.substring(0, 200));
    
    // Check if we received JSON instead of HTML (fallback handling)
    let htmlContent = project.html;
    if (htmlContent.startsWith('{') && htmlContent.includes('bodyContent')) {
        console.warn('Received JSON data instead of reconstructed HTML, attempting to parse...');
        try {
            const jsonData = JSON.parse(htmlContent);
            if (jsonData.bodyContent) {
                // Manually decode the HTML entities
                htmlContent = jsonData.bodyContent
                    .replace(/\\u003c/g, '<')
                    .replace(/\\u003e/g, '>')
                    .replace(/\\u0026/g, '&')
                    .replace(/\\u0027/g, "'")
                    .replace(/\\u0022/g, '"')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'");
                
                console.log('Successfully decoded JSON bodyContent');
            }
        } catch (e) {
            console.error('Failed to parse JSON data:', e);
        }
    }
    
    // Create iframe for isolated HTML rendering
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.minHeight = '400px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '0.5rem';
    
    container.appendChild(iframe);
      // Complete CSS styles to embed - Full global.css styles
    const embeddedCSS = `
        /* Professional Interior Quotation Styles - Complete */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #fff;
            margin: 0;
            padding: 20px;
        }

        /* Header styling */
        .header {
            background-color: #f0f9ff;
            padding: 10px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #e0e7ff;
        }

        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 5px;
        }

        .company-subtitle {
            font-size: 14px;
            color: #666;
        }

        /* Client information section */
        .client-info {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #fafafa;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }

        .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }

        /* Enhanced table styling */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }

        th {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 12px 8px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #2563eb;
            position: relative;
        }

        th::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
        }

        td {
            padding: 10px 8px;
            border: 1px solid #ddd;
            background-color: #fff;
            transition: background-color 0.2s ease;
        }

        tr:nth-child(even) td {
            background-color: #f8f9fa;
        }

        tr:hover td {
            background-color: #e3f2fd;
        }

        /* Cost summary styling */
        .cost-summary {
            margin-top: 20px;
            padding: 15px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
            border-radius: 8px;
            border: 1px solid #c7d2fe;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .cost-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 4px 0;
            border-bottom: 1px solid #e0e7ff;
        }

        .cost-row:last-child {
            border-bottom: 2px solid #3b82f6;
            font-weight: bold;
            font-size: 16px;
            padding-top: 8px;
            margin-top: 8px;
        }

        .cost-row .cost-label {
            color: #374151;
            font-weight: 500;
        }

        .cost-row .cost-value {
            color: #1f2937;
            font-weight: 600;
        }

        /* Section headers */
        .section-header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 12px 16px;
            margin: 20px 0 10px 0;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }

        /* Measurement sections */
        .measurement-section {
            margin-bottom: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }

        .measurement-header {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            color: white;
            padding: 10px 15px;
            font-weight: 600;
            font-size: 14px;
        }

        .measurement-content {
            padding: 15px;
            background-color: #fff;
        }

        /* Project-specific classes */
        .project-title {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            color: #1f2937;
            margin-bottom: 20px;
            padding: 15px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
            border-radius: 8px;
            border: 1px solid #c7d2fe;
        }

        .client-details {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }

        .client-details h3 {
            color: #2d3748;
            margin-bottom: 10px;
            font-size: 16px;
            font-weight: 600;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 5px;
        }

        .total-summary {
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            text-align: center;
        }

        .total-summary h3 {
            margin-bottom: 15px;
            font-size: 20px;
        }

        .grand-total {
            font-size: 28px;
            font-weight: bold;
            color: #0b5cff;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        /* Cell styling */
        .cell-center {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: center;
            background-color: #fafafa;
        }

        .cell-right {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: right;
            background-color: #fafafa;
        }

        .cell-left {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: left;
            background-color: #fafafa;
        }

        .cost-row:last-child,
        .cost-row.grand-total {
            border-bottom: 2px solid #3b82f6;
            border-top: 2px solid #3b82f6;
            font-weight: bold;
            font-size: 16px;
            padding: 10px 0;
            margin-top: 10px;
            background: rgba(59, 130, 246, 0.1);
        }        /* Utility classes */
        .bold { font-weight: bold; }
        .text-xs { font-size: 10px; }
        .text-sm { font-size: 12px; }
        .text-base { font-size: 14px; }
        .text-lg { font-size: 18px; }
        .text-xl { font-size: 20px; }
        .text-2xl { font-size: 24px; }
        .text-primary { color: #3b82f6; }
        .text-muted { color: #666; }
        .text-success { color: #10b981; }
        .text-warning { color: #f59e0b; }
        .text-danger { color: #ef4444; }
        .bg-summary { background-color: #f0f9ff; }
        .bg-light { background-color: #f8f9fa; }
        .bg-primary { background-color: #3b82f6; color: white; }
        .rounded { border-radius: 8px; }
        .rounded-sm { border-radius: 4px; }
        .rounded-lg { border-radius: 12px; }
        .border { border: 1px solid #ddd; }
        .border-thick { border: 2px solid #ddd; }
        .p-1 { padding: 4px; }
        .p-2 { padding: 8px; }
        .p-3 { padding: 12px; }
        .p-4 { padding: 16px; }
        .px-2 { padding-left: 8px; padding-right: 8px; }
        .px-3 { padding-left: 12px; padding-right: 12px; }
        .py-2 { padding-top: 8px; padding-bottom: 8px; }
        .py-3 { padding-top: 12px; padding-bottom: 12px; }
        .m-1 { margin: 4px; }
        .m-2 { margin: 8px; }
        .m-3 { margin: 12px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mt-2 { margin-top: 8px; }
        .mt-3 { margin-top: 12px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .w-full { width: 100%; }
        .w-half { width: 50%; }
        .w-quarter { width: 25%; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .shadow-sm { box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
        .shadow { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
        .shadow-lg { box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1); }
        .opacity-50 { opacity: 0.5; }
        .opacity-75 { opacity: 0.75; }

        /* Special formatting for styled content */
        div[style*="font-weight: bold"] {
            font-weight: bold !important;
        }

        div[style*="color: #666"] {
            color: #666 !important;
            font-size: 11px;
        }

        /* Item styling */
        .item-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
            gap: 10px;
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
            align-items: center;
        }

        .item-row:last-child {
            border-bottom: none;
        }

        .item-row:nth-child(even) {
            background-color: #f9fafb;
        }

        .item-description {
            font-weight: 500;
            color: #374151;
        }

        .item-measurement {
            text-align: center;
            color: #6b7280;
            font-family: 'Courier New', monospace;
        }

        .item-quantity {
            text-align: center;
            font-weight: 600;
            color: #1f2937;
        }

        .item-rate {
            text-align: right;
            color: #059669;
            font-weight: 500;
        }

        .item-total {
            text-align: right;
            font-weight: 700;
            color: #1f2937;
        }

        /* Summary table enhancements */
        .summary-table {
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .summary-table th {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
        }

        .summary-table .total-row td {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
            font-weight: bold;
            font-size: 14px;
            color: #1f2937;
            border-top: 2px solid #3b82f6;
        }

        /* Print styles */
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            body {
                background: white !important;
                color: black !important;
                margin: 0 !important;
                padding: 15px !important;
            }
            
            .header, th, .section-header, .measurement-header, .total-summary, 
            .cost-summary, .client-info, .project-title {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-inside: avoid !important;
            }
            
            .measurement-section {
                page-break-inside: avoid !important;
            }
        }
    `;
    
    // Determine if we need to extract body content or use as-is
    if (htmlContent.includes('<!DOCTYPE') || htmlContent.includes('<html')) {
        // It's already a complete HTML document from backend reconstruction
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Inject our enhanced CSS into the existing document
        const enhancedHTML = htmlContent.replace(
            /<head[^>]*>/i,
            `$&<style>${embeddedCSS}</style>`
        );
        
        iframeDoc.open();
        iframeDoc.write(enhancedHTML);
        iframeDoc.close();
    } else {
        // It's body content only, wrap it properly
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const htmlWithStyles = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>${embeddedCSS}</style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;
        
        iframeDoc.open();
        iframeDoc.write(htmlWithStyles);
        iframeDoc.close();
    }
    
    // Adjust iframe height after content loads
    iframe.onload = function() {
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const body = iframeDoc.body;
            const height = Math.max(body.scrollHeight, body.offsetHeight, 600);
            iframe.style.height = height + 'px';
            console.log('Iframe height adjusted to:', height);
        } catch (e) {
            console.error('Error adjusting iframe height:', e);
            iframe.style.height = '800px';
        }
    };
    
    return iframe;
}

/**
 * Downloads project content as PDF
 * @param {Object} project - Project object
 * @param {string} filename - Base filename without extension
 * @returns {Promise<void>}
 */
async function downloadAsPDF(project, filename) {
    try {
        // Show loading indicator if available
        if (typeof showLoading === 'function') {
            showLoading(true);
        }
        
        // Create a printable version of the content
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        const fullHtml = createStandaloneHTML(project);
        
        // Write the HTML content
        printWindow.document.open();
        printWindow.document.write(fullHtml);
        printWindow.document.close();
        
        await new Promise(resolve => {
            const checkLoaded = () => {
                if (printWindow.document.readyState === 'complete') {
                    setTimeout(resolve, 1500);
                } else {
                    setTimeout(checkLoaded, 100);
                }
            };
            
            if (printWindow.document.readyState === 'complete') {
                setTimeout(resolve, 1500);
            } else {
                printWindow.addEventListener('load', () => {
                    setTimeout(resolve, 1500);
                });

                setTimeout(resolve, 3000);
            }
        });

        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            if (typeof showToast === 'function') {
                showToast('Print dialog opened. Choose "Save as PDF" to download as PDF', 'info', 7000);
            }
            setTimeout(() => {
                if (printWindow && !printWindow.closed) {
                    printWindow.close();
                }
            }, 5000);
        }, 500);
        
    } catch (error) {
        console.error('Error creating PDF:', error);
        if (typeof showToast === 'function') {
            showToast('Failed to create PDF. Please try downloading as HTML instead.', 'error');
        }
    } finally {
        if (typeof showLoading === 'function') {
            showLoading(false);
        }
    }
}

/**
 * Downloads project content as HTML file
 * @param {Object} project - Project object 
 * @param {string} filename - Base filename without extension
 */
function downloadAsHTML(project, filename) {
    const fullHtml = createStandaloneHTML(project);
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Generates template HTML for different interior types
 * @param {string} type - Type of interior (curtain, blinds, flooring, etc)
 * @param {Object} projectData - Project data including measurements and costs
 * @returns {string} HTML template specific to the interior type
 */
function generateInteriorTemplate(type, projectData) {
    const commonHeader = `
        <div class="project-title">Interior Quotation - ${projectData.clientName}</div>
        <div class="client-details">
            <h3>Client Information</h3>
            <div class="info-row">
                <span class="bold">Name:</span>
                <span>${projectData.clientName}</span>
            </div>
            <div class="info-row">
                <span class="bold">Phone:</span>
                <span>${projectData.phone}</span>
            </div>
            <div class="info-row">
                <span class="bold">Address:</span>
                <span>${projectData.address}</span>
            </div>
            <div class="info-row">
                <span class="bold">Date:</span>
                <span>${new Date().toLocaleDateString()}</span>
            </div>
        </div>
    `;

    // Type-specific template generation
    let typeSpecificContent = '';
    switch(type.toLowerCase()) {
        case 'curtain':
            typeSpecificContent = generateCurtainTemplate(projectData);
            break;
        case 'blinds':
            typeSpecificContent = generateBlindsTemplate(projectData);
            break;
        case 'flooring':
            typeSpecificContent = generateFlooringTemplate(projectData);
            break;
        case 'wallpaper':
            typeSpecificContent = generateWallpaperTemplate(projectData);
            break;
        case 'mosquito-net':
            typeSpecificContent = generateMosquitoNetTemplate(projectData);
            break;
        default:
            typeSpecificContent = generateGenericTemplate(projectData);
    }
    
    return `
        ${commonHeader}
        ${typeSpecificContent}
        <div class="cost-summary">
            <div class="cost-row">
                <span class="cost-label">Subtotal:</span>
                <span class="cost-value">₹${projectData.subtotal.toFixed(2)}</span>
            </div>
            <div class="cost-row">
                <span class="cost-label">Tax (${projectData.taxRate || 18}%):</span>
                <span class="cost-value">₹${projectData.tax.toFixed(2)}</span>
            </div>
            <div class="cost-row">
                <span class="cost-label">Total:</span>
                <span class="cost-value">₹${projectData.total.toFixed(2)}</span>
            </div>
        </div>
    `;
}

// Export functions for use in the main script
window.PDFUtils = {
    createStandaloneHTML,
    displayProjectHTML,
    downloadAsPDF,
    downloadAsHTML,
    extractBodyContent,
    generateInteriorTemplate,
    PDF_CORE_STYLES
};
