// Theme configuration for next-themes
export const themeConfig = {
  // The HTML attribute used to store the theme
  attribute: 'data-theme',

  // Default theme when first visit (light, dark, or system)
  defaultTheme: 'system',

  // Whether to switch between light and dark based on system theme
  enableSystem: true,

  // Disable CSS transitions when switching themes to avoid flash
  disableTransitionOnChange: false,

  // Storage key for localStorage
  storageKey: 'hiring-assistant-theme',

  // Available themes
  themes: ['light', 'dark', 'system'] as const,
} as const;

export type ThemeMode = (typeof themeConfig.themes)[number];
