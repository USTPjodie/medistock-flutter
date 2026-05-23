// FitFlow Design System Colors
// Based on DESIGN_SYSTEM.md

const palette = {
  // Base Colors
  primary: '#6366F1', // Indigo - buttons, active states, accents
  accent: '#8B5CF6', // Purple - highlight accents

  // Light Mode
  light: {
    background: '#F8FAFC',
    foreground: '#1E293B',
    card: '#FFFFFF',
    secondary: '#E2E8F0',
    muted: '#F1F5F9',
    mutedForeground: '#64748B',
    border: '#E2E8F0',
  },

  // Dark Mode
  dark: {
    background: '#0B0B14',
    foreground: '#FFFFFF',
    card: '#1A1A2E',
    secondary: '#252542',
    muted: '#252542',
    mutedForeground: '#6B7280',
    border: '#2D2D4A',
  },

  // Card Accent Colors
  cardPurple: { light: '#EDE9FE', dark: '#2D2B55' },
  cardBlue: { light: '#DBEAFE', dark: '#1E3A5F' },
  cardGreen: { light: '#D1FAE5', dark: '#064E3B' },
  cardYellow: { light: '#FEF3C7', dark: '#451A03' },
  cardPink: { light: '#FCE7F3', dark: '#4A1942' },

  // Semantic Colors
  destructive: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  info: '#3B82F6',
};

// Light theme colors (for compatibility)
export const colors = {
  light: {
    background: palette.light.background,
    foreground: palette.light.foreground,
    card: palette.light.card,
    cardForeground: palette.light.foreground,
    popover: palette.light.card,
    popoverForeground: palette.light.foreground,
    primary: palette.primary,
    primaryForeground: '#FFFFFF',
    secondary: palette.light.secondary,
    secondaryForeground: palette.light.foreground,
    muted: palette.light.muted,
    mutedForeground: palette.light.mutedForeground,
    accent: palette.accent,
    accentForeground: '#FFFFFF',
    destructive: palette.destructive,
    destructiveForeground: '#FFFFFF',
    border: palette.light.border,
    input: palette.light.border,
    ring: palette.primary,
    warning: palette.warning,
    success: palette.success,
    info: palette.info,
    // Card accent colors
    cardPurple: palette.cardPurple.light,
    cardBlue: palette.cardBlue.light,
    cardGreen: palette.cardGreen.light,
    cardYellow: palette.cardYellow.light,
    cardPink: palette.cardPink.light,
  },
  dark: {
    background: palette.dark.background,
    foreground: palette.dark.foreground,
    card: palette.dark.card,
    cardForeground: palette.dark.foreground,
    popover: palette.dark.card,
    popoverForeground: palette.dark.foreground,
    primary: palette.primary,
    primaryForeground: '#FFFFFF',
    secondary: palette.dark.secondary,
    secondaryForeground: palette.dark.foreground,
    muted: palette.dark.muted,
    mutedForeground: palette.dark.mutedForeground,
    accent: palette.accent,
    accentForeground: '#FFFFFF',
    destructive: palette.destructive,
    destructiveForeground: '#FFFFFF',
    border: palette.dark.border,
    input: palette.dark.border,
    ring: palette.primary,
    warning: palette.warning,
    success: palette.success,
    info: palette.info,
    // Card accent colors
    cardPurple: palette.cardPurple.dark,
    cardBlue: palette.cardBlue.dark,
    cardGreen: palette.cardGreen.dark,
    cardYellow: palette.cardYellow.dark,
    cardPink: palette.cardPink.dark,
  },
};

// Spacing tokens (from DESIGN_SYSTEM.md)
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  12: 48,
};

// Border radius tokens (from DESIGN_SYSTEM.md)
export const radius = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
};

// Font size tokens (from DESIGN_SYSTEM.md)
export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

// Shadows (from DESIGN_SYSTEM.md)
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabBar: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 25,
  },
};

// Legacy exports for compatibility
export const legacyColors = colors.light;
