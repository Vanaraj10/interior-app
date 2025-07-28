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
  // Group measurements by roomId
  const measurementsByRoom = measurements.reduce((acc, m) => {
    if (!m.roomId) {
      // Handle legacy measurements without roomId
      if (!acc.legacy) acc.legacy = [];
      acc.legacy.push(m);
    } else {
      if (!acc[m.roomId]) acc[m.roomId] = [];
      acc[m.roomId].push(m);
    }
    return acc;
  }, {});
  
  // Generate HTML for each room group
  let html = [];
  let globalIndex = 1;
  
  // Process legacy measurements (without roomId) first if they exist
  if (measurementsByRoom.legacy && measurementsByRoom.legacy.length > 0) {
    html.push(`
      <tr style="background-color: #f0f9ff;">
        <td colspan="12" style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Other Measurements</td>
      </tr>
    `);
    
    measurementsByRoom.legacy.forEach(m => {
      html.push(`
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${globalIndex++}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${m.roomLabel}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.width}"</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.height}"</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.parts || m.pieces || '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.stitchingModel || m.curtainType || 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${(m.mainMetre || m.totalMeters || 0).toFixed(2)}m</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            <div style="font-weight: bold;">${formatCurrency(m.clothCost || 0)}</div>
            ${m.mainMetre && m.clothRatePerMeter ? `<div style="font-size: 11px; color: #666;">${(m.mainMetre).toFixed(2)}m × ${formatCurrency(m.clothRatePerMeter)}</div>` : ''}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            <div style="font-weight: bold;">${formatCurrency(m.stitchingCost || 0)}</div>
            ${m.parts && m.stitchingCostPerPart ? `<div style="font-size: 11px; color: #666;">${m.parts} × ${formatCurrency(m.stitchingCostPerPart)}</div>` : ''}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            ${m.hasLining ? `<div style='font-weight: bold;'>${(m.liningMetre || m.totalLiningMeters || 0).toFixed(2)}m</div>` : '-'}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            ${m.hasLining ? `<div style='font-weight: bold;'>${formatCurrency(m.liningCost || m.totalLiningCost || 0)}</div>` : '-'}
            ${m.hasLining && m.liningMetre && m.liningRatePerMeter ? `<div style="font-size: 11px; color: #666;">${(m.liningMetre).toFixed(2)}m × ${formatCurrency(m.liningRatePerMeter)}</div>` : ''}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(m.totalCurtainCost || m.totalCost || 0)}</td>
        </tr>
      `);
    });
  }
  
  // Process each room group
  Object.entries(measurementsByRoom).forEach(([roomId, roomMeasurements]) => {
    // Skip the legacy measurements as we already processed them
    if (roomId === 'legacy') return;
    
    // Get room name from the first measurement in the group
    const roomName = roomMeasurements[0].roomName || 'Room';
    
    html.push(`
      <tr style="background-color: #f0f9ff;">
        <td colspan="12" style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Room: ${roomName}</td>
      </tr>
    `);
    
    roomMeasurements.forEach(m => {
      html.push(`
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${globalIndex++}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${m.roomLabel}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.width}"</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.height}"</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.parts || m.pieces || '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.stitchingModel || m.curtainType || 'N/A'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${(m.mainMetre || m.totalMeters || 0).toFixed(2)}m</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            <div style="font-weight: bold;">${formatCurrency(m.clothCost || 0)}</div>
            ${m.mainMetre && m.clothRatePerMeter ? `<div style="font-size: 11px; color: #666;">${(m.mainMetre).toFixed(2)}m × ${formatCurrency(m.clothRatePerMeter)}</div>` : ''}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            <div style="font-weight: bold;">${formatCurrency(m.stitchingCost || 0)}</div>
            ${m.parts && m.stitchingCostPerPart ? `<div style="font-size: 11px; color: #666;">${m.parts} × ${formatCurrency(m.stitchingCostPerPart)}</div>` : ''}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            ${m.hasLining ? `<div style='font-weight: bold;'>${(m.liningMetre || m.totalLiningMeters || 0).toFixed(2)}m</div>` : '-'}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            ${m.hasLining ? `<div style='font-weight: bold;'>${formatCurrency(m.liningCost || m.totalLiningCost || 0)}</div>` : '-'}
            ${m.hasLining && m.liningMetre && m.liningRatePerMeter ? `<div style="font-size: 11px; color: #666;">${(m.liningMetre).toFixed(2)}m × ${formatCurrency(m.liningRatePerMeter)}</div>` : ''}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(m.totalCurtainCost || m.totalCost || 0)}</td>
        </tr>
      `);
    });
  });
  
  return html.join('');
}

