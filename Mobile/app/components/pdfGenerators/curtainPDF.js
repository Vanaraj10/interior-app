// Generates HTML rows for curtain measurements
export function generateCurtainRows(measurements, formatCurrency) {
  const curtainTotals = measurements.reduce((acc, m) => {
    acc.totalMeters += m.totalMeters || 0;
    acc.totalLiningMeters += m.totalLiningMeters || 0;
    acc.totalClothCost += m.clothCost || 0;
    acc.totalStitchingCost += m.stitchingCost || 0;
    acc.totalLiningCost += m.totalLiningCost || 0;
    acc.totalCost += m.totalCost || 0;
    return acc;
  }, { totalMeters: 0, totalLiningMeters: 0, totalClothCost: 0, totalStitchingCost: 0, totalLiningCost: 0, totalCost: 0 });

  return measurements.map((m, index) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${m.roomLabel}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.width}"</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.height}"</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
        ${m.parts === 'One Part' ? `<span style='display:inline-block;border:2px solid #2563eb;border-radius:999px;padding:2px 8px;color:#2563eb;font-weight:bold;'>${m.pieces?.toFixed(1)} pieces</span>` : `${m.pieces?.toFixed(1)} pieces`}
      </td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.totalMeters?.toFixed(2)}m</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.curtainType || 'N/A'}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
        <div style="font-weight: bold;">${formatCurrency(m.clothCost || 0)}</div>
        <div style="font-size: 10px; color: #666;">${m.totalMeters?.toFixed(2)}m × ₹${m.clothRatePerMeter}</div>
      </td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
        <div style="font-weight: bold;">${formatCurrency(m.stitchingCost || 0)}</div>
        <div style="font-size: 10px; color: #666;">${m.pieces?.toFixed(1)} × ₹${m.stitchingCostPerPiece}</div>
      </td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
        ${m.hasLining ? `<div style='font-weight: bold;'>${formatCurrency(m.totalLiningCost || 0)}</div><div style='font-size: 10px; color: #666;'>${m.liningType} | ${m.totalLiningMeters?.toFixed(2)}m × ₹${m.liningCostPerMeter}</div>` : ''}
      </td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(m.totalCost || 0)}</td>
    </tr>
  `)
}

// Add totals for each interior type
generateCurtainRows.totals = (measurements, formatCurrency) => {
  const totals = measurements.reduce((acc, m) => {
    acc.totalMeters += m.totalMeters || 0;
    acc.totalLiningMeters += m.totalLiningMeters || 0;
    acc.totalClothCost += m.clothCost || 0;
    acc.totalStitchingCost += m.stitchingCost || 0;
    acc.totalLiningCost += m.totalLiningCost || 0;
    acc.totalCost += m.totalCost || 0;
    return acc;
  }, { totalMeters: 0, totalLiningMeters: 0, totalClothCost: 0, totalStitchingCost: 0, totalLiningCost: 0, totalCost: 0 });
  return `<tr style="background:#f0f9ff;font-weight:bold;">
    <td colspan="5" style="text-align:right;">TOTAL</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:center;">${totals.totalMeters.toFixed(2)}m</td>
    <td></td>
    <td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatCurrency(totals.totalClothCost)}</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatCurrency(totals.totalStitchingCost)}</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:right;">${totals.totalLiningMeters > 0 ? `${totals.totalLiningMeters.toFixed(2)}m, ${formatCurrency(totals.totalLiningCost)}` : ''}</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">${formatCurrency(totals.totalCost)}</td>
  </tr>`;
};
