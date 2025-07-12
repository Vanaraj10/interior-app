import { generateCurtainRows } from './curtainPDF';
import { generateMosquitoNetRows } from './mosquitoNetPDF';
import { generateWallpaperRows } from './wallpaperPDF';
import { generateBlindsRows } from './blindsPDF';
import flooringPDF from "./flooringPDF";

export const PDF_ROW_GENERATORS = {
  curtains: generateCurtainRows,
  'mosquito-nets': generateMosquitoNetRows,
  wallpapers: generateWallpaperRows,
  blinds: generateBlindsRows,
  flooring: flooringPDF,
};
