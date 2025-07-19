import { generateCurtainRows, generateRodCostRows, generateTotalCostSummary } from './curtainPDF';
import { generateMosquitoNetRows } from './mosquitoNetPDF';
import { generateWallpaperRows } from './wallpaperPDF';
import { generateBlindsRows } from './blindsPDF';
import flooringPDF from "./flooringPDF";

// Extend curtain generator with additional functions
generateCurtainRows.generateRodCostRows = generateRodCostRows;
generateCurtainRows.generateTotalCostSummary = generateTotalCostSummary;

export const PDF_ROW_GENERATORS = {
  curtains: generateCurtainRows,
  'mosquito-nets': generateMosquitoNetRows,
  wallpapers: generateWallpaperRows,
  blinds: generateBlindsRows,
  flooring: flooringPDF,
};
