export default function flooringPDF(measurements, project) {
  const columns = [
    "S.No",
    "Room",
    "Height",
    "Width",
    "Total Sqft",
    "Cost of Room",
    "Laying Charge",
    "Total Cost",
  ];
  const rows = measurements.map((m, idx) => [
    idx + 1,
    m.roomLabel || "Untitled",
    m.height || "-",
    m.width || "-",
    m.totalSqft?.toFixed(2) || "-",
    `₹${m.costOfRoom?.toLocaleString("en-IN") || "-"}`,
    `₹${m.layingCharge?.toLocaleString("en-IN") || "-"}`,
    `₹${m.totalCost?.toLocaleString("en-IN") || "-"}`,
  ]);
  return { columns, rows };
}
