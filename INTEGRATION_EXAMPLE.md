# ChatPage Integration Guide

## Quick Start

### 1. Import the ChatPage component

```tsx
import ChatPage from "@/components/CHAT/ChatPage";
```

### 2. Add to your screen/route

```tsx
// Example: app/(tabs)/chat.tsx
import React from "react";
import ChatPage from "@/components/CHAT/ChatPage";

export default function ChatScreen() {
  return <ChatPage />;
}
```

### 3. That's it! 🎉

The socket connection is managed automatically by the Zustand store.

## Navigation Examples

### With Expo Router

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### With React Navigation

```tsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ChatPage from "@/components/CHAT/ChatPage";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Chat"
        component={ChatPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

## Advanced Usage

### Access Socket Store Outside Components

```tsx
import { useSocketStore, connectSocket, disconnectSocket } from "@/store/socket-store";

// Connect manually
connectSocket();

// Disconnect manually
disconnectSocket();

// Emit events
import { emitSocketEvent } from "@/store/socket-store";
emitSocketEvent("chat:sendMessage", {
  conversationId: "123",
  content: "Hello!",
});
```

### Custom Socket Listeners

```tsx
import { useEffect } from "react";
import { useSocketStore } from "@/store/socket-store";

function MyComponent() {
  const { on, off } = useSocketStore();

  useEffect(() => {
    const handleCustomEvent = (data: any) => {
      console.log("Custom event:", data);
    };

    on("custom:event", handleCustomEvent);

    return () => {
      off("custom:event", handleCustomEvent);
    };
  }, []);

  return <View />;
}
```

### Check Connection Status

```tsx
import { useSocketStore } from "@/store/socket-store";

function ConnectionIndicator() {
  const isConnected = useSocketStore((state) => state.isConnected);

  return (
    <View>
      <Text>{isConnected ? "🟢 Connected" : "🔴 Disconnected"}</Text>
    </View>
  );
}
```

## Styling Customization

The components use `twrnc` (Tailwind CSS for React Native). To customize styles:

```tsx
// Modify the tw template literals in the component files
// Example: ChatPage.tsx
style={tw`text-2xl font-bold text-purple-600`} // Change purple-600 to your color
```

## Troubleshooting

### Socket won't connect
- Ensure user is authenticated (access token available)
- Check backend URL in `lib/api.ts`
- Verify network connectivity
- Check backend socket.io configuration

### Messages not appearing
- Check browser/console for socket events
- Verify conversation ID is valid
- Check backend logs for errors
- Ensure socket listeners are registered

### Images not uploading
- Verify `uploadImage` function in `lib/imageApi.ts`
- Check file size limits
- Ensure proper permissions for image picker

## Testing

```tsx
// Test socket connection
import { connectSocket } from "@/store/socket-store";

// Connect and check logs
connectSocket();
// Look for "✅ Socket connected" in console
```

## Performance Tips

1. **Selective subscriptions** - Only subscribe to needed socket store state:
```tsx
// Good ✅
const isConnected = useSocketStore(state => state.isConnected);

// Bad ❌ - subscribes to all changes
const store = useSocketStore();
```

2. **Cleanup listeners** - Always remove socket listeners in cleanup:
```tsx
useEffect(() => {
  on("event", handler);
  return () => off("event", handler);
}, []);
```

3. **Memoize callbacks** - Use useCallback for socket event handlers:
```tsx
const handleMessage = useCallback((msg) => {
  console.log(msg);
}, []);
```
