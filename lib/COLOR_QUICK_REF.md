# Color Usage Quick Reference

## 🎨 Three Ways to Use Colors

### 1️⃣ TW Classes (try first)
```tsx
import tw from "@/lib/tw";
style={tw`bg-brand text-white`}
```

### 2️⃣ Colors Constant (most reliable)
```tsx
import { Colors } from "@/constants/theme";
style={[tw`p-4`, { backgroundColor: Colors.brand }]}
```

### 3️⃣ Color Utilities (cleanest)
```tsx
import { colorBg, colorText } from "@/lib/colors";
style={[tw`p-4`, colorBg("brand")]}
```

## 📋 Quick Examples

### Background Color
```tsx
// Method 1
style={tw`bg-brand`}

// Method 2 (reliable)
style={{ backgroundColor: Colors.brand }}

// Method 3 (clean)
style={colorBg("brand")}
```

### Text Color
```tsx
// Method 1
style={tw`text-brand`}

// Method 2 (reliable)
style={{ color: Colors.brand }}

// Method 3 (clean)
style={colorText("brand")}
```

### Combined Styles
```tsx
// With Colors constant
style={[
  tw`px-4 py-2 rounded-lg`,
  { backgroundColor: Colors.brand }
]}

// With color utilities
style={[
  tw`px-4 py-2 rounded-lg`,
  colorBg("brand")
]}
```

## 🎯 Common Patterns

### Button
```tsx
<TouchableOpacity style={[tw`px-6 py-3 rounded-full`, colorBg("brand")]}>
  <Text style={colorText("textInverse")}>Click Me</Text>
</TouchableOpacity>
```

### Card
```tsx
<View style={[tw`p-4 rounded-lg`, colorBg("card")]}>
  <Text style={colorText("textPrimary")}>Content</Text>
</View>
```

### Input
```tsx
<TextInput 
  style={[
    tw`px-4 py-3 rounded-lg`, 
    colorBg("inputBg"),
    colorBorder("inputBorder")
  ]}
/>
```

## 🔍 Available Colors

| Name | Value | Usage |
|------|-------|-------|
| `brand` | #F56821 | Primary actions |
| `brandDark` | #D45610 | Hover states |
| `bg` | #3C3C44 | Dark backgrounds |
| `surface` | #2E2E36 | Dark cards |
| `card` | #FFFFFF | White cards |
| `error` | #EF4444 | Error states |
| `success` | #22C55E | Success states |

## 🛠️ Utilities

```tsx
import { 
  colorBg,      // Background color
  colorText,    // Text color
  colorBorder,  // Border color
  withOpacity,  // Add opacity
  brandColors,  // Pre-made styles
} from "@/lib/colors";
```

### With Opacity
```tsx
style={{ backgroundColor: withOpacity("brand", 0.2) }}
// Result: #F5682133 (20% opacity)
```

### Pre-made Styles
```tsx
import { brandColors } from "@/lib/colors";

style={brandColors.bgBrand}      // Background: brand
style={brandColors.textPrimary}  // Text: primary
style={brandColors.borderBrand}  // Border: brand
```

## 🐛 Troubleshooting

**Color not showing?**
→ Use `Colors` constant instead of tw class

**Need multiple colors?**
→ Use array syntax: `[tw`...`, colorBg(), colorText()]`

**Test colors loaded?**
→ `import { testColors } from "@/lib/test-colors"; testColors();`

## 📚 Full Documentation

See `COLOR_USAGE_GUIDE.md` for complete details.
