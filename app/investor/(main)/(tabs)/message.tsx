import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "@/lib/tw";
import ChatPage from "@/components/CHAT/ChatPage";

export default function MessageScreen() {
  return (
    <SafeAreaView style={tw`flex-1 bg-bg-light`} edges={["top", "bottom"]}>
      <ChatPage />
    </SafeAreaView>
  );
}
