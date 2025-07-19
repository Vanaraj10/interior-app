// Rod calculation helper function
const calculateRods = (widths, rodLength = 144) => {
  const sortedWidths = [...widths].sort((a, b) => b - a);
  const rods = [];
  sortedWidths.forEach(width => {
    let placed = false;
    for (let i = 0; i < rods.length; i++) {
      if (rods[i].total + width <= rodLength) {
        rods[i].items.push(width);
        rods[i].total += width;
        placed = true;
        break;
      }
    }
    if (!placed) {
      rods.push({ items: [width], total: width });
    }
  });
  return { totalRods: rods.length, rods };
};

// Generates HTML rows for curtain measurements (Table 1: Curtain Cost)
export function generateCurtainRows(measurements, formatCurrency) {
  return measurements.map((m, index) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${m.roomLabel}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.width}"</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.height}"</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.parts || m.pieces || '-'}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.stitchingModel || m.curtainType || 'N/A'}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${(m.mainMetre || m.totalMeters || 0).toFixed(2)}m</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
        <div style="font-weight: bold;">${formatCurrency(m.clothCost || 0)}</div>
      </td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
        <div style="font-weight: bold;">${formatCurrency(m.stitchingCost || 0)}</div>
      </td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
        ${m.hasLining ? `<div style='font-weight: bold;'>${(m.liningMetre || m.totalLiningMeters || 0).toFixed(2)}m</div>` : '-'}
      </td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
        ${m.hasLining ? `<div style='font-weight: bold;'>${formatCurrency(m.liningCost || m.totalLiningCost || 0)}</div>` : '-'}
      </td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(m.totalCurtainCost || m.totalCost || 0)}</td>
    </tr>
  `)
}

// Generate Rod Cost table (Table 2)
export function generateRodCostRows(measurements, formatCurrency) {
  if (!measurements.length) return '';
  
  const rodData = measurements.map((m, index) => {
    const rodFeet = (parseFloat(m.width) || 0) / 12;
    const clampCost = (parseFloat(m.clampRequired) || 0) * (parseFloat(m.clampRatePerPiece) || 0);
    const doomCost = (parseFloat(m.doomRequired) || 0) * (parseFloat(m.doomRatePerPiece) || 0);
    const totalWallBracketCost = clampCost + doomCost;
    
    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.curtainBracketModel || '-'}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${rodFeet.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(clampCost)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(doomCost)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(totalWallBracketCost)}</td>
      </tr>
    `;
  }).join('');
  
  // Calculate rod requirements
  const widths = measurements.map(m => parseFloat(m.width) || 0);
  const rodCalc = calculateRods(widths);
  const totalRodsRequired = rodCalc.totalRods;
  const rodRatePerLength = measurements.length > 0 ? (parseFloat(measurements[0].rodRatePerLength) || 0) : 0;
  const totalRodCost = totalRodsRequired * rodRatePerLength;
  
  const totalWallBracketCost = measurements.reduce((sum, m) => {
    const clampCost = (parseFloat(m.clampRequired) || 0) * (parseFloat(m.clampRatePerPiece) || 0);
    const doomCost = (parseFloat(m.doomRequired) || 0) * (parseFloat(m.doomRatePerPiece) || 0);
    return sum + clampCost + doomCost;
  }, 0);
  
  const rodSummary = `
    <tr style="background:#f8f9fa;">
      <td colspan="6" style="padding: 12px; border: 1px solid #ddd;">
        <div style="margin-bottom: 8px;"><strong>Total No. of Rods Required: ${totalRodsRequired} length(s)</strong></div>
        <div style="margin-bottom: 8px;"><strong>Total Rod Cost: ${formatCurrency(totalRodCost)}</strong></div>
        <div style="font-weight: bold; font-size: 16px;"><strong>Total Wall Bracket Cost: ${formatCurrency(totalWallBracketCost)}</strong></div>
      </td>
    </tr>
  `;
  
  return rodData + rodSummary;
}

