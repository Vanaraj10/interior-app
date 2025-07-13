// Schema and calculation logic for each interior type
export const INTERIOR_SCHEMAS = {
  curtains: {
    label: 'Curtains',
    fields: [
      { name: 'roomLabel', label: 'Room/Location Label', type: 'text', required: true },
      { name: 'width', label: 'Width (inches)', type: 'number', required: true },
      { name: 'height', label: 'Height (inches)', type: 'number', required: true },
      { name: 'curtainType', label: 'Curtain Type', type: 'picker', options: ['Eyelet', 'Pleated', 'Plain', 'Belt Model', 'Ripple', 'Button'] },
      { name: 'clothRatePerMeter', label: 'Cloth Rate/Meter (₹)', type: 'number', required: true },
      { name: 'stitchingCostPerPiece', label: 'Stitching Cost/Piece (₹)', type: 'number', required: true },
      { name: 'rodRatePerLength', label: 'Rod Rate per Length (₹)', type: 'number', required: true },
      { name: 'parts', label: 'Parts', type: 'picker', options: ['Two Parts', 'One Part'], required: false },
      { name: 'hasLining', label: 'Add Lining', type: 'checkbox', required: false },
      { name: 'liningType', label: 'Lining Type', type: 'picker', options: ['Blackout lining', 'Pure blackout lining', 'Satin'], required: false, showIf: (data) => !!data.hasLining },
      { name: 'liningCostPerMeter', label: 'Lining Cost per Meter (₹)', type: 'number', required: false, showIf: (data) => !!data.hasLining },
    ],
    calculate: (data) => {
      // Pieces calculation
      const width = parseFloat(data.width) || 0;
      let pieces = 1.0;
      if (width < 12) pieces = 1.0;
      else if (width <= 20) pieces = 1.0;
      else if (width <= 28) pieces = 1.5;
      else if (width <= 40) pieces = 2.0;
      else if (width <= 50) pieces = 2.5;
      else if (width <= 60) pieces = 3.0;
      else if (width <= 70) pieces = 3.5;
      else if (width <= 80) pieces = 4.0;
      else if (width <= 90) pieces = 4.5;
      else if (width <= 100) pieces = 5.0;
      else if (width <= 110) pieces = 5.5;
      else if (width <= 120) pieces = 6.0;
      else if (width <= 130) pieces = 6.5;
      else if (width <= 140) pieces = 7.0;
      else pieces = 7 + (Math.ceil((width - 140) / 10) * 0.5);
      // Meters
      const height = parseFloat(data.height) || 0;
      const roundedPieces = Math.ceil(pieces);
      const totalMeters = ((height + 15) * roundedPieces) / 39;
      // Costs
      const clothRate = parseFloat(data.clothRatePerMeter) || 0;
      const stitchingRate = parseFloat(data.stitchingCostPerPiece) || 0;      const clothCost = totalMeters * clothRate;
      const stitchingCost = pieces * stitchingRate;
      let totalCost = clothCost + stitchingCost;
      const parts = data.parts || 'Two Parts';      // Lining calculation
      let totalLiningMeters = 0;
      let totalLiningCost = 0;
      let liningType = data.liningType || '';
      if (data.hasLining) {
        totalLiningMeters = ((parseFloat(data.height) + 1) * roundedPieces) / 39;
        const liningCostPerMeter = parseFloat(data.liningCostPerMeter) || 0;
        totalLiningCost = totalLiningMeters * liningCostPerMeter;
        liningType = data.liningType;
        // Add lining cost to total cost
        totalCost += totalLiningCost;
      }
      return {
        pieces,
        totalMeters,
        clothCost,
        stitchingCost,
        totalCost,
        parts,
        hasLining: !!data.hasLining,
        liningType,
        totalLiningMeters,
        liningCostPerMeter: data.liningCostPerMeter || 0,
        totalLiningCost,
      };
    }
  },
  'mosquito-nets': {
    label: 'Mosquito Nets',
    fields: [
      { name: 'roomLabel', label: 'Room/Location Label', type: 'text', required: true },
      { name: 'width', label: 'Width (inches)', type: 'number', required: true },
      { name: 'height', label: 'Height (inches)', type: 'number', required: true },
      { name: 'materialType', label: 'Material Type', type: 'picker', required: true, options: ['Fibre net', 'S.S net', 'Sleek net', 'Magnatic net', 'Pleated net', 'Honey Comb'] },
      { name: 'materialRatePerSqft', label: 'Material Rate/Sqft (₹)', type: 'number', required: true },
      { name: 'customDescription', label: 'Custom Description', type: 'text', required: false },
    ],
    calculate: (data) => {
      // Convert inches to feet and round to 1 decimal place
      const widthInches = parseFloat(data.width) || 0;
      const heightInches = parseFloat(data.height) || 0;
      const widthFeet = Math.round((widthInches / 12) * 10) / 10; // e.g., 4.67 -> 4.7
      const heightFeet = Math.round((heightInches / 12) * 10) / 10;      const totalSqft = widthFeet * heightFeet;
      const materialRate = parseFloat(data.materialRatePerSqft) || 0;
      const materialCost = totalSqft * materialRate;
      return {
        widthFeet,
        heightFeet,
        totalSqft,
        materialCost,
        totalCost: materialCost, // Add totalCost for consistency with other interior types
      };
    }
  },
  wallpapers: {
    label: 'Wallpapers',
    fields: [
      { name: 'roomLabel', label: 'Room/Location Label', type: 'text', required: true },
      { name: 'width', label: 'Width (inches)', type: 'number', required: true },
      { name: 'height', label: 'Height (inches)', type: 'number', required: true },
      { name: 'costPerRoll', label: 'Cost per Roll (₹)', type: 'number', required: true },
      { name: 'implementationCostPerRoll', label: 'Implementation Cost per Roll (₹)', type: 'number', required: true },
    ],
    calculate: (data) => {
      const width = parseFloat(data.width) || 0;
      const height = parseFloat(data.height) || 0;
      const costPerRoll = parseFloat(data.costPerRoll) || 0;
      const implementationCostPerRoll = parseFloat(data.implementationCostPerRoll) || 0;
      // Step 1: Square inches
      const squareInches = width * height;
      // Step 2: Square feet
      const squareFeet = squareInches / 144;
      // Step 3: Rolls needed
      let rolls = squareFeet / 50;
      const decimal = rolls - Math.floor(rolls);
      if (decimal >= 0.3) {
        rolls = Math.ceil(rolls);
      } else {
        rolls = Math.max(1, Math.floor(rolls));
      }
      // Step 4: Total cost
      const totalMaterialCost = rolls * costPerRoll;
      const totalImplementationCost = rolls * implementationCostPerRoll;
      const totalCost = totalMaterialCost + totalImplementationCost;
      return {
        squareInches,
        squareFeet,
        rolls,
        costPerRoll,
        implementationCostPerRoll,
        totalMaterialCost,
        totalImplementationCost,
        totalCost,
      };
    }
  },
  blinds: {
    label: 'Blinds',
    fields: [
      { name: 'roomLabel', label: 'Room/Location Label', type: 'text', required: true },
      { name: 'height', label: 'Height (inches)', type: 'number', required: true },
      { name: 'width', label: 'Width (inches)', type: 'number', required: true },
      { name: 'blindType', label: 'Blind Type', type: 'picker', options: ['Roman Blinds', 'PVC Blinds', 'Roller Blinds', 'Zebra Blinds', 'Vertical Blinds'], required: true },
      { name: 'costPerSqft', label: 'Cost/Sqft (₹)', type: 'number', required: true },
      // Roman Blinds specific fields
      { name: 'clothCostPerSqft', label: 'Cloth Cost/Sqft (₹)', type: 'number', required: false, showIf: (data) => data.blindType === 'Roman Blinds' },
      { name: 'panelWidth', label: 'Panel Width', type: 'picker', options: ['48"', '56"'], required: false, showIf: (data) => data.blindType === 'Roman Blinds' },
      { name: 'stitchingCostPerPart', label: 'Stitching Cost/Part (₹)', type: 'number', required: false, showIf: (data) => data.blindType === 'Roman Blinds' },
    ],
    calculate: (data) => {
      const height = parseFloat(data.height) || 0;
      const width = parseFloat(data.width) || 0;
      const costPerSqft = parseFloat(data.costPerSqft) || 0;
      
      // Basic calculations for all blinds
      const totalSqft = (height * width) / 144;
      const blindsCost = totalSqft * costPerSqft;
      
      let totalCost = blindsCost;
      let part = 1;
      let clothRequired = 0;
      let clothCost = 0;
      let stitchingCost = 0;
      
      // Additional calculations for Roman Blinds
      if (data.blindType === 'Roman Blinds') {
        const panelWidth = data.panelWidth || '48"';
        const clothCostPerSqft = parseFloat(data.clothCostPerSqft) || 0;
        const stitchingCostPerPart = parseFloat(data.stitchingCostPerPart) || 0;
        
        // Calculate parts based on panel width and actual width
        if (panelWidth === '48"') {
          if (width <= 45) part = 1;
          else if (width <= 90) part = 2;
          else if (width <= 135) part = 3;
          else part = Math.ceil(width / 45);
        } else if (panelWidth === '56"') {
          if (width <= 50) part = 1;
          else if (width <= 100) part = 2;
          else if (width <= 150) part = 3;
          else part = Math.ceil(width / 50);
        }
        
        // Calculate cloth required and costs
        clothRequired = ((height + 15) / 39) * part;
        clothCost = clothRequired * clothCostPerSqft;
        stitchingCost = part * stitchingCostPerPart;
        
        totalCost = blindsCost + clothCost + stitchingCost;
      }
      
      return {
        totalSqft,
        blindsCost,
        part,
        clothRequired,
        clothCost,
        stitchingCost,
        totalCost,
      };
    }
  },
  flooring: {
    label: "Flooring",
    fields: [
      { name: "roomLabel", label: "Room", type: "text" },
      { name: "height", label: "Height (inches)", type: "number" },
      { name: "width", label: "Width (inches)", type: "number" },
      { name: "costPerSqft", label: "Cost/Sqft", type: "number" },
      { name: "layingPerSqft", label: "Laying/Sqft", type: "number" },
    ],
    calculate: (m) => {
      const height = parseFloat(m.height) || 0;
      const width = parseFloat(m.width) || 0;
      const totalSqft = (height * width) / 144;
      const costOfRoom = totalSqft * (parseFloat(m.costPerSqft) || 0);
      const layingCharge = totalSqft * (parseFloat(m.layingPerSqft) || 0);
      return {
        ...m,
        totalSqft,
        costOfRoom,
        layingCharge,
        totalCost: costOfRoom + layingCharge,
      };
    },
    tableColumns: [
      { key: "sno", label: "S.No" },
      { key: "roomLabel", label: "Room" },
      { key: "height", label: "Height" },
      { key: "width", label: "Width" },
      { key: "totalSqft", label: "Total Sqft" },
      { key: "costOfRoom", label: "Cost of Room" },
      { key: "layingCharge", label: "Laying Charge" },
      { key: "totalCost", label: "Total Cost" },
    ],
  }
};
