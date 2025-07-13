// Shared project total calculation logic
export function calculateProjectTotals(projectData) {
  const measurements = projectData.measurements || [];
  // Group measurements by interior type
  const curtainMeasurements = measurements.filter(m => m.interiorType === 'curtains');
  const netMeasurements = measurements.filter(m => m.interiorType === 'mosquito-nets');
  const wallpaperMeasurements = measurements.filter(m => m.interiorType === 'wallpapers');
  const blindsMeasurements = measurements.filter(m => m.interiorType === 'blinds');
  const flooringMeasurements = measurements.filter(m => m.interiorType === 'flooring');

  // Calculate totals for each type
  const curtainTotal = curtainMeasurements.reduce((sum, m) => sum + (m.totalCost || 0), 0);
  const netTotal = netMeasurements.reduce((sum, m) => sum + (m.totalCost || 0), 0);
  const blindsTotal = blindsMeasurements.reduce((sum, m) => sum + (m.totalCost || 0), 0);
  const flooringTotal = flooringMeasurements.reduce((sum, m) => sum + (m.totalCost || ((m.costOfRoom || 0) + (m.layingCharge || 0))), 0);

  // Wallpaper calculation
  let wallpaperTotal = 0;
  let totalWallpaperRolls = 0;
  let totalWallpaperMaterialCost = 0;
  let totalWallpaperImplementationCost = 0;
  wallpaperMeasurements.forEach(m => {
    const width = parseFloat(m.width) || 0;
    const height = parseFloat(m.height) || 0;
    const costPerRoll = parseFloat(m.costPerRoll) || 0;
    const implementationCostPerRoll = parseFloat(m.implementationCostPerRoll) || 0;
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
    wallpaperTotal += totalCost;
    totalWallpaperRolls += rolls;
    totalWallpaperMaterialCost += totalMaterialCost;
    totalWallpaperImplementationCost += totalImplementationCost;
  });
  // Calculate rod cost for curtains only
  let rodLength = 0;
  let rodCost = 0;
  curtainMeasurements.forEach(m => {
    const width = m.width || 0;
    const rate = m.rodRatePerLength || 0;
    const length = width / 12;
    rodLength += length;
    rodCost += length * rate;
  });
  const subtotal = curtainTotal + netTotal + wallpaperTotal + blindsTotal + flooringTotal;
  const grandTotal = subtotal + rodCost;

  return {
    ...projectData,
    curtainTotal,
    netTotal,
    wallpaperTotal,
    blindsTotal,
    flooringTotal,
    rodCost,
    rodLength,
    grandTotal,
    totalWallpaperRolls,
    totalWallpaperMaterialCost,
    totalWallpaperImplementationCost
  };
}
