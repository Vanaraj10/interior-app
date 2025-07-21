// Rod calculation helper function
const calculateRods = (widths, rodLength = 144) => {
  // Sort widths from largest to smallest
  const sortedWidths = [...widths].sort((a, b) => b - a);
  const rods = [];

  sortedWidths.forEach((width) => {
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
      rods.push({
        items: [width],
        total: width,
      });
    }
  });

  return {
    totalRods: rods.length,
    rods,
  };
};

// Export the helper function
export { calculateRods };

// Schema and calculation logic for each interior type
export const INTERIOR_SCHEMAS = {
  curtains: {
    label: "Curtains",
    fields: [
      { name: "roomLabel", label: "Room", type: "text", required: true },
      {
        name: "width",
        label: "Width (inches)",
        type: "number",
        required: true,
      },
      {
        name: "height",
        label: "Height (inches)",
        type: "number",
        required: true,
      },
      {
        name: "stitchingModel",
        label: "Stitching Model",
        type: "picker",
        options: [
          "Pleated",
          "Eyelet",
          "Plain Curtain",
          "Belt Model",
          "Ripple Curtain",
          "Button Model",
        ],
        required: true,
      },
      {
        name: "clothRatePerMeter",
        label: "Cloth Rate/Metre (₹)",
        type: "number",
        required: true,
      },
      {
        name: "stitchingCostPerPart",
        label: "Stitching Cost/Part (₹)",
        type: "number",
        required: true,
      },
      {
        name: "curtainBracketModels",
        label: "Curtain Bracket Models",
        type: "picker",
        options: [
          "MS Rod",
          "SS Rod(202 Grade)",
          "SS Rod(304 Grade)",
          "Brass Rod",
          "Decorative Rod",
          "Track Model",
        ],
        required: true,
      },
      {
        name: "rodRatePerLength",
        label: "Rod Rate/Length (₹)",
        type: "number",
        required: true,
      },
      {
        name: "clampRequired",
        label: "Clamp Required",
        type: "number",
        required: true,
      },
      {
        name: "clampRatePerPiece",
        label: "Clamp Rate/Piece (₹)",
        type: "number",
        required: true,
      },
      {
        name: "doomRequired",
        label: "Doom Required",
        type: "number",
        required: true,
      },
      {
        name: "doomRatePerPiece",
        label: "Doom Rate/Piece (₹)",
        type: "number",
        required: true,
      },
      {
        name: "opening",
        label: "Opening",
        type: "picker",
        options: ["Single Open", "No open"],
        required: true,
      },
      {
        name: "hasLining",
        label: "Add Lining",
        type: "checkbox",
        required: false,
      },
      {
        name: "liningModel",
        label: "Lining Model",
        type: "picker",
        options: ["Blackout Lining", "Satin Lining", "Pure BlackOut Lining"],
        required: false,
        showIf: (data) => !!data.hasLining,
      },
      {
        name: "liningRatePerMeter",
        label: "Lining Rate/Metre (₹)",
        type: "number",
        required: false,
        showIf: (data) => !!data.hasLining,
      },
    ],
    calculate: (data) => {
      const width = parseFloat(data.width) || 0;
      const height = parseFloat(data.height) || 0;
      const opening = data.opening || "Single Open";

      // Calculate pieces based on width ranges
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
      else pieces = 7 + Math.ceil((width - 140) / 10) * 0.5;

      // Round pieces to get parts
      const parts = pieces;

      // Calculate Main Metre: ((Height+12)*Part)/39
      const mainMetre = ((height + 12) * parts) / 39;

      // Calculate costs
      const clothRatePerMeter = parseFloat(data.clothRatePerMeter) || 0;
      const stitchingCostPerPart = parseFloat(data.stitchingCostPerPart) || 0;

      const clothCost = mainMetre * clothRatePerMeter;
      const stitchingCost = parts * stitchingCostPerPart;

      // Lining calculations
      let liningMetre = 0;
      let liningCost = 0;
      let totalCurtainCost = clothCost + stitchingCost;

      if (data.hasLining) {
        liningMetre = mainMetre; // Same as Main Metre
        const liningRatePerMeter = parseFloat(data.liningRatePerMeter) || 0;
        liningCost = liningMetre * liningRatePerMeter;
        totalCurtainCost = clothCost + stitchingCost + liningCost;
      }
      // Rod calculations
      const rodFeet = width / 12;
      const clampRequired = parseFloat(data.clampRequired) || 0;
      const clampRatePerPiece = parseFloat(data.clampRatePerPiece) || 0;
      const doomRequired = parseFloat(data.doomRequired) || 0;
      const doomRatePerPiece = parseFloat(data.doomRatePerPiece) || 0;

      const clampCost = clampRequired * clampRatePerPiece;
      const doomCost = doomRequired * doomRatePerPiece;
      const totalWallBracketCost = clampCost + doomCost;      // Note: Rod calculation should be done at project level, not individual measurement
      // For individual measurements, we'll set totalRodsRequired to 0 as placeholder
      // The actual rod calculation happens at project level using all widths
      const totalRodsRequired = 0; // Project-level calculation required
      const rodRatePerLength = parseFloat(data.rodRatePerLength) || 0;
      const totalRodCost = 0; // Will be calculated at project level

      // Final rod cost including wall bracket cost
      const totalRodCostComplete = totalWallBracketCost + totalRodCost;
      // Final calculations with GST
      const clothCostWithGST = totalCurtainCost * 1.05; // 5% GST on cloth
      const rodCostWithGST = totalRodCostComplete * 1.18; // 18% GST on rod
      const grandTotal = clothCostWithGST + rodCostWithGST;

      return {
        // Basic measurements
        width,
        height,
        parts,
        stitchingModel: data.stitchingModel,
        opening,

        // Curtain calculations
        mainMetre,
        clothCost,
        stitchingCost,
        totalCurtainCost,

        // Lining calculations
        hasLining: !!data.hasLining,
        liningModel: data.liningModel || "",
        liningMetre,
        liningCost,
        // Rod calculations
        curtainBracketModels: data.curtainBracketModels,
        rodFeet,
        clampRequired,
        clampCost,
        doomRequired,
        doomCost,
        totalWallBracketCost,
        totalRodsRequired,
        totalRodCost: totalRodCostComplete, // Complete rod cost including wall bracket

        // Final costs
        clothCostWithGST,
        rodCostWithGST,
        grandTotal,
        totalCost: grandTotal, // For compatibility

        // Legacy compatibility fields
        pieces: parts,
        totalMeters: mainMetre,
        curtainType: data.stitchingModel,
        totalLiningCost: liningCost,
      };
    },
  },
  "mosquito-nets": {
    label: "Mosquito Nets",
    fields: [
      {
        name: "roomLabel",
        label: "Room/Location Label",
        type: "text",
        required: true,
      },
      {
        name: "width",
        label: "Width (inches)",
        type: "number",
        required: true,
      },
      {
        name: "height",
        label: "Height (inches)",
        type: "number",
        required: true,
      },
      {
        name: "materialType",
        label: "Material Type",
        type: "picker",
        required: true,
        options: [
          "Fibre net",
          "S.S net",
          "Sleek net",
          "Magnatic net",
          "Pleated net",
          "Honey Comb",
        ],
      },
      {
        name: "materialRatePerSqft",
        label: "Material Rate/Sqft (₹)",
        type: "number",
        required: true,
      },
      {
        name: "customDescription",
        label: "Custom Description",
        type: "text",
        required: false,
      },
    ],
    calculate: (data) => {
      // Convert inches to feet and round to 1 decimal place
      const widthInches = parseFloat(data.width) || 0;
      const heightInches = parseFloat(data.height) || 0;
      const widthFeet = Math.round((widthInches / 12) * 10) / 10; // e.g., 4.67 -> 4.7
      const heightFeet = Math.round((heightInches / 12) * 10) / 10;
      const totalSqft = widthFeet * heightFeet;
      const materialRate = parseFloat(data.materialRatePerSqft) || 0;
      const materialCost = totalSqft * materialRate;
      return {
        widthFeet,
        heightFeet,
        totalSqft,
        materialCost,
        totalCost: materialCost, // Add totalCost for consistency with other interior types
      };
    },
  },
  wallpapers: {
    label: "Wallpapers",
    fields: [
      {
        name: "roomLabel",
        label: "Room/Location Label",
        type: "text",
        required: true,
      },
      {
        name: "width",
        label: "Width (inches)",
        type: "number",
        required: true,
      },
      {
        name: "height",
        label: "Height (inches)",
        type: "number",
        required: true,
      },
      {
        name: "costPerRoll",
        label: "Cost per Roll (₹)",
        type: "number",
        required: true,
      },
      {
        name: "implementationCostPerRoll",
        label: "Implementation Cost per Roll (₹)",
        type: "number",
        required: true,
      },
    ],
    calculate: (data) => {
      const width = parseFloat(data.width) || 0;
      const height = parseFloat(data.height) || 0;
      const costPerRoll = parseFloat(data.costPerRoll) || 0;
      const implementationCostPerRoll =
        parseFloat(data.implementationCostPerRoll) || 0;
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
    },
  },
  blinds: {
    label: "Blinds",
    fields: [
      {
        name: "roomLabel",
        label: "Room/Location Label",
        type: "text",
        required: true,
      },
      {
        name: "height",
        label: "Height (inches)",
        type: "number",
        required: true,
      },
      {
        name: "width",
        label: "Width (inches)",
        type: "number",
        required: true,
      },
      {
        name: "blindType",
        label: "Blind Type",
        type: "picker",
        options: [
          "Roman Blinds",
          "PVC Blinds",
          "Roller Blinds",
          "Zebra Blinds",
          "Vertical Blinds",
        ],
        required: true,
      },
      {
        name: "costPerSqft",
        label: "Cost/Sqft (₹)",
        type: "number",
        required: true,
      },
      // Roman Blinds specific fields
      {
        name: "clothCostPerSqft",
        label: "Cloth Cost/Sqft (₹)",
        type: "number",
        required: false,
        showIf: (data) => data.blindType === "Roman Blinds",
      },
      {
        name: "panelWidth",
        label: "Panel Width",
        type: "picker",
        options: ['48"', '56"'],
        required: false,
        showIf: (data) => data.blindType === "Roman Blinds",
      },
      {
        name: "stitchingCostPerPart",
        label: "Stitching Cost/Part (₹)",
        type: "number",
        required: false,
        showIf: (data) => data.blindType === "Roman Blinds",
      },
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
      if (data.blindType === "Roman Blinds") {
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
        clothRequired = ((height + 12) / 39) * part;
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
    },
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
  },
};
