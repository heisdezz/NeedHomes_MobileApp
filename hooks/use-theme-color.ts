/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

export function useThemeColor(
  props: { light?: string; dark?: string },
  _colorName: string
) {
  return props.light ?? props.dark ?? "#000000";
}
