export default function flooringPDF(measurements, formatCurrency) {
  return measurements
    .map((m, idx) => {
      const height = parseFloat(m.height) || 0;
      const width = parseFloat(m.width) || 0;
      const costPerSqft = parseFloat(m.costPerSqft) || 0;
      const layingPerSqft = parseFloat(m.layingPerSqft) || 0;      // Convert inches to sqft
      const totalSqft = (height * width) / 144;
      const costOfRoom = Math.ceil(totalSqft * costPerSqft);
      const layingCharge = Math.ceil(totalSqft * layingPerSqft);
      const totalCost = costOfRoom + layingCharge;
      return `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${
            idx + 1
          }</td>
          <td style="padding:8px;border:1px solid #ddd;">${
            m.roomLabel || "Untitled"
          }</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${
            height ? height : "-"
          }</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${
            width ? width : "-"
          }</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${
            totalSqft ? totalSqft.toFixed(2) : "-"
          }</td>          <td style="padding:8px;border:1px solid #ddd;text-align:right;">
            ${totalSqft ? `<div style="font-weight: bold;">${formatCurrency(costOfRoom)}</div><div style="font-size: 11px; color: #666;">${totalSqft.toFixed(2)} sqft × ₹${costPerSqft}</div>` : "-"}
          </td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">
            ${totalSqft ? `<div style="font-weight: bold;">${formatCurrency(layingCharge)}</div><div style="font-size: 11px; color: #666;">${totalSqft.toFixed(2)} sqft × ₹${layingPerSqft}</div>` : "-"}
          </td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">${
            totalSqft ? formatCurrency(totalCost) : "-"
          }</td>
        </tr>
      `;
    })
    .join("");
}
