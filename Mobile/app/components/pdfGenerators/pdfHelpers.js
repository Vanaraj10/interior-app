import { PDF_STYLES } from './pdf-styles';

/**
 * Generate HTML for a PDF document with standard layout
 * @param {Object} project - The project data
 * @param {string} mainContent - The main HTML content for the PDF body
 * @returns {string} - Complete HTML document
 */
export function generatePDFDocument(project, mainContent) {
  const clientName = project.clientName || project.client_name || '';
  const phone = project.phone || '';
  const address = project.address || '';
  const date = new Date().toLocaleDateString();
  const projectId = project.id || '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Quotation - ${clientName}</title>
      <style>${PDF_STYLES}</style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">BENTLEI CURTAIN</div>
        <div class="company-subtitle">Designed With Luxury & Comfort</div>
      </div>

      <div class="client-info">
        <div class="info-row">
          <span><strong>Client Name:</strong> ${clientName}</span>
          <span><strong>Date:</strong> ${date}</span>
        </div>
        <div class="info-row">
          <span><strong>Phone:</strong> ${phone}</span>
          <span><strong>Project ID:</strong> ${projectId}</span>
        </div>
        <div class="info-row">
          <span><strong>Address:</strong> ${address}</span>
        </div>
      </div>
      
      ${mainContent}
      
      <div class="footer">
        <p>Thank you for your business. For any questions, please contact us.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate cost summary section HTML 
 * @param {Object} project - Project with cost data
 * @param {Function} formatCurrency - Function to format currency values
 * @returns {string} - HTML for cost summary section
 */
export function generateCostSummaryHTML(project, formatCurrency) {
  return `
    <div class="cost-summary">
      <h3 style="margin-top: 0; color: #3B82F6;">COST SUMMARY</h3>
      ${project.curtainTotal > 0 ? 
        `<div class="cost-row"><span>Curtains Subtotal:</span><span>${formatCurrency(project.curtainTotal)}</span></div>` : ''}
      ${project.netTotal > 0 ? 
        `<div class="cost-row"><span>Mosquito Nets Subtotal:</span><span>${formatCurrency(project.netTotal)}</span></div>` : ''}
      ${project.wallpaperTotal > 0 ? 
        `<div class="cost-row"><span>Wallpapers Subtotal:</span><span>${formatCurrency(project.wallpaperTotal)}</span></div>` : ''}
      ${project.blindsTotal > 0 ? 
        `<div class="cost-row"><span>Blinds Subtotal:</span><span>${formatCurrency(project.blindsTotal)}</span></div>` : ''}
      ${project.flooringTotal > 0 ? 
        `<div class="cost-row"><span>Flooring Subtotal:</span><span>${formatCurrency(project.flooringTotal)}</span></div>` : ''}
      ${project.rodCost > 0 ? 
        `<div class="cost-row"><span>Rod Installation:</span><span>${formatCurrency(project.rodCost)}</span></div>` : ''}
      <div class="cost-row grand-total">
        <span>GRAND TOTAL:</span>
        <span>${formatCurrency(project.grandTotal || 0)}</span>
      </div>
    </div>
  `;
}
