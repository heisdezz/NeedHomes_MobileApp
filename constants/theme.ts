/**
 * Global theme – single source of truth for colors, spacing, and typography.
 * Use these constants anywhere you can't use a tw class (e.g. prop values).
 * Tailwind class names mirror these via tailwind.config.js.
 */

export const Colors = {
  // Brand
  brand: '#F56821',
  brandDark: '#D45610',

  // Backgrounds
  bg: '#3C3C44',
  surface: '#2E2E36',
  card: '#FFFFFF',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Input
  inputBg: '#F5F5F7',
  inputBorder: '#E5E7EB',
  inputPlaceholder: '#9CA3AF',

  // Utility
  divider: '#E5E7EB',
  error: '#EF4444',
  success: '#22C55E',
} as const;

export type AppColor = keyof typeof Colors;
