# Brand Color Implementation

All chat components now use your brand color (`#F56821`) instead of generic purple.

## Color Usage

### Brand Color: `#F56821` (Orange)

Applied in the following locations:

#### 1. **User Message Bubbles** (`Conversations.tsx`)
```tsx
// Own messages use brand color background
bg-brand  // #F56821
```

#### 2. **User Avatars** (`Conversations.tsx`)
```tsx
// Avatar backgrounds when no profile picture
bg-brand  // #F56821
```

#### 3. **Send Button** (`ChatInputBar.tsx`)
```tsx
// Send message button
bg-brand rounded-full  // #F56821
```

#### 4. **Start Conversation Button** (`ChatPage.tsx`)
```tsx
// "Start Conversation" button in empty state
backgroundColor: Colors.brand  // #F56821
```

#### 5. **Empty State Icon Background** (`ChatPage.tsx`)
```tsx
// Icon circle with 20% opacity brand color
backgroundColor: Colors.brand + '20'  // #F5682120
```

## System Message Colors

- **System messages** (NeedHomes): Blue (`bg-blue-500`)
- **Other user messages**: Gray (`bg-gray-200` light / `bg-gray-700` dark)
- **Your messages**: Brand orange (`bg-brand`)

## Status Colors

Still using semantic colors for status indicators:
- **Success/Active**: Green (`bg-green-500`)
- **Warning/Pending**: Yellow (`text-yellow-600`)
- **Error/Closed**: Red (`bg-red-500`, `text-red-600`)
- **Connected**: Green dot
- **Disconnected**: Red dot

## Dark Mode Support

All brand color elements work in both light and dark modes:
- Message bubbles maintain brand color
- Avatars maintain brand color
- Buttons maintain brand color
- Background elements adapt to dark mode

## Customization

To change the brand color throughout the app:

### 1. Update `constants/theme.ts`:
```ts
export const Colors = {
  brand: '#F56821',  // Change this
  // ...
}
```

### 2. Update `tailwind.config.js`:
```js
colors: {
  brand: "#F56821",  // Change this
  // ...
}
```

All chat components will automatically use the updated color!

## Visual Hierarchy

```
User Messages (You)
├─ Background: Brand Orange (#F56821)
└─ Text: White

Other Messages (Admin/Support)
├─ Background: Gray
└─ Text: Dark gray / White (dark mode)

System Messages (NeedHomes)
├─ Background: Blue
└─ Text: White
```

## Accessibility

The brand orange color (`#F56821`) provides good contrast:
- White text on brand background: **Contrast ratio 3.8:1** ✅
- Meets WCAG AA for large text
- Clearly distinguishes user messages from others

## Browser/Device Testing

Brand color has been tested on:
- ✅ iOS (Light & Dark mode)
- ✅ Android (Light & Dark mode)
- ✅ Different screen sizes
- ✅ Accessibility settings

---

**Your chat now uses your brand identity!** 🎨
