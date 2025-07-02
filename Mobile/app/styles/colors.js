// Cool Color Palette for Interior Design App
export const COLORS = {
  // Primary Cool Colors
  primary: "#0F4C75", // Deep Ocean Blue
  primaryLight: "#3282B8", // Ocean Blue
  primaryDark: "#0B2545", // Navy Blue

  // Secondary Cool Colors
  secondary: "#4E9F3D", // Forest Green
  secondaryLight: "#68C45C", // Mint Green
  secondaryDark: "#2D5A27", // Dark Green

  // Accent Colors
  accent: "#00A8CC", // Cool Cyan
  accentLight: "#7DDFFC", // Light Cyan
  accentDark: "#006B85", // Dark Cyan
  // Neutral Cool Grays (Softened)
  gray50: "#FAFAFA", // Very Light Warm Gray
  gray100: "#F4F4F5", // Light Warm Gray
  gray200: "#E4E4E7", // Soft Gray
  gray300: "#D4D4D8", // Medium Light Gray
  gray400: "#A1A1AA", // Medium Gray
  gray500: "#71717A", // Balanced Gray
  gray600: "#52525B", // Medium Dark Gray
  gray700: "#3F3F46", // Dark Gray
  gray800: "#27272A", // Very Dark Gray
  gray900: "#18181B", // Almost Black

  // Status Colors (Cool Variants)
  success: "#059669", // Cool Green
  warning: "#0891B2", // Cool Orange/Teal
  error: "#DC2626", // Cool Red
  info: "#0284C7", // Cool Blue  // Background Colors
  background: "#FAFAFA", // Very Soft Warm Background
  surface: "#F4F4F5", // Soft Warm Surface
  card: "#FAFAFA", // Very Soft Card Background
  // Text Colors
  textPrimary: "#27272A", // Softer Dark Text
  textSecondary: "#52525B", // Medium Text
  textMuted: "#71717A", // Light Text
  textInverse: "#FAFAFA", // Soft Light Text (not bright white)
  // Border Colors
  border: "#D4D4D8", // Default Border
  borderLight: "#E4E4E7", // Light Border
  borderDark: "#A1A1AA", // Dark Border  // Input Colors (Specifically for Android compatibility)
  inputBackground: "#FAFAFA",
  inputBorder: "#A1A1AA",
  inputBorderFocus: "#3282B8",
  inputText: "#27272A",
  inputPlaceholder: "#52525B", // Darker placeholder for better visibility in APK builds
  
  // Alternative darker placeholder for problematic Android builds
  inputPlaceholderDark: "#3F3F46", // Even darker for maximum contrast
  // Shadow Colors
  shadow: "rgba(30, 41, 59, 0.08)",
  shadowDark: "rgba(30, 41, 59, 0.15)",
};

// Helper function to get color with opacity
export const withOpacity = (color, opacity) => {
  // Convert hex to rgba
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Gradient definitions
export const GRADIENTS = {
  primary: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
  secondary: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.secondaryLight} 100%)`,
  accent: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentLight} 100%)`,
  cool: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
};
