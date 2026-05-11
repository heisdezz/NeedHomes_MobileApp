# Chat Component Quick Reference

## 🚀 Quick Start

```tsx
import ChatPage from "@/components/CHAT/ChatPage";

export default function ChatScreen() {
  return <ChatPage />;
}
```

## 📦 What's Included

```
components/CHAT/
├── ChatPage.tsx           # Main component
├── Conversations.tsx      # Message display
├── ChatInputBar.tsx       # Input area
└── [docs]                 # Documentation

store/
└── socket-store.ts        # Global socket state (Zustand)

types/
└── chat.ts               # TypeScript types
```

## 🎯 Key APIs

### Socket Store

```tsx
import { useSocketStore } from "@/store/socket-store";

// In components
const isConnected = useSocketStore(s => s.isConnected);
const { emit, on, off } = useSocketStore();

// Outside React
import { connectSocket, disconnectSocket, emitSocketEvent } from "@/store/socket-store";
connectSocket();
emitSocketEvent("chat:typing", { isTyping: true });
disconnectSocket();
```

### Socket Events

#### Emit
- `chat:createConversation` - Join room
- `chat:sendMessage` - Send message
- `chat:typing` - Typing indicator
- `chat:markAsRead` - Mark as read

#### Listen
- `chat:newMessage` - New message
- `chat:userTyping` - User typing
- `chat:adminJoined` - Admin joined
- `chat:conversationClosed` - Closed
- `chat:error` - Error

## 🎨 Components

### ChatPage
```tsx
<ChatPage />
// Props: None
// Features: Auto-connects socket, fetches conversation, handles states
```

### Conversations
```tsx
<Conversations 
  conversation={conversation}
  onRefetch={() => query.refetch()}
/>
// Props: conversation, onRefetch
// Features: Message display, typing, auto-scroll
```

### ChatInputBar
```tsx
<ChatInputBar 
  conversation={conversation}
  isClosed={false}
/>
// Props: conversation, isClosed
// Features: Text input, image picker, typing events
```

## 🔧 Common Tasks

### Check connection status
```tsx
const isConnected = useSocketStore(s => s.isConnected);
```

### Send custom event
```tsx
const { emit } = useSocketStore();
emit("custom:event", { data: "value" });
```

### Listen to custom event
```tsx
const { on, off } = useSocketStore();

useEffect(() => {
  const handler = (data) => console.log(data);
  on("custom:event", handler);
  return () => off("custom:event", handler);
}, []);
```

### Access outside React
```tsx
import { useSocketStore } from "@/store/socket-store";

// In API interceptor
const { emit } = useSocketStore.getState();
emit("api:error", error);
```

## 📱 Mobile Features

### Image Upload
```tsx
// Already integrated in ChatInputBar
// Uses expo-image-picker
// Automatic upload to backend
```

### Keyboard Handling
```tsx
// KeyboardAvoidingView built-in
// Platform-specific behavior
// Auto-scroll on keyboard show
```

### Dark Mode
```tsx
// Automatic with tw utility
tw`bg-white dark:bg-gray-900`
```

## 🐛 Debugging

### Log all socket events
```tsx
const { socket } = useSocketStore();
socket?.onAny((event, ...args) => {
  console.log(`[Socket] ${event}:`, args);
});
```

### View store state
```tsx
console.log(useSocketStore.getState());
```

### Redux DevTools
```tsx
// Install Redux DevTools browser extension
// Store automatically visible in DevTools
```

## ⚡ Performance Tips

### ✅ Do
```tsx
// Selective subscription
const isConnected = useSocketStore(s => s.isConnected);

// Memoize handlers
const handleMessage = useCallback((msg) => {}, []);

// Cleanup listeners
useEffect(() => {
  on("event", handler);
  return () => off("event", handler);
}, []);
```

### ❌ Don't
```tsx
// Subscribe to entire store
const store = useSocketStore();

// Forget cleanup
useEffect(() => {
  on("event", handler);
  // Missing cleanup!
}, []);

// Multiple listeners for same event
on("event", handler1);
on("event", handler2);
on("event", handler3);
```

## 🎨 Styling

### Colors
- Primary: `purple-500`
- Success: `green-500`
- Warning: `yellow-600`
- Error: `red-500`

### Customize
```tsx
// Modify tw`` template literals
tw`bg-purple-500` // Change to your brand color
```

## 📚 Documentation Files

1. **README.md** - Overview & architecture
2. **INTEGRATION_EXAMPLE.md** - Step-by-step integration
3. **IMPLEMENTATION_SUMMARY.md** - What was built
4. **ZUSTAND_VS_CONTEXT.md** - Why Zustand
5. **QUICK_REFERENCE.md** - This file

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Socket won't connect | Check auth token, backend URL |
| Messages not appearing | Verify socket listeners, check backend |
| Images not uploading | Check permissions, file size |
| Component not re-rendering | Use selective subscription |
| Connection drops | Check reconnection config |

## 🔗 Related Files

- `lib/api.ts` - API client
- `lib/imageApi.ts` - Image upload
- `store/auth-store.ts` - Auth state
- `types/chat.ts` - Type definitions

## 💡 Tips

1. Socket connects automatically on ChatPage mount
2. Always cleanup socket listeners
3. Use selective Zustand subscriptions
4. Check isConnected before emitting
5. Handle offline scenarios gracefully

## 📞 Support

Check these files for more details:
- Architecture → `README.md`
- Integration → `INTEGRATION_EXAMPLE.md`
- Performance → `ZUSTAND_VS_CONTEXT.md`
- Complete overview → `IMPLEMENTATION_SUMMARY.md`

---

**Happy coding! 🎉**