// Generate Rod Cost table (Table 2)
export function generateRodCostRows(measurements, formatCurrency) {
  if (!measurements.length) return '';
  
  // Group measurements by roomId for rod cost calculation
  const measurementsByRoom = measurements.reduce((acc, m) => {
    if (!m.roomId) {
      // Handle legacy measurements without roomId
      if (!acc.legacy) acc.legacy = [];
      acc.legacy.push(m);
    } else {
      if (!acc[m.roomId]) acc[m.roomId] = [];
      acc[m.roomId].push(m);
    }
    return acc;
  }, {});
  
  // Generate HTML for each room group
  let html = [];
  let globalIndex = 1;
  
  // Track totals across all rooms
  let totalClampCost = 0;
  let totalDoomCost = 0;
  let totalClampRequired = 0;
  let totalDoomRequired = 0;
  let totalRodFeet = 0;
  let totalRodsRequired = 0;
  let totalRodCost = 0;
  
  // Process legacy measurements (without roomId) first if they exist
  if (measurementsByRoom.legacy && measurementsByRoom.legacy.length > 0) {
    const legacyMeasurements = measurementsByRoom.legacy;
    
    html.push(`
      <tr style="background-color: #f0f9ff;">
        <td colspan="7" style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Other Measurements</td>
      </tr>
    `);
    
    // Calculate rod requirements for legacy measurements
    const legacyWidths = legacyMeasurements.map(m => parseFloat(m.width) || 0);
    const legacyRodCalc = calculateRods(legacyWidths);
    const legacyRodsRequired = legacyRodCalc.totalRods;
    const rodRatePerLength = legacyMeasurements.length > 0 ? (parseFloat(legacyMeasurements[0].rodRatePerLength) || 0) : 0;
    const legacyRodCost = legacyRodsRequired * rodRatePerLength;
    
    // Track for grand totals
    totalRodsRequired += legacyRodsRequired;
    totalRodCost += legacyRodCost;
    
    // Add rod calculation row for legacy measurements
    html.push(`
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;" colspan="2">Rod Calculation</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;" colspan="2">${legacyRodsRequired} rods required</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;" colspan="2">
          <div style="font-weight: bold;">${formatCurrency(legacyRodCost)}</div>
          <div style="font-size: 11px; color: #666;">${legacyRodsRequired} × ${formatCurrency(rodRatePerLength)}</div>
        </td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(legacyRodCost)}</td>
      </tr>
    `);
    
    // Add individual measurement rows for legacy
    legacyMeasurements.forEach(m => {
      const rodFeet = (parseFloat(m.width) || 0) / 12;
      const clampCost = (parseFloat(m.clampRequired) || 0) * (parseFloat(m.clampRatePerPiece) || 0);
      const doomCost = (parseFloat(m.doomRequired) || 0) * (parseFloat(m.doomRatePerPiece) || 0);
      const itemWallBracketCost = clampCost + doomCost;
      
      // Track for totals
      totalRodFeet += rodFeet;
      totalClampRequired += parseFloat(m.clampRequired) || 0;
      totalDoomRequired += parseFloat(m.doomRequired) || 0;
      totalClampCost += clampCost;
      totalDoomCost += doomCost;
      
      html.push(`
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${globalIndex++}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.curtainBracketModels || '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${rodFeet.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            <div style="font-weight: bold;">${formatCurrency(clampCost)}</div>
            ${m.clampRequired && m.clampRatePerPiece ? `<div style="font-size: 11px; color: #666;">${m.clampRequired} × ${formatCurrency(m.clampRatePerPiece)}</div>` : ''}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            <div style="font-weight: bold;">${formatCurrency(doomCost)}</div>
            ${m.doomRequired && m.doomRatePerPiece ? `<div style="font-size: 11px; color: #666;">${m.doomRequired} × ${formatCurrency(m.doomRatePerPiece)}</div>` : ''}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(itemWallBracketCost)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(itemWallBracketCost)}</td>
        </tr>
      `);
    });
    
    // Calculate total wall bracket cost for legacy section
    const legacyWallBracketCost = legacyMeasurements.reduce((sum, m) => {
      const clampCost = (parseFloat(m.clampRequired) || 0) * (parseFloat(m.clampRatePerPiece) || 0);
      const doomCost = (parseFloat(m.doomRequired) || 0) * (parseFloat(m.doomRatePerPiece) || 0);
      return sum + clampCost + doomCost;
    }, 0);
    
    // Add subtotal row for legacy measurements
    html.push(`
      <tr style="background:#f0f8fa;">
        <td style="padding:8px;border:1px solid #ddd;text-align:center;" colspan="2">Subtotal</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${legacyMeasurements.reduce((sum, m) => sum + ((parseFloat(m.width) || 0) / 12), 0).toFixed(2)} ft</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;" colspan="2">Wall Brackets: ${formatCurrency(legacyWallBracketCost)}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;">Rods: ${formatCurrency(legacyRodCost)}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">${formatCurrency(legacyWallBracketCost + legacyRodCost)}</td>
      </tr>
    `);
  }
  
  // Process each room group
  Object.entries(measurementsByRoom).forEach(([roomId, roomMeasurements]) => {
    // Skip the legacy measurements as we already processed them
    if (roomId === 'legacy') return;
    
    // Get room name from the first measurement in the group
    const roomName = roomMeasurements[0].roomName || 'Room';
    
    html.push(`
      <tr style="background-color: #f0f9ff;">
        <td colspan="7" style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Room: ${roomName}</td>
      </tr>
    `);
    
    // Calculate rod requirements for this room
    const roomWidths = roomMeasurements.map(m => parseFloat(m.width) || 0);
    const roomRodCalc = calculateRods(roomWidths);
    const roomRodsRequired = roomRodCalc.totalRods;
    const rodRatePerLength = roomMeasurements.length > 0 ? (parseFloat(roomMeasurements[0].rodRatePerLength) || 0) : 0;
    const roomRodCost = roomRodsRequired * rodRatePerLength;
    
    // Track for grand totals
    totalRodsRequired += roomRodsRequired;
    totalRodCost += roomRodCost;
    
    // Add rod calculation row for this room
    html.push(`
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;" colspan="2">Rod Calculation</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;" colspan="2">${roomRodsRequired} rods required</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;" colspan="2">
          <div style="font-weight: bold;">${formatCurrency(roomRodCost)}</div>
          <div style="font-size: 11px; color: #666;">${roomRodsRequired} × ${formatCurrency(rodRatePerLength)}</div>
        </td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(roomRodCost)}</td>
      </tr>
    `);
    
    roomMeasurements.forEach(m => {
      const rodFeet = (parseFloat(m.width) || 0) / 12;
      const clampCost = (parseFloat(m.clampRequired) || 0) * (parseFloat(m.clampRatePerPiece) || 0);
      const doomCost = (parseFloat(m.doomRequired) || 0) * (parseFloat(m.doomRatePerPiece) || 0);
      const itemWallBracketCost = clampCost + doomCost;
      
      // Track for totals
      totalRodFeet += rodFeet;
      totalClampRequired += parseFloat(m.clampRequired) || 0;
      totalDoomRequired += parseFloat(m.doomRequired) || 0;
      totalClampCost += clampCost;
      totalDoomCost += doomCost;
      
      html.push(`
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${globalIndex++}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${m.curtainBracketModels || '-'}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${rodFeet.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            <div style="font-weight: bold;">${formatCurrency(clampCost)}</div>
            ${m.clampRequired && m.clampRatePerPiece ? `<div style="font-size: 11px; color: #666;">${m.clampRequired} × ${formatCurrency(m.clampRatePerPiece)}</div>` : ''}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">
            <div style="font-weight: bold;">${formatCurrency(doomCost)}</div>
            ${m.doomRequired && m.doomRatePerPiece ? `<div style="font-size: 11px; color: #666;">${m.doomRequired} × ${formatCurrency(m.doomRatePerPiece)}</div>` : ''}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(itemWallBracketCost)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(itemWallBracketCost)}</td>
        </tr>
      `);
    });
    
    // Calculate total wall bracket cost for this room
    const roomWallBracketCost = roomMeasurements.reduce((sum, m) => {
      const clampCost = (parseFloat(m.clampRequired) || 0) * (parseFloat(m.clampRatePerPiece) || 0);
      const doomCost = (parseFloat(m.doomRequired) || 0) * (parseFloat(m.doomRatePerPiece) || 0);
      return sum + clampCost + doomCost;
    }, 0);
    
    // Add subtotal row for this room
    html.push(`
      <tr style="background:#f0f8fa;">
        <td style="padding:8px;border:1px solid #ddd;text-align:center;" colspan="2">Subtotal</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${roomMeasurements.reduce((sum, m) => sum + ((parseFloat(m.width) || 0) / 12), 0).toFixed(2)} ft</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;" colspan="2">Wall Brackets: ${formatCurrency(roomWallBracketCost)}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;">Rods: ${formatCurrency(roomRodCost)}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">${formatCurrency(roomWallBracketCost + roomRodCost)}</td>
      </tr>
    `);
  });
  
  // Calculate the total wall bracket cost
  const totalWallBracketCost = totalClampCost + totalDoomCost;
  
  // Calculate the number of rooms for summary
  const roomCount = Object.keys(measurementsByRoom).filter(key => key !== 'legacy').length + 
                   (measurementsByRoom.legacy && measurementsByRoom.legacy.length > 0 ? 1 : 0);
  
  // Grand total row
  html.push(`
    <tr style="background:#f0f0f0;font-weight:bold;">
      <td style="padding:8px;border:1px solid #ddd;text-align:center;" colspan="2">GRAND TOTAL</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:center;">${totalRodFeet.toFixed(2)} ft</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right;" colspan="2">
        <div style="font-weight: bold;">Wall Brackets: ${formatCurrency(totalWallBracketCost)}</div>
        <div style="font-size: 11px; color: #666;">Clamps: ${totalClampRequired}, Dooms: ${totalDoomRequired}</div>
      </td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right;">
        <div style="font-weight: bold;">Rods: ${formatCurrency(totalRodCost)}</div>
        <div style="font-size: 11px; color: #666;">Total: ${totalRodsRequired} rods</div>
      </td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">${formatCurrency(totalWallBracketCost + totalRodCost)}</td>
    </tr>
  `);
  
  return html.join('');
}

