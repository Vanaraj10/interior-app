// Generates HTML rows for mosquito net measurements
export function generateMosquitoNetRows(measurements, formatCurrency) {
  return measurements.map((m, index) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${m.roomLabel}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.width}" (${m.widthFeet}ft)</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.height}" (${m.heightFeet}ft)</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.materialType || ''}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${m.materialRatePerSqft || 0}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.totalSqft || 0}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(m.materialCost || 0)}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${m.customDescription || ''}</td>
    </tr>
  `).join('');
}
