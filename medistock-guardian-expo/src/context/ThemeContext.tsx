import React, { createContext, useContext, useState, useCallback } from 'react';

// FitFlow Design System Theme Colors
// Based on DESIGN_SYSTEM.md
export const themes = {
  light: {
    // Base colors
    background: '#F8FAFC',
    foreground: '#1E293B',
    card: '#FFFFFF',
    secondary: '#E2E8F0',
    muted: '#F1F5F9',
    mutedForeground: '#64748B',
    border: '#E2E8F0',

    // Primary & Accent
    primary: '#6366F1', // Indigo
    primaryForeground: '#FFFFFF',
    accent: '#8B5CF6', // Purple
    accentForeground: '#FFFFFF',

    // Tab Bar
    tabBar: '#FFFFFF',
    tabBarForeground: '#64748B',
    tabBarActive: '#6366F1',

    // Semantic
    destructive: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6',

    // Card accent colors
    cardPurple: '#EDE9FE',
    cardBlue: '#DBEAFE',
    cardGreen: '#D1FAE5',
    cardYellow: '#FEF3C7',
    cardPink: '#FCE7F3',

    // Legacy compatibility
    text: '#1E293B',
    textSecondary: '#64748B',
    surface: 'rgba(255, 255, 255, 0.9)',
    header: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.1)',
    plusButton: '#6366F1',
    tabBarInactive: '#64748B',
    primaryDark: '#4F46E5',
  },
  dark: {
    // Base colors
    background: '#0B0B14',
    foreground: '#FFFFFF',
    card: '#1A1A2E',
    secondary: '#252542',
    muted: '#252542',
    mutedForeground: '#6B7280',
    border: '#2D2D4A',

    // Primary & Accent
    primary: '#6366F1', // Indigo
    primaryForeground: '#FFFFFF',
    accent: '#8B5CF6', // Purple
    accentForeground: '#FFFFFF',

    // Tab Bar
    tabBar: '#0B0B14',
    tabBarForeground: '#6B7280',
    tabBarActive: '#6366F1',

    // Semantic
    destructive: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6',

    // Card accent colors
    cardPurple: '#2D2B55',
    cardBlue: '#1E3A5F',
    cardGreen: '#064E3B',
    cardYellow: '#451A03',
    cardPink: '#4A1942',

    // Legacy compatibility
    text: '#FFFFFF',
    textSecondary: '#6B7280',
    surface: 'rgba(26, 26, 46, 0.9)',
    header: '#1A1A2E',
    shadow: 'rgba(99, 102, 241, 0.3)',
    plusButton: '#6366F1',
    tabBarInactive: '#6B7280',
    primaryDark: '#4F46E5',
  },
};

export type Theme = 'light' | 'dark';
export type ThemeColors = typeof themes.light;

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const colors = themes[theme];

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
