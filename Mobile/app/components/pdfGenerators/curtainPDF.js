// Generates HTML rows for curtain measurements
export function generateCurtainRows(measurements, formatCurrency) {
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
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(m.totalCost || 0)}</td>
    </tr>
  `).join('');
}
