import { generateCurtainRows } from './curtainPDF';
import { generateMosquitoNetRows } from './mosquitoNetPDF';
import { generateWallpaperRows } from './wallpaperPDF';

export const PDF_ROW_GENERATORS = {
  curtains: generateCurtainRows,
  'mosquito-nets': generateMosquitoNetRows,
  wallpapers: generateWallpaperRows,
};
