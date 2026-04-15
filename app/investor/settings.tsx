import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";

type SettingsItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

const SETTINGS_ITEMS: SettingsItem[] = [
  { label: "Profile Info", icon: "person-circle-outline" },
  { label: "Bank Details", icon: "card-outline" },
  { label: "KYC", icon: "shield-checkmark-outline" },
  { label: "Security", icon: "lock-closed-outline" },
];

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={tw`flex-row items-center px-4 py-3 gap-3`}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={tw`p-1`}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>
          Settings
        </Text>
      </View>

      {/* Divider */}
      <View style={[tw`h-px`, { backgroundColor: Colors.divider }]} />

      {/* Settings items */}
      <View style={tw`px-4 pt-4 gap-1`}>
        {SETTINGS_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.onPress}
            activeOpacity={0.7}
            style={tw`flex-row items-center gap-4 px-2 py-3.5 rounded-xl`}
          >
            <View
              style={[
                tw`w-10 h-10 rounded-full items-center justify-center`,
                { backgroundColor: "#FDE8DC" },
              ]}
            >
              <Ionicons name={item.icon} size={18} color={Colors.brand} />
            </View>
            <Text
              style={[tw`flex-1 text-sm font-medium`, { color: Colors.textPrimary }]}
            >
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
