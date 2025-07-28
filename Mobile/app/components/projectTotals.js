// Shared project total calculation logic
export function calculateProjectTotals(projectData) {
  const measurements = projectData.measurements || [];
  
  // Collect all curtain measurements including those in rooms
  let allCurtainMeasurements = [];
  
  // Get regular measurements (backward compatibility)
  const regularCurtainMeasurements = measurements.filter(m => m.interiorType === 'curtains');
  allCurtainMeasurements = [...regularCurtainMeasurements];
  
  // Get measurements from curtain rooms
  if (projectData.curtainRooms && Array.isArray(projectData.curtainRooms)) {
    projectData.curtainRooms.forEach(room => {
      if (room.measurements && Array.isArray(room.measurements)) {
        const roomMeasurements = room.measurements.map(m => ({
          ...m,
          roomId: room.id,
          roomName: room.name,
          interiorType: "curtains"
        }));
        allCurtainMeasurements.push(...roomMeasurements);
      }
    });
  }
  
  // Group other measurements by interior type
  const netMeasurements = measurements.filter(m => m.interiorType === 'mosquito-nets');
  const wallpaperMeasurements = measurements.filter(m => m.interiorType === 'wallpapers');
  const blindsMeasurements = measurements.filter(m => m.interiorType === 'blinds');
  const flooringMeasurements = measurements.filter(m => m.interiorType === 'flooring');
  
  // Calculate totals for each type
  let curtainTotal = 0;
  let curtainClothCostWithGST = 0;
  let curtainRodCostWithGST = 0;
  
  // New curtain calculation with grandTotal from schema
  allCurtainMeasurements.forEach(m => {
    if (m.grandTotal) {
      // Use the new calculation structure
      curtainTotal += m.grandTotal;
      curtainClothCostWithGST += (m.clothCostWithGST || 0);
      curtainRodCostWithGST += (m.rodCostWithGST || 0);
    } else {
      // Fallback to old structure
      curtainTotal += (m.totalCost || m.totalCurtainCost || 0);
    }
  });
  
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
    }    const totalMaterialCost = Math.ceil(rolls * costPerRoll);
    const totalImplementationCost = Math.ceil(rolls * implementationCostPerRoll);
    const totalCost = totalMaterialCost + totalImplementationCost;
    wallpaperTotal += totalCost;
    totalWallpaperRolls += rolls;
    totalWallpaperMaterialCost += totalMaterialCost;
    totalWallpaperImplementationCost += totalImplementationCost;
  });  // Calculate rod cost for curtains (legacy compatibility)
  let rodLength = 0;
  let rodCost = 0;
  allCurtainMeasurements.forEach(m => {
    const width = m.width || 0;
    const rate = m.rodRatePerLength || 0;
    const length = width / 12;
    rodLength += length;
    rodCost += length * rate;
  });
  
  // For new curtain structure, the curtainTotal already includes everything
  // For other types, add them normally
  const subtotal = netTotal + wallpaperTotal + blindsTotal + flooringTotal;
  const grandTotal = curtainTotal + subtotal; // curtainTotal already includes rod costs if using new structure

  return {
    ...projectData,
    curtainTotal,
    curtainClothCostWithGST,
    curtainRodCostWithGST,
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
