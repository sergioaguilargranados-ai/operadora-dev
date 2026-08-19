export const defaultTheme = {
  colors: {
    primary: '#1D4ED8',           // AS Operadora brand-primary
    primaryDark: '#1E3A8A',
    primaryLight: '#3B82F6',
    secondary: '#F59E0B',         // Amber 500
    accent: '#10B981',            // Emerald 500
    background: '#F5F5F5',        // PWA light background
    backgroundAlt: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceElevated: '#F9FAFB',
    text: '#111827',              // Gray 900
    textSecondary: '#6B7280',     // Gray 500
    textLight: '#9CA3AF',         // Gray 400
    textInverted: '#FFFFFF',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6',
    border: '#E5E7EB',
    separator: '#F3F4F6',
    white: '#FFFFFF',
    black: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  fontSizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 34,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },
}

export const Colors = defaultTheme.colors
export const Spacing = defaultTheme.spacing
export const FontSizes = defaultTheme.fontSizes
export const BorderRadius = defaultTheme.borderRadius

export default defaultTheme
