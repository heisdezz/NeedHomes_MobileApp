# Keyboard Handling in Chat

## Problem Solved
The input bar was hidden behind the keyboard when typing. This has been fixed using `react-native-keyboard-controller`.

## Solution Overview

### 1. **KeyboardProvider** (ChatPage.tsx)
Wraps the entire chat page to enable keyboard-aware behavior:

```tsx
import { KeyboardProvider } from "react-native-keyboard-controller";

<KeyboardProvider>
  <SafeAreaView>
    {/* Chat content */}
  </SafeAreaView>
</KeyboardProvider>
```

### 2. **KeyboardAvoidingView** (ChatInputBar.tsx)
Wraps the input bar to push it above the keyboard:

```tsx
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

<KeyboardAvoidingView
  behavior="padding"
  keyboardVerticalOffset={0}
  style={tw`bg-white dark:bg-gray-800`}
>
  {/* Input bar content */}
</KeyboardAvoidingView>
```

### 3. **Keyboard Dismiss** (Conversations.tsx)
ScrollView dismisses keyboard when scrolling:

```tsx
<ScrollView
  keyboardShouldPersistTaps="handled"
  keyboardDismissMode="on-drag"
>
  {/* Messages */}
</ScrollView>
```

## Why react-native-keyboard-controller?

Better than React Native's built-in `KeyboardAvoidingView`:

| Feature | Built-in | keyboard-controller |
|---------|----------|---------------------|
| iOS Support | ✅ | ✅✅ |
| Android Support | ⚠️ Limited | ✅✅ |
| Animation smoothness | ⚠️ | ✅ |
| Edge cases | ❌ | ✅ |
| Input toolbar | ❌ | ✅ |
| Bundle size | 0KB | ~15KB |

## How It Works

```
1. User taps input field
   ↓
2. Keyboard starts appearing
   ↓
3. KeyboardProvider detects keyboard height
   ↓
4. KeyboardAvoidingView adjusts padding
   ↓
5. Input bar moves up above keyboard
   ↓
6. User can type comfortably ✅
```

## Behavior

### On Keyboard Open
- Input bar smoothly animates above keyboard
- Messages remain scrollable
- Input stays fully visible

### On Keyboard Close
- Input bar smoothly returns to bottom
- Layout restores to original position

### While Scrolling
- Swipe down to dismiss keyboard
- Tap outside input to dismiss
- Keep typing even while scrolling

## Platform-Specific Notes

### iOS
- ✅ Full support
- Smooth animations
- Proper safe area handling

### Android
- ✅ Full support
- Works with all keyboard types
- Handles edge-to-edge displays

## Customization

### Adjust Keyboard Offset
If the input bar is too high or too low:

```tsx
<KeyboardAvoidingView
  behavior="padding"
  keyboardVerticalOffset={20} // Adjust this value
>
```

### Change Dismiss Behavior
```tsx
<ScrollView
  keyboardDismissMode="on-drag"    // Dismiss while dragging
  // OR
  keyboardDismissMode="interactive" // Interactive dismiss
  // OR
  keyboardDismissMode="none"        // Don't dismiss on scroll
>
```

### Disable Keyboard Avoiding
For special cases where you don't want avoiding:

```tsx
<KeyboardAvoidingView
  enabled={false} // Disable avoiding
>
```

## Common Issues & Solutions

### Issue: Input still hidden
**Solution:** Make sure `KeyboardProvider` wraps the entire page:
```tsx
// ✅ Correct
<KeyboardProvider>
  <SafeAreaView>
    <Conversations />
    <ChatInputBar />
  </SafeAreaView>
</KeyboardProvider>

// ❌ Wrong
<SafeAreaView>
  <KeyboardProvider>
    <ChatInputBar />
  </KeyboardProvider>
</SafeAreaView>
```

### Issue: Keyboard jumps/glitches
**Solution:** Remove conflicting KeyboardAvoidingView wrappers:
```tsx
// ❌ Wrong - Multiple KeyboardAvoidingViews
<KeyboardAvoidingView>
  <SafeAreaView>
    <KeyboardAvoidingView>
      <Input />
    </KeyboardAvoidingView>
  </SafeAreaView>
</KeyboardAvoidingView>

// ✅ Correct - Single KeyboardAvoidingView
<KeyboardProvider>
  <SafeAreaView>
    <KeyboardAvoidingView>
      <Input />
    </KeyboardAvoidingView>
  </SafeAreaView>
</KeyboardProvider>
```

### Issue: Messages don't scroll properly
**Solution:** Ensure ScrollView has proper flex:
```tsx
<ScrollView style={tw`flex-1`}>
  {/* Messages */}
</ScrollView>
```

### Issue: Keyboard covers input on Android
**Solution:** Check `android:windowSoftInputMode` in `AndroidManifest.xml`:
```xml
<activity
  android:windowSoftInputMode="adjustResize"
>
```

## Testing Checklist

- [ ] Open keyboard - input stays visible
- [ ] Close keyboard - input returns to bottom
- [ ] Type message - no jumping
- [ ] Scroll messages - keyboard dismisses
- [ ] Add image - preview stays visible
- [ ] Rotate device - layout adapts
- [ ] Different keyboard heights - works correctly
- [ ] iOS safe area - handled correctly
- [ ] Android edge-to-edge - no clipping

## Advanced: Custom Keyboard Height

Access keyboard height in your component:

```tsx
import { useKeyboardHandler } from "react-native-keyboard-controller";

function MyComponent() {
  const keyboardHeight = useKeyboardHandler({
    onMove: (e) => {
      'worklet';
      console.log('Keyboard height:', e.height);
    },
  });
  
  return (
    <Animated.View style={{ marginBottom: keyboardHeight }}>
      {/* Content */}
    </Animated.View>
  );
}
```

## Performance Tips

1. **Avoid heavy renders** when keyboard opens:
   ```tsx
   const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
   
   useEffect(() => {
     const subscription = Keyboard.addListener('keyboardDidShow', () => {
       setIsKeyboardVisible(true);
     });
     return () => subscription.remove();
   }, []);
   ```

2. **Memoize message list** to prevent re-renders:
   ```tsx
   const MessageList = React.memo(({ messages }) => (
     <>
       {messages.map(msg => <Message key={msg.id} {...msg} />)}
     </>
   ));
   ```

3. **Use flatlist for large message lists**:
   ```tsx
   <FlatList
     data={messages}
     renderItem={({ item }) => <Message {...item} />}
     keyExtractor={(item) => item.id}
     keyboardDismissMode="on-drag"
   />
   ```

## References

- [react-native-keyboard-controller docs](https://github.com/kirillzyusko/react-native-keyboard-controller)
- [React Native Keyboard API](https://reactnative.dev/docs/keyboard)

---

**Keyboard handling is now smooth and reliable!** ⌨️✨