// Generate Total Cost Summary
export function generateTotalCostSummary(measurements, formatCurrency) {
  if (!measurements.length) return '';
  
  // Calculate cloth cost total (with 5% GST)
  const totalCurtainCost = measurements.reduce((sum, m) => sum + (parseFloat(m.totalCurtainCost) || parseFloat(m.totalCost) || 0), 0);
  const clothCostWithGST = totalCurtainCost * 1.05;
  
  // Calculate rod cost total (with 18% GST)
  const totalWallBracketCost = measurements.reduce((sum, m) => {
    const clampCost = (parseFloat(m.clampRequired) || 0) * (parseFloat(m.clampRatePerPiece) || 0);
    const doomCost = (parseFloat(m.doomRequired) || 0) * (parseFloat(m.doomRatePerPiece) || 0);
    return sum + clampCost + doomCost;
  }, 0);
  
  const widths = measurements.map(m => parseFloat(m.width) || 0);
  const rodCalc = calculateRods(widths);
  const rodRatePerLength = measurements.length > 0 ? (parseFloat(measurements[0].rodRatePerLength) || 0) : 0;
  const totalRodCost = rodCalc.totalRods * rodRatePerLength;
  const totalRodCostWithGST = (totalWallBracketCost + totalRodCost) * 1.18;
  
  const grandTotal = clothCostWithGST + totalRodCostWithGST;  return `
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
      <h3 style="margin: 0 0 16px 0; color: #2563eb;">Total Cost Summary</h3>
      <div style="margin-bottom: 12px; font-size: 16px;">
        <strong>Total Rods Required: ${rodCalc.totalRods} rods</strong>
      </div>
      <div style="margin-bottom: 12px; font-size: 16px;">
        <strong>Total Wall Brackets Cost: ${formatCurrency(totalWallBracketCost)}</strong>
      </div>
      <div style="margin-bottom: 12px; font-size: 16px;">
        <strong>Cloth Cost (with 5% GST): ${formatCurrency(Math.ceil(clothCostWithGST))}</strong>
      </div>
      <div style="margin-bottom: 12px; font-size: 16px;">
        <strong>Rod Cost (with 18% GST): ${formatCurrency(Math.ceil(totalRodCostWithGST))}</strong>
      </div>
      <div style="border-top: 2px solid #2563eb; padding-top: 12px; margin-top: 16px;">
        <div style="font-size: 20px; font-weight: bold; color: #dc2626;">
          <strong>Grand Total: ${formatCurrency(Math.ceil(grandTotal))}</strong>
        </div>
      </div>
    </div>
  `;
}

// Add totals for curtain cost table (Table 1)
generateCurtainRows.totals = (measurements, formatCurrency) => {
  const totals = measurements.reduce((acc, m) => {
    acc.totalParts += m.parts || m.pieces || 0;
    acc.totalMeters += m.mainMetre || m.totalMeters || 0;
    acc.totalClothCost += m.clothCost || 0;
    acc.totalStitchingCost += m.stitchingCost || 0;
    acc.totalLiningMeters += m.liningMetre || m.totalLiningMeters || 0;
    acc.totalLiningCost += m.liningCost || m.totalLiningCost || 0;
    acc.totalCurtainCost += m.totalCurtainCost || m.totalCost || 0;
    return acc;
  }, { 
    totalParts: 0, 
    totalMeters: 0, 
    totalClothCost: 0, 
    totalStitchingCost: 0, 
    totalLiningMeters: 0, 
    totalLiningCost: 0, 
    totalCurtainCost: 0 
  });

  return `<tr style="background:#f0f9ff;font-weight:bold;">
    <td style="padding:8px;border:1px solid #ddd;text-align:right;">Total</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:center;">(${measurements.length} rooms)</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:center;">-</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:center;">-</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:center;">${totals.totalParts}</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:center;">-</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:center;">${totals.totalMeters.toFixed(2)}m</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatCurrency(totals.totalClothCost)}</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatCurrency(totals.totalStitchingCost)}</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:right;">${totals.totalLiningMeters.toFixed(2)}m</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatCurrency(totals.totalLiningCost)}</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">${formatCurrency(totals.totalCurtainCost)}</td>
  </tr>`;
};
