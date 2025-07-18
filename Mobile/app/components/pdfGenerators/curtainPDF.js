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
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.curtainBracketModels || '-'}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${rodFeet.toFixed(2)}</td>        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
          <div style="font-weight: bold;">${formatCurrency(clampCost)}</div>
          ${m.clampRequired && m.clampRatePerPiece ? `<div style="font-size: 11px; color: #666;">${m.clampRequired} × ${formatCurrency(m.clampRatePerPiece)}</div>` : ''}
        </td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
          <div style="font-weight: bold;">${formatCurrency(doomCost)}</div>
          ${m.doomRequired && m.doomRatePerPiece ? `<div style="font-size: 11px; color: #666;">${m.doomRequired} × ${formatCurrency(m.doomRatePerPiece)}</div>` : ''}
        </td>
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
  
  // Calculate totals for summary row
  const totalRodFeet = measurements.reduce((sum, m) => sum + ((parseFloat(m.width) || 0) / 12), 0);
  const totalClampRequired = measurements.reduce((sum, m) => sum + (parseFloat(m.clampRequired) || 0), 0);
  const totalDoomRequired = measurements.reduce((sum, m) => sum + (parseFloat(m.doomRequired) || 0), 0);
  const totalClampCost = measurements.reduce((sum, m) => sum + ((parseFloat(m.clampRequired) || 0) * (parseFloat(m.clampRatePerPiece) || 0)), 0);
  const totalDoomCost = measurements.reduce((sum, m) => sum + ((parseFloat(m.doomRequired) || 0) * (parseFloat(m.doomRatePerPiece) || 0)), 0);
    const summaryRow = `
    <tr style="background:#f0f9ff;font-weight:bold;">
      <td style="padding:8px;border:1px solid #ddd;text-align:center;">Total</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center;">(${measurements.length} items)</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center;">${totalRodFeet.toFixed(2)} ft</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right;">
        <div style="font-weight: bold;">${formatCurrency(totalClampCost)}</div>
        <div style="font-size: 11px; color: #666;">Total: ${totalClampRequired} pieces</div>
      </td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right;">
        <div style="font-weight: bold;">${formatCurrency(totalDoomCost)}</div>
        <div style="font-size: 11px; color: #666;">Total: ${totalDoomRequired} pieces</div>
      </td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">${formatCurrency(totalWallBracketCost)}</td>
    </tr>
  `;
  
  return rodData + summaryRow;
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
    <div style="margin-top: 20px;">
      <h4 style="margin: 0 0 10px 0;">Cost Summary</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
          <td style="padding: 4px 8px; border: 1px solid #ddd;">Total Rods Required:</td>
          <td style="padding: 4px 8px; border: 1px solid #ddd; text-align: right;">${rodCalc.totalRods} rods</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px; border: 1px solid #ddd;">Rod Calculation Cost:</td>
          <td style="padding: 4px 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(totalRodCost)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px; border: 1px solid #ddd;">Total Wall Brackets Cost:</td>
          <td style="padding: 4px 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(totalWallBracketCost)}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px; border: 1px solid #ddd;">Cloth Cost (with 5% GST):</td>
          <td style="padding: 4px 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(Math.ceil(clothCostWithGST))}</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px; border: 1px solid #ddd;">Rod Cost (with 18% GST):</td>
          <td style="padding: 4px 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(Math.ceil(totalRodCostWithGST))}</td>
        </tr>
        <tr style="background: #f0f0f0; font-weight: bold;">
          <td style="padding: 6px 8px; border: 1px solid #ddd;">GRAND TOTAL:</td>
          <td style="padding: 6px 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(Math.ceil(grandTotal))}</td>
        </tr>
      </table>
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
