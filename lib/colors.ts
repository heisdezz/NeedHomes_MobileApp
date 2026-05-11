/**
 * Color utilities for cases where tw custom colors don't work
 * Combines tw styles with Colors constants
 */

import tw from "./tw";
import { Colors } from "@/constants/theme";

/**
 * Generate background color style
 * Usage: colorBg('brand') or colorBg('#F56821')
 */
export const colorBg = (color: keyof typeof Colors | string) => {
  const bgColor = color in Colors ? Colors[color as keyof typeof Colors] : color;
  return { backgroundColor: bgColor };
};

/**
 * Generate text color style
 * Usage: colorText('brand') or colorText('#F56821')
 */
export const colorText = (color: keyof typeof Colors | string) => {
  const textColor = color in Colors ? Colors[color as keyof typeof Colors] : color;
  return { color: textColor };
};

/**
 * Generate border color style
 * Usage: colorBorder('brand') or colorBorder('#F56821')
 */
export const colorBorder = (color: keyof typeof Colors | string) => {
  const borderColor = color in Colors ? Colors[color as keyof typeof Colors] : color;
  return { borderColor: borderColor };
};

/**
 * Combine tw styles with custom color
 * Usage: twColor('px-4 py-2 rounded-lg', 'brand', 'bg')
 */
export const twColor = (
  twStyles: string,
  color: keyof typeof Colors | string,
  type: "bg" | "text" | "border" = "bg"
) => {
  const colorStyle =
    type === "bg"
      ? colorBg(color)
      : type === "text"
        ? colorText(color)
        : colorBorder(color);

  return [tw`${twStyles}`, colorStyle];
};

/**
 * Pre-made brand color styles
 */
export const brandColors = {
  // Backgrounds
  bgBrand: colorBg("brand"),
  bgBrandDark: colorBg("brandDark"),
  bgSurface: colorBg("surface"),
  bgCard: colorBg("card"),

  // Text
  textPrimary: colorText("textPrimary"),
  textSecondary: colorText("textSecondary"),
  textMuted: colorText("textMuted"),
  textInverse: colorText("textInverse"),
  textBrand: colorText("brand"),

  // Borders
  borderBrand: colorBorder("brand"),
  borderDivider: colorBorder("divider"),

  // Utility
  bgError: colorBg("error"),
  bgSuccess: colorBg("success"),
  textError: colorText("error"),
  textSuccess: colorText("success"),
};

/**
 * Get opacity version of a color
 * Usage: withOpacity('brand', 0.2) => '#F5682133'
 */
export const withOpacity = (
  color: keyof typeof Colors | string,
  opacity: number
) => {
  const hex = color in Colors ? Colors[color as keyof typeof Colors] : color;
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
  return hex + alpha;
};

/**
 * Common color combinations
 */
export const colorCombos = {
  // Brand button
  brandButton: [tw`px-4 py-2 rounded-full`, colorBg("brand")],
  brandButtonText: colorText("textInverse"),

  // Input field
  input: [
    tw`px-4 py-2 rounded-lg border`,
    colorBg("inputBg"),
    colorBorder("inputBorder"),
  ],

  // Card
  card: [tw`p-4 rounded-lg shadow`, colorBg("card")],

  // Surface
  surface: [tw`p-4 rounded-lg`, colorBg("surface")],
};
