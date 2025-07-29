// Improved PDF generation and printing for web
export const generateWebPDF = async (htmlContent, fileName) => {
  try {
    // Load the html2pdf library if not already loaded
    if (!window.html2pdf) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.integrity = 'sha512-5nFyO4SD3AE++Fellowship+GUPgDhFRp/U/2Qm5zznGfQ+WO5P+IyGAWgXQpJO/daKB2D+AZuVNGzbyZaJvHYQFg==';
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'no-referrer';
        script.onload = () => {
          generatePDFWithLibrary(htmlContent, fileName).then(resolve).catch(reject);
        };
        script.onerror = () => reject(new Error('Failed to load PDF library'));
        document.body.appendChild(script);
      });
    } else {
      return generatePDFWithLibrary(htmlContent, fileName);
    }
  } catch (error) {
    console.error('Error in generateWebPDF:', error);
    throw error;
  }
};

const generatePDFWithLibrary = async (htmlContent, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary container
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      container.style.visibility = 'hidden';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      // Configure html2pdf options for better rendering
      const options = {
        margin: [10, 10],
        filename: fileName || 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generate and save the PDF
      html2pdf().from(container).set(options).save()
        .then(() => {
          // Clean up
          document.body.removeChild(container);
          resolve(true);
        })
        .catch((err) => {
          document.body.removeChild(container);
          reject(err);
        });
    } catch (err) {
      reject(err);
    }
  });
};

export const printWebPDF = async (htmlContent) => {
  try {
    // Create a new print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      throw new Error('Unable to open print window. Please check if popup blocker is enabled.');
    }

    // Write content to the print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Document</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              @page { size: A4; margin: 10mm; }
            }
            body { font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 500);
              }, 1000);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    return true;
  } catch (error) {
    console.error('Error in printWebPDF:', error);
    throw error;
  }
};
