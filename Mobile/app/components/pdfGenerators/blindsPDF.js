// filepath: c:\Users\VJ\Desktop\interior-app\Mobile\app\components\pdfGenerators\blindsPDF.js

export const generateBlindsRows = (measurements, formatCurrency) => {
  return measurements.map((m, index) => {
    const height = parseFloat(m.height) || 0;
    const width = parseFloat(m.width) || 0;
    const totalSqft = (height * width) / 144;
    const blindsCost = totalSqft * (parseFloat(m.costPerSqft) || 0);
    
    let clothRequired = 0;
    let clothCost = 0;
    let stitchingCost = 0;
    let totalCost = blindsCost;
    
    if (m.blindType === "Roman Blinds") {
      clothRequired = ((height + 15) / 39) * (m.part || 1);
      clothCost = clothRequired * (parseFloat(m.clothCostPerSqft) || 0);
      stitchingCost = (m.part || 1) * (parseFloat(m.stitchingCostPerPart) || 0);
      totalCost = blindsCost + clothCost + stitchingCost;
    }
    
    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${m.roomLabel || 'Untitled'}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${height}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${width}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${totalSqft.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(blindsCost)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.blindType === "Roman Blinds" ? clothRequired.toFixed(2) : '-'}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${m.blindType === "Roman Blinds" ? formatCurrency(clothCost) : '-'}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${m.blindType === "Roman Blinds" ? formatCurrency(stitchingCost) : '-'}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(totalCost)}</td>
      </tr>
    `;
  }).join('');
};

generateBlindsRows.totals = (measurements, formatCurrency) => {
  const grandTotal = measurements.reduce((sum, m) => {
    const height = parseFloat(m.height) || 0;
    const width = parseFloat(m.width) || 0;
    const totalSqft = (height * width) / 144;
    const blindsCost = totalSqft * (parseFloat(m.costPerSqft) || 0);
    
    let totalCost = blindsCost;
    
    if (m.blindType === "Roman Blinds") {
      const clothRequired = ((height + 15) / 39) * (m.part || 1);
      const clothCost = clothRequired * (parseFloat(m.clothCostPerSqft) || 0);
      const stitchingCost = (m.part || 1) * (parseFloat(m.stitchingCostPerPart) || 0);
      totalCost = blindsCost + clothCost + stitchingCost;
    }
    
    return sum + totalCost;
  }, 0);

  return `
    <tr style="background-color: #f0f9ff; font-weight: bold;">
      <td colspan="9" style="padding: 8px; border: 1px solid #ddd; text-align: right;">TOTAL:</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(grandTotal)}</td>
    </tr>
  `;
};