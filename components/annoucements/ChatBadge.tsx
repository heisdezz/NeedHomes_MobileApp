import React from "react";
import { View } from "react-native";
import tw from "@/lib/tw";
import { useSocketStore } from "@/store/socket-store";

export default function ChatBadge() {
  const count = useSocketStore((s) => s.chatUnreadCount);
  if (!count) return null;
  return <View style={[tw`w-2.5 h-2.5 rounded-full`, { backgroundColor: "#EF4444" }]} />;
}
