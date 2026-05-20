import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useAuth } from "@/store/auth-store";
import { useSocketStore } from "@/store/socket-store";
import type { Conversation, Message } from "@/types/chat";
import tw from "@/lib/tw";
import { extract_message } from "@/helpers/apihelpers";
import { showMessage } from "react-native-flash-message";

interface ConversationsProps {
  conversation: Conversation | null;
  onRefetch: () => void;
}

function isImageUrl(content: string): boolean {
  return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(content);
}

function Avatar({
  isSystem,
  sender,
  isOwn,
  currentUserPicture,
}: {
  isSystem: boolean;
  sender: any;
  isOwn: boolean;
  currentUserPicture?: string | null;
}) {
  const picUrl = isOwn ? currentUserPicture : sender?.profilePicture;

  if (isSystem) {
    return (
      <View
        style={tw`w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-2`}
      >
        <Text style={tw`text-white font-bold text-sm`}>NH</Text>
      </View>
    );
  }

  if (picUrl) {
    return (
      <Image source={{ uri: picUrl }} style={tw`w-10 h-10 rounded-full mr-2`} />
    );
  }

  const initials = `${sender?.firstName?.[0] || "?"}${sender?.lastName?.[0] || ""}`;
  return (
    <View
      style={tw`w-10 h-10 rounded-full bg-brand rounded-full items-center justify-center mr-2`}
    >
      <Text style={tw`text-white font-bold text-sm`}>{initials}</Text>
    </View>
  );
}

function MessageBubble({
  message,
  isOwn,
  currentUserPicture,
}: {
  message: Message;
  isOwn: boolean;
  currentUserPicture?: string | null;
}) {
  const isImg = isImageUrl(message.content);

  return (
    <View
      style={tw`flex-row ${isOwn ? "justify-end" : "justify-start"} mb-3 px-4`}
    >
      {!isOwn && (
        <Avatar
          isSystem={message.isSystem}
          sender={message.sender}
          isOwn={false}
          currentUserPicture={currentUserPicture}
        />
      )}

      <View style={tw`max-w-[75%]`}>
        {/* Header */}
        <View
          style={tw`flex-row items-center mb-1 ${isOwn ? "justify-end" : "justify-start"}`}
        >
          <Text style={tw`text-xs text-gray-600 dark:text-gray-400`}>
            {message.isSystem
              ? "NeedHomes"
              : `${message.sender?.firstName} ${message.sender?.lastName}`}
          </Text>
          <Text style={tw`text-xs text-gray-400 ml-2`}>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {/* Message Content */}
        <View
          style={tw`rounded-2xl p-3 ${
            message.isSystem
              ? "bg-blue-500"
              : isOwn
                ? "bg-brand"
                : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          {isImg ? (
            <TouchableOpacity onPress={() => Linking.openURL(message.content)}>
              <Image
                source={{ uri: message.content }}
                style={tw`w-60 h-60 rounded-lg`}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <Text
              style={tw`${
                message.isSystem || isOwn
                  ? "text-white"
                  : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {message.content}
            </Text>
          )}
        </View>

        {/* Footer */}
        <Text
          style={tw`text-xs text-gray-400 mt-1 ${isOwn ? "text-right" : "text-left"}`}
        >
          {message.isRead ? "Read" : "Sent"}
        </Text>
      </View>

      {isOwn && (
        <Avatar
          isSystem={false}
          sender={message.sender}
          isOwn={true}
          currentUserPicture={currentUserPicture}
        />
      )}
    </View>
  );
}

export default function Conversations({
  conversation,
  onRefetch,
}: ConversationsProps) {
  const auth = useAuth();
  const { isConnected, on, off, emit } = useSocketStore();
  const [messages, setMessages] = useState<Message[]>(
    conversation?.messages || [],
  );
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const userId = auth?.user.id;

  // Sync messages when conversation changes
  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
    }
  }, [conversation?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length, typingUser]);

  // Socket listeners
  useEffect(() => {
    if (!isConnected || !conversation?.id) return;

    // Mark as read
    emit("chat:markAsRead", { conversationId: conversation.id });

    const onNewMessage = (message: Message) => {
      console.log("📨 New message received");
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      emit("chat:markAsRead", { conversationId: conversation.id });
    };

    const onUserTyping = (data: {
      userId: string;
      userName: string;
      isTyping: boolean;
    }) => {
      if (data.userId === userId) return;
      setTypingUser(data.isTyping ? data.userName : null);
    };

    const onAdminJoined = () => {
      console.log("👨‍💼 Admin joined");
      onRefetch();
    };

    const onConversationClosed = () => {
      console.log("🔒 Conversation closed");
      onRefetch();
    };

    const onChatError = (error: any) => {
      showMessage({
        message: extract_message(error),
        type: "default",
      });
      console.error("❌ Chat error:", extract_message(error));
    };

    on("chat:newMessage", onNewMessage);
    on("chat:userTyping", onUserTyping);
    on("chat:adminJoined", onAdminJoined);
    on("chat:conversationClosed", onConversationClosed);
    on("chat:error", onChatError);

    return () => {
      off("chat:newMessage", onNewMessage);
      off("chat:userTyping", onUserTyping);
      off("chat:adminJoined", onAdminJoined);
      off("chat:conversationClosed", onConversationClosed);
      off("chat:error", onChatError);
    };
  }, [conversation?.id, isConnected, userId]);

  if (!conversation) {
    return null;
  }

  const statusConfig: Record<string, { text: string; color: string }> = {
    PENDING: {
      text: "Waiting for an admin to join...",
      color: "text-yellow-600",
    },
    ACTIVE: { text: "Admin is connected", color: "text-green-600" },
    CLOSED: { text: "Conversation closed", color: "text-red-600" },
  };
  const statusInfo = statusConfig[conversation.status];

  return (
    <ScrollView
      ref={scrollViewRef}
      style={tw`flex-1 bg-white dark:bg-gray-900`}
      contentContainerStyle={tw`py-4`}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {/* Status Bar */}
      {statusInfo && (
        <View style={tw`items-center py-2 mb-2`}>
          <Text style={tw`text-xs ${statusInfo.color}`}>{statusInfo.text}</Text>
        </View>
      )}

      {/* Messages */}
      {messages.map((message) => {
        const isOwn = !message.isSystem && message.senderId === userId;
        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={isOwn}
            currentUserPicture={auth?.user?.profilePicture}
          />
        );
      })}

      {/* Typing Indicator */}
      {typingUser && (
        <View style={tw`px-4 mb-3`}>
          <View
            style={tw`bg-gray-200 dark:bg-gray-700 rounded-2xl p-3 max-w-40`}
          >
            <Text style={tw`text-sm text-gray-600 dark:text-gray-400`}>
              {typingUser} is typing...
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
