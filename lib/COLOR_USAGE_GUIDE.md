# Custom Color Usage Guide

## Problem
Custom colors defined in `tailwind.config.js` may not work with `twrnc` in React Native.

## Solutions

### Solution 1: Using tw classes (Preferred if working)

If custom colors are loaded correctly:

```tsx
import tw from "@/lib/tw";

<View style={tw`bg-brand`} />
<Text style={tw`text-brand`}>Hello</Text>
```

### Solution 2: Using Colors constant (Most Reliable)

When tw classes don't work, use the Colors constant directly:

```tsx
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";

<View style={[tw`p-4 rounded-lg`, { backgroundColor: Colors.brand }]} />
<Text style={[tw`text-lg`, { color: Colors.brand }]}>Hello</Text>
```

### Solution 3: Using Color Utilities (Recommended)

Use the helper utilities from `lib/colors.ts`:

```tsx
import { colorBg, colorText, twColor } from "@/lib/colors";
import tw from "@/lib/tw";

// Simple background color
<View style={[tw`p-4 rounded-lg`, colorBg("brand")]} />

// Simple text color
<Text style={[tw`text-lg`, colorText("brand")]}>Hello</Text>

// Combined tw + color
<View style={twColor("p-4 rounded-lg", "brand", "bg")} />
```

### Solution 4: Using Pre-made Styles

For common patterns:

```tsx
import { brandColors, colorCombos } from "@/lib/colors";

// Pre-made brand colors
<View style={[tw`p-4`, brandColors.bgBrand]} />
<Text style={brandColors.textBrand}>Hello</Text>

// Common combinations
<TouchableOpacity style={colorCombos.brandButton}>
  <Text style={colorCombos.brandButtonText}>Click Me</Text>
</TouchableOpacity>
```

## Available Colors

From `constants/theme.ts`:

```typescript
Colors.brand           // #F56821 (Primary brand orange)
Colors.brandDark       // #D45610
Colors.bg              // #3C3C44 (Dark backgrounds)
Colors.surface         // #2E2E36 (Dark cards)
Colors.card            // #FFFFFF
Colors.bgLight         // #FFFFFF
Colors.textPrimary     // #1A1A2E
Colors.textSecondary   // #6B7280
Colors.textMuted       // #9CA3AF
Colors.textInverse     // #FFFFFF
Colors.inputBg         // #F5F5F7
Colors.inputBorder     // #E5E7EB
Colors.inputPlaceholder // #9CA3AF
Colors.divider         // #E5E7EB
Colors.error           // #EF4444
Colors.success         // #22C55E
```

## Testing Colors

Run this in your component to test if colors are loaded:

```tsx
import { testColors } from "@/lib/test-colors";
import { useEffect } from "react";

useEffect(() => {
  testColors(); // Check console for output
}, []);
```

## Common Issues & Fixes

### Issue 1: `bg-brand` doesn't apply color

**Fix:** Use the Colors constant or color utilities:
```tsx
// Instead of:
style={tw`bg-brand`}

// Use:
style={[tw`px-4 py-2`, { backgroundColor: Colors.brand }]}
// Or:
style={[tw`px-4 py-2`, colorBg("brand")]}
```

### Issue 2: Multiple custom colors needed

**Fix:** Use array syntax:
```tsx
style={[
  tw`p-4 rounded-lg border-2`,
  { backgroundColor: Colors.surface },
  { borderColor: Colors.brand },
]}
```

### Issue 3: Color with opacity

**Fix:** Use `withOpacity` utility:
```tsx
import { withOpacity } from "@/lib/colors";

style={[
  tw`p-4`,
  { backgroundColor: withOpacity("brand", 0.2) } // 20% opacity
]}
```

### Issue 4: Dynamic colors

**Fix:** Use color utilities with variables:
```tsx
const getBgColor = (type: string) => {
  switch(type) {
    case 'primary': return colorBg('brand');
    case 'error': return colorBg('error');
    default: return colorBg('surface');
  }
};

<View style={[tw`p-4`, getBgColor(type)]} />
```

## Best Practices

### ✅ Do

```tsx
// Use Colors constant for reliability
import { Colors } from "@/constants/theme";
style={[tw`p-4`, { backgroundColor: Colors.brand }]}

// Use color utilities for cleaner code
import { colorBg } from "@/lib/colors";
style={[tw`p-4`, colorBg("brand")]}

// Combine tw classes with custom colors
style={[tw`px-4 py-2 rounded-lg`, colorBg("brand")]}
```

### ❌ Don't

```tsx
// Don't rely solely on tw custom colors
style={tw`bg-brand`} // May not work

// Don't hardcode hex values everywhere
style={{ backgroundColor: "#F56821" }} // Use Colors constant

// Don't forget to import Colors when needed
style={{ backgroundColor: brand }} // Wrong - undefined
```

## Migration from tw classes to Colors

If you have existing code using `tw` custom colors that don't work:

### Before:
```tsx
<View style={tw`bg-brand text-white p-4`}>
  <Text style={tw`text-brand-dark`}>Hello</Text>
</View>
```

### After:
```tsx
<View style={[tw`p-4`, colorBg("brand")]}>
  <Text style={[tw`text-white`, colorText("brandDark")]}>Hello</Text>
</View>
```

## Examples

### Button Component
```tsx
import tw from "@/lib/tw";
import { colorBg, colorText } from "@/lib/colors";

export function BrandButton({ onPress, children }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        tw`px-6 py-3 rounded-full shadow-lg`,
        colorBg("brand")
      ]}
    >
      <Text style={[tw`text-lg font-bold`, colorText("textInverse")]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}
```

### Card Component
```tsx
import tw from "@/lib/tw";
import { colorBg, colorBorder } from "@/lib/colors";

export function Card({ children }) {
  return (
    <View 
      style={[
        tw`p-4 rounded-lg border`,
        colorBg("card"),
        colorBorder("divider")
      ]}
    >
      {children}
    </View>
  );
}
```

### Input Component
```tsx
import tw from "@/lib/tw";
import { colorBg, colorBorder, colorText } from "@/lib/colors";

export function Input({ value, onChangeText, placeholder }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.inputPlaceholder}
      style={[
        tw`px-4 py-3 rounded-lg border`,
        colorBg("inputBg"),
        colorBorder("inputBorder"),
        colorText("textPrimary")
      ]}
    />
  );
}
```

## Summary

1. **Primary Method**: Use `Colors` constant from `constants/theme.ts`
2. **Helper Utilities**: Use functions from `lib/colors.ts` for cleaner code
3. **Fallback**: If tw custom colors work, use them, but have Colors as backup
4. **Testing**: Use `testColors()` to verify color loading

---

**When in doubt, use the Colors constant directly!** 🎨
