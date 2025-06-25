// Generates HTML rows for wallpaper measurements
export function generateWallpaperRows(measurements, formatCurrency) {
  return measurements.map((m, index) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${m.roomLabel}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.width}"</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.height}"</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.pieces || 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.totalMeters?.toFixed(2) || ''}m</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.wallpaperType || 'N/A'}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(m.materialCost || 0)}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(m.installationCost || 0)}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(m.totalCost || 0)}</td>
    </tr>
  `).join('');
}
