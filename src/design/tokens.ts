export const colors = {
  // Primary palette
  primary: {
    50: '#e8f0ff',
    100: '#c5d5ff',
    200: '#8fb0ff',
    300: '#6699ff',
    400: '#4f6bff',
    500: '#4e6bff',
    600: '#3d5ce6',
    700: '#2d4acc',
    800: '#1e38b3',
    900: '#0f2699',
  },
  
  // Accent palette
  accent: {
    50: '#e6fff9',
    100: '#b3ffed',
    200: '#80ffe0',
    300: '#6de3c4',
    400: '#4dd9b3',
    500: '#2ec9a1',
    600: '#26b38f',
    700: '#1e9d7d',
    800: '#16876b',
    900: '#0e7159',
  },
  
  // Neutral palette
  neutral: {
    50: '#f5f7ff',
    100: '#e8ecf5',
    200: '#c5d1e0',
    300: '#a9b7d0',
    400: '#8fa0bf',
    500: '#7f8dab',
    600: '#6a7a97',
    700: '#556783',
    800: '#40546f',
    900: '#2b415b',
  },
  
  // Background
  background: {
    primary: '#05070d',
    secondary: '#0a0f1b',
    tertiary: '#060912',
    elevated: 'rgba(10, 14, 26, 0.85)',
  },
  
  // Semantic colors
  success: '#6de3c4',
  warning: '#ffc878',
  error: '#f78c6c',
  info: '#6ed2ff',
  
  // Overlays
  overlay: {
    light: 'rgba(255, 255, 255, 0.02)',
    medium: 'rgba(255, 255, 255, 0.05)',
    strong: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Borders
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.15)',
  },
} as const;

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
} as const;

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
} as const;

export const fontSize = {
  xs: '11px',
  sm: '12px',
  base: '13px',
  md: '14px',
  lg: '16px',
  xl: '18px',
  '2xl': '22px',
  '3xl': '28px',
  '4xl': '32px',
} as const;

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const shadows = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.15)',
  md: '0 8px 24px rgba(0, 0, 0, 0.25)',
  lg: '0 18px 48px rgba(0, 0, 0, 0.35)',
  xl: '0 25px 80px rgba(0, 0, 0, 0.45)',
  glow: '0 10px 30px rgba(78, 107, 255, 0.35)',
  glowAccent: '0 10px 30px rgba(109, 227, 196, 0.35)',
} as const;

export const transitions = {
  fast: '0.15s ease',
  base: '0.2s ease',
  slow: '0.3s ease',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  popover: 1300,
  tooltip: 1400,
} as const;
