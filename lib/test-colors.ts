/**
 * Test file to verify custom colors are working with twrnc
 * Run this in your app to check if colors are loaded
 */

import tw from "./tw";

export const testColors = () => {
  console.log("=== Testing Custom Colors ===");

  const tests = [
    { name: "brand", style: tw`bg-brand` },
    { name: "brand-dark", style: tw`bg-brand-dark` },
    { name: "bg", style: tw`bg-bg` },
    { name: "surface", style: tw`bg-surface` },
    { name: "text-primary", style: tw`text-text-primary` },
    { name: "error", style: tw`bg-error` },
    { name: "success", style: tw`bg-success` },
  ];

  tests.forEach(({ name, style }) => {
    console.log(`${name}:`, style);
  });

  console.log("=== Test Complete ===");

  return tests;
};

// Export individual color styles for easy use
export const brandStyles = {
  bg: tw`bg-brand`,
  text: tw`text-brand`,
  border: tw`border-brand`,
  bgDark: tw`bg-brand-dark`,
};

export const textStyles = {
  primary: tw`text-text-primary`,
  secondary: tw`text-text-secondary`,
  muted: tw`text-text-muted`,
  inverse: tw`text-text-inverse`,
};
