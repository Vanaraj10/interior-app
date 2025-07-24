// Generates HTML rows for mosquito net measurements
export function generateMosquitoNetRows(measurements, formatCurrency) {
  return measurements.map((m, index) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${m.roomLabel}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.width}" (${m.widthFeet?.toFixed(1)}ft)</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.height}" (${m.heightFeet?.toFixed(1)}ft)</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.materialType || ''}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${m.materialRatePerSqft || 0}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.totalSqft ? m.totalSqft.toFixed(2) : 0}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">
        <div>${formatCurrency(m.materialCost || 0)}</div>
        ${m.totalSqft && m.materialRatePerSqft ? `<div style="font-size: 11px; color: #666;">${m.totalSqft.toFixed(2)} sqft × ₹${m.materialRatePerSqft}</div>` : ''}
      </td>
      <td style="padding: 8px; border: 1px solid #ddd;">${m.customDescription || ''}</td>
    </tr>
  `).join('');
}

generateMosquitoNetRows.totals = (measurements, formatCurrency) => {
  const totals = measurements.reduce((acc, m) => {
    acc.totalSqft += m.totalSqft || 0;
    acc.totalMaterialCost += m.materialCost || 0;
    return acc;
  }, { totalSqft: 0, totalMaterialCost: 0 });
  return `<tr style="background:#f0f9ff;font-weight:bold;">
    <td colspan="6" style="text-align:right;">TOTAL</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:center;">${totals.totalSqft.toFixed(2)}</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatCurrency(totals.totalMaterialCost)}</td>
    <td></td>
  </tr>`;
};
