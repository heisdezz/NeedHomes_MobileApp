# Chat Component Documentation

This is a real-time chat implementation for React Native using Socket.IO and Zustand for state management.

## Features

- ✅ Real-time messaging with Socket.IO
- ✅ Global socket state management with Zustand
- ✅ Image sharing with upload support
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Conversation status (Pending, Active, Closed)
- ✅ Mobile-optimized UI with dark mode support
- ✅ Keyboard-aware input
- ✅ Connection status indicator

## Architecture

### Socket Store (`store/socket-store.ts`)

Global Zustand store managing socket connections:
- **Benefits over Context API:**
  - No provider nesting
  - Better performance (selective subscriptions)
  - Imperative API for use outside React components
  - Simpler debugging with Redux DevTools support

### Components

1. **ChatPage.tsx** - Main container
   - Manages socket connection lifecycle
   - Fetches conversation data
   - Handles loading/error states
   - Shows empty state for new users

2. **Conversations.tsx** - Message display
   - Renders message bubbles
   - Shows typing indicators
   - Auto-scrolls to new messages
   - Displays avatars and timestamps

3. **ChatInputBar.tsx** - Message input
   - Text message support
   - Image picker integration
   - Typing event emission
   - Keyboard-aware positioning

## Usage

```tsx
import ChatPage from "@/components/CHAT/ChatPage";

function App() {
  return <ChatPage />;
}
```

The socket will automatically connect when the component mounts and disconnect on unmount.

## Socket Events

### Emitted Events
- `chat:createConversation` - Join a conversation
- `chat:sendMessage` - Send a message
- `chat:typing` - Typing indicator
- `chat:markAsRead` - Mark messages as read

### Listened Events
- `chat:newMessage` - New message received
- `chat:userTyping` - Someone is typing
- `chat:adminJoined` - Admin joined conversation
- `chat:conversationClosed` - Conversation closed
- `chat:error` - Error occurred

## API Endpoints

- `GET /chat/my-conversation` - Fetch user's conversation
- `POST /chat/conversations` - Start new conversation

## Dependencies

- `socket.io-client` - WebSocket client
- `zustand` - State management
- `@tanstack/react-query` - Data fetching
- `expo-image-picker` - Image selection
- `sonner-native` - Toast notifications
- `twrnc` - Tailwind CSS for React Native

## Environment Variables

Socket connects to the URL defined in `lib/api.ts`:
```typescript
export const new_url = 'https://needhomes-backend-staging.onrender.com/';
```

## Future Enhancements

- [ ] Message deletion
- [ ] Message editing
- [ ] File attachments (PDFs, documents)
- [ ] Voice messages
- [ ] Push notifications for new messages
- [ ] Message search
- [ ] Conversation history pagination
