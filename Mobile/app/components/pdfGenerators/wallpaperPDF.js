// Generates HTML rows for wallpaper measurements
export function generateWallpaperRows(measurements, formatCurrency) {
  return measurements.map((m, index) => {
    // Calculate rolls and costs as per the latest logic
    const width = Number(m.width) || 0;
    const height = Number(m.height) || 0;
    const costPerRoll = Number(m.costPerRoll) || 0;
    const implementationCostPerRoll = Number(m.implementationCostPerRoll) || 0;
    const squareInches = width * height;
    const squareFeet = squareInches / 144;
    let rolls = squareFeet / 57;
    const decimal = rolls - Math.floor(rolls);
    if (decimal >= 0.3) {
      rolls = Math.ceil(rolls);
    } else {
      rolls = Math.max(1, Math.floor(rolls));
    }
    const totalMaterialCost = rolls * costPerRoll;
    const totalImplementationCost = rolls * implementationCostPerRoll;
    const totalCost = totalMaterialCost + totalImplementationCost;
    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${m.roomLabel}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${width}"</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${height}"</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${squareFeet.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${rolls}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(totalMaterialCost)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(totalImplementationCost)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(totalCost)}</td>
      </tr>
    `;
  }).join('');
}
