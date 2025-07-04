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
    let rolls = squareFeet / 50;
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

generateWallpaperRows.totals = (measurements, formatCurrency) => {
  let totalSqft = 0, totalRolls = 0, totalMaterialCost = 0, totalImplementationCost = 0, totalCost = 0;
  measurements.forEach(m => {
    const width = Number(m.width) || 0;
    const height = Number(m.height) || 0;
    const costPerRoll = Number(m.costPerRoll) || 0;
    const implementationCostPerRoll = Number(m.implementationCostPerRoll) || 0;
    const squareInches = width * height;
    const squareFeet = squareInches / 144;
    let rolls = squareFeet / 50;
    const decimal = rolls - Math.floor(rolls);
    if (decimal >= 0.3) {
      rolls = Math.ceil(rolls);
    } else {
      rolls = Math.max(1, Math.floor(rolls));
    }
    totalSqft += squareFeet;
    totalRolls += rolls;
    totalMaterialCost += rolls * costPerRoll;
    totalImplementationCost += rolls * implementationCostPerRoll;
    totalCost += (rolls * costPerRoll) + (rolls * implementationCostPerRoll);
  });
  return `<tr style=\"background:#f0f9ff;font-weight:bold;\">
    <td colspan=\"4\" style=\"text-align:right;\">TOTAL</td>
    <td style=\"padding:8px;border:1px solid #ddd;text-align:center;\">${totalSqft.toFixed(2)}</td>
    <td style=\"padding:8px;border:1px solid #ddd;text-align:center;\">${totalRolls}</td>
    <td style=\"padding:8px;border:1px solid #ddd;text-align:right;\">${formatCurrency(totalMaterialCost)}</td>
    <td style=\"padding:8px;border:1px solid #ddd;text-align:right;\">${formatCurrency(totalImplementationCost)}</td>
    <td style=\"padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;\">${formatCurrency(totalCost)}</td>
  </tr>`;
};
