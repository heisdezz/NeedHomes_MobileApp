import { View, Text, TouchableOpacity } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";

// ── Tab config ────────────────────────────────────────────────────────────────
type TabConfig = {
  name: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconFocused?: keyof typeof Ionicons.glyphMap;
  isCenter?: boolean;
};

const TAB_CONFIG: TabConfig[] = [
  { name: "index", label: "Home", icon: "home-outline", iconFocused: "home" },
  {
    name: "message",
    label: "Message",
    icon: "chatbubble-ellipses-outline",
    iconFocused: "chatbubble-ellipses",
  },
  { name: "add", label: "", isCenter: true },
  {
    name: "investment",
    label: "Investment",
    icon: "bar-chart-outline",
    iconFocused: "bar-chart",
  },
  {
    name: "account",
    label: "Account",
    icon: "person-circle-outline",
    iconFocused: "person-circle",
  },
];

// ── Custom tab bar ────────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation }: any) {
  return (
    <View
      style={[
        tw`flex-row bg-white px-2 pt-2 pb-4`,
        { borderTopWidth: 1, borderTopColor: "#F0F0F0", elevation: 8 },
      ]}
    >
      {state.routes.map((route: any, idx: number) => {
        const config = TAB_CONFIG.find((t) => t.name === route.name);
        if (!config) return null;
        const isFocused = state.index === idx;

        if (config.isCenter) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.85}
              style={tw`flex-1 items-center justify-center`}
            >
              <View
                style={[
                  tw`w-14 h-14 rounded-full bg-brand items-center justify-center`,
                  { marginTop: -28, elevation: 6 },
                ]}
              >
                <Ionicons name="add" size={32} color="#fff" />
              </View>
            </TouchableOpacity>
          );
        }

        const iconName = isFocused
          ? (config.iconFocused ?? config.icon!)
          : config.icon!;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
            style={tw`flex-1 items-center gap-1 py-1`}
          >
            <Ionicons
              name={iconName}
              size={22}
              color={isFocused ? Colors.brand : "#9CA3AF"}
            />
            <Text
              style={[
                tw`text-xs`,
                { color: isFocused ? Colors.brand : "#9CA3AF" },
              ]}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function InvestorTabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="message" />
      <Tabs.Screen name="add" />
      <Tabs.Screen name="investment" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
