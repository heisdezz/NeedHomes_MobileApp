import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { get_user_value } from "./auth-store";
import apiClient, { new_url } from "@/lib/api";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  conversationId: string | null;
  chatUnreadCount: number;
  notificationUnreadCount: number;
  connect: () => void;
  disconnect: () => void;
  setConversationId: (id: string | null) => void;
  incrementChatUnread: () => void;
  clearChatUnread: () => void;
  incrementNotificationUnread: () => void;
  clearNotificationUnread: () => void;
  setNotificationUnread: (count: number) => void;
  setChatUnread: (count: number) => void;
  fetchUnreadCounts: () => Promise<void>;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  conversationId: null,
  chatUnreadCount: 0,
  notificationUnreadCount: 0,

  incrementChatUnread: () =>
    set((s) => ({ chatUnreadCount: s.chatUnreadCount + 1 })),
  clearChatUnread: () => set({ chatUnreadCount: 0 }),
  incrementNotificationUnread: () =>
    set((s) => ({ notificationUnreadCount: s.notificationUnreadCount + 1 })),
  clearNotificationUnread: () => set({ notificationUnreadCount: 0 }),
  setNotificationUnread: (count) => set({ notificationUnreadCount: count }),
  setChatUnread: (count) => set({ chatUnreadCount: count }),

  fetchUnreadCounts: async () => {
    const auth = get_user_value();
    if (!auth?.accessToken) return;

    try {
      const [notifResp, chatResp] = await Promise.all([
        apiClient.get("/notifications/unread-count"),
        apiClient.get("/chat/unread-count"),
      ]);
      set({
        notificationUnreadCount: notifResp.data?.data?.unreadCount ?? 0,
        chatUnreadCount: chatResp.data?.data?.unreadCount ?? 0,
      });
    } catch (error) {
      console.error("❌ Failed to fetch unread counts:", error);
    }
  },

  connect: () => {
    const state = get();
    if (state.socket?.connected) return;

    const auth = get_user_value();
    if (!auth?.accessToken) {
      console.warn("❌ Cannot connect: No access token");
      return;
    }

    // Fetch initial counts
    get().fetchUnreadCounts();

    const socketUrl = new_url.replace(/\/$/, ""); // Remove trailing slash

    const socket = io(socketUrl, {
      auth: { token: auth.accessToken },
      extraHeaders: { Authorization: `Bearer ${auth.accessToken}` },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected");
      set({ isConnected: true });
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      set({ isConnected: false });
    });

    socket.on("connected", (data) => {
      console.log("👤 User connected:", data);
    });

    socket.on("chat:newMessage", () => {
      get().incrementChatUnread();
    });

    socket.on("notification:new", () => {
      get().incrementNotificationUnread();
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      console.log("🔌 Disconnecting socket...");
      socket.disconnect();
      set({ socket: null, isConnected: false, conversationId: null });
    }
  },

  setConversationId: (id) => {
    set({ conversationId: id });
  },

  emit: (event, data) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn(`⚠️ Cannot emit ${event}: Socket not connected`);
    }
  },

  on: (event, callback) => {
    const { socket } = get();
    if (socket) {
      socket.on(event, callback);
    }
  },

  off: (event, callback) => {
    const { socket } = get();
    if (socket) {
      socket.off(event, callback);
    }
  },
}));

// Imperative helpers
export const connectSocket = () => useSocketStore.getState().connect();
export const disconnectSocket = () => useSocketStore.getState().disconnect();
export const emitSocketEvent = (event: string, data?: any) =>
  useSocketStore.getState().emit(event, data);
