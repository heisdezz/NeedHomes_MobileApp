import React from "react";
import { View, Text } from "react-native";
import tw from "@/lib/tw";
import { Colors } from "@/constants/theme";
import { useSocketStore } from "@/store/socket-store";

export default function NotificationsBadge() {
  const unread = useSocketStore((s) => s.notificationUnreadCount);

  if (!unread) return null;
  const label = unread > 99 ? "99+" : String(unread);

  return (
    <View
      style={[tw`px-2 py-0.5 rounded-full`, { backgroundColor: Colors.brand }]}
    >
      <Text style={tw`text-xs font-semibold text-white`}>{label}</Text>
    </View>
  );
}
