import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";

export default function PartnerSettingsScreen() {
  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={["top", "bottom"]}>
      <View
        style={[
          tw`flex-row items-center px-4 py-4 gap-3`,
          { borderBottomWidth: 1, borderColor: "#F0F0F0" },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[tw`text-base font-bold flex-1`, { color: Colors.textPrimary }]}>
          Settings
        </Text>
      </View>
      <View style={tw`flex-1 items-center justify-center`}>
        <Text style={[tw`text-sm`, { color: Colors.textMuted }]}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