// Generate Total Cost Summary
export function generateTotalCostSummary(measurements, formatCurrency) {
  if (!measurements.length) return '';
  
  // Calculate cloth cost total (with 5% GST)
  const totalCurtainCost = measurements.reduce((sum, m) => sum + (parseFloat(m.totalCurtainCost) || parseFloat(m.totalCost) || 0), 0);
  const clothCostWithGST = Math.ceil(totalCurtainCost * 1.05);
  
  // Calculate rod cost total (with 18% GST)
  const totalWallBracketCost = measurements.reduce((sum, m) => {
    const clampCost = (parseFloat(m.clampRequired) || 0) * (parseFloat(m.clampRatePerPiece) || 0);
    const doomCost = (parseFloat(m.doomRequired) || 0) * (parseFloat(m.doomRatePerPiece) || 0);
    return sum + clampCost + doomCost;
  }, 0);
  
  // Group measurements by room
  const measurementsByRoom = measurements.reduce((acc, m) => {
    if (!m.roomId) {
      if (!acc.legacy) acc.legacy = [];
      acc.legacy.push(m);
    } else {
      if (!acc[m.roomId]) acc[m.roomId] = [];
      acc[m.roomId].push(m);
    }
    return acc;
  }, {});
  
  // Calculate total rods needed (room by room)
  let totalRodsRequired = 0;
  let totalRodCost = 0;
  
  // Process legacy measurements (without roomId) if they exist
  if (measurementsByRoom.legacy && measurementsByRoom.legacy.length > 0) {
    const legacyWidths = measurementsByRoom.legacy.map(m => parseFloat(m.width) || 0);
    const legacyRodCalc = calculateRods(legacyWidths);
    const rodRatePerLength = measurementsByRoom.legacy.length > 0 ? 
      (parseFloat(measurementsByRoom.legacy[0].rodRatePerLength) || 0) : 0;
    
    totalRodsRequired += legacyRodCalc.totalRods;
    totalRodCost += legacyRodCalc.totalRods * rodRatePerLength;
  }
  
  // Process each room group
  Object.entries(measurementsByRoom).forEach(([roomId, roomMeasurements]) => {
    if (roomId === 'legacy') return; // Skip legacy, already handled
    
    const roomWidths = roomMeasurements.map(m => parseFloat(m.width) || 0);
    const roomRodCalc = calculateRods(roomWidths);
    const rodRatePerLength = roomMeasurements.length > 0 ? 
      (parseFloat(roomMeasurements[0].rodRatePerLength) || 0) : 0;
    
    totalRodsRequired += roomRodCalc.totalRods;
    totalRodCost += roomRodCalc.totalRods * rodRatePerLength;
  });
  
  totalRodCost = Math.ceil(totalRodCost);
  const totalRodCostWithGST = Math.ceil((totalWallBracketCost + totalRodCost) * 1.18);
  
  const grandTotal = clothCostWithGST + totalRodCostWithGST;return `
    <div style="margin-top: 20px;">
      <h4 style="margin: 0 0 10px 0;">Cost Summary</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
          <td style="padding: 4px 8px; border: 1px solid #ddd;">Total Rods Required:</td>
          <td style="padding: 4px 8px; border: 1px solid #ddd; text-align: right;">${totalRodsRequired} rods</td>
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

  // Calculate the number of rooms
  const roomIds = new Set();
  measurements.forEach(m => {
    if (m.roomId) {
      roomIds.add(m.roomId);
    }
  });
  
  const roomCount = roomIds.size || 1; // Default to 1 if no room IDs found
  const itemCount = measurements.length;

  return `<tr style="background:#f0f9ff;font-weight:bold;">
    <td style="padding:8px;border:1px solid #ddd;text-align:right;">Total</td>
    <td style="padding:8px;border:1px solid #ddd;text-align:center;">(${roomCount} ${roomCount > 1 ? 'rooms' : 'room'}, ${itemCount} ${itemCount > 1 ? 'items' : 'item'})</td>
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
