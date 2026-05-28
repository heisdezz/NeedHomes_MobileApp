import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useAuth, useKyc } from "@/store";
import { useLogout } from "@/lib/mutations/auth";
import LogoutModal from "@/components/ui/LogoutModal";
import tw from "@/lib/tw";
import { useState } from "react";
import QueryBadge from "@/components/annoucements/QueryBadge";
import NotificationsBadge from "@/components/annoucements/NotificationsBadge";
import ChatBadge from "@/components/annoucements/ChatBadge";
import { useSocketStore } from "@/store/socket-store";

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

const MENU_ITEMS: MenuItem[] = [
  { label: "Profile Info", icon: "person-outline" },
  { label: "My Investments", icon: "trending-up-outline" },
  // { label: "Wallet", icon: "wallet-outline" },
  { label: "Properties", icon: "home-outline" },
  { label: "Transactions", icon: "receipt-outline" },
  { label: "Announcements", icon: "megaphone-outline" },
  { label: "Chat", icon: "chatbubble-outline" },
  { label: "Notifications", icon: "notifications-outline" },
  { label: "Bank Details", icon: "card-outline" },
];

function IconCircle({ name }: { name: keyof typeof Ionicons.glyphMap }) {
  return (
    <View
      style={[
        tw`w-10 h-10 rounded-full items-center justify-center`,
        { backgroundColor: "#FDE8DC" },
      ]}
    >
      <Ionicons name={name} size={18} color={Colors.brand} />
    </View>
  );
}

const KYC_BADGE: Record<string, { label: string; bg: string; color: string }> =
  {
    VERIFIED: { label: "KYC Verified", bg: "#DCFCE7", color: "#16A34A" },
    PENDING: { label: "KYC Pending", bg: "#FEF9C3", color: "#CA8A04" },
    REJECTED: { label: "KYC Rejected", bg: "#FEE2E2", color: "#DC2626" },
  };

export default function DrawerContent({
  navigation,
}: DrawerContentComponentProps) {
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  const kyc = useKyc();
  const { doLogout } = useLogout();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const clearChatUnread = useSocketStore((s) => s.clearChatUnread);
  const badge = KYC_BADGE[kyc?.account_verification_status as string] ?? null;

  // const fullName =
  //   ((kyc as any)?.companyName ??
  //     `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()) ||
  //   "Investor";
  const fullName =
    kyc?.companyName ??
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ??
    "Investor";
  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={["top", "bottom"]}>
      <LogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={() => { setLogoutVisible(false); doLogout(); }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-8`}
      >
        {/* Header */}
        <View style={tw`flex-row items-center justify-between px-6 pt-6 pb-6`}>
          <View style={tw`flex-row items-center gap-3`}>
            <View
              style={[
                tw`w-12 h-12 rounded-full overflow-hidden items-center justify-center`,
                { backgroundColor: "#E5E7EB" },
              ]}
            >
              {user?.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  style={tw`w-12 h-12`}
                />
              ) : (
                <Ionicons name="person" size={26} color="#9CA3AF" />
              )}
            </View>
            <View>
              <Text style={tw`text-text-primary text-base font-bold`}>
                {fullName || "User"}
              </Text>
              {badge ? (
                <View
                  style={[
                    tw`self-start mt-0.5 rounded-full px-2 py-0.5`,
                    { backgroundColor: badge.bg },
                  ]}
                >
                  <Text
                    style={[
                      tw`text-[10px] font-semibold`,
                      { color: badge.color },
                    ]}
                  >
                    {badge.label}
                  </Text>
                </View>
              ) : (
                <Text style={tw`text-text-muted text-xs`}>Investor</Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.closeDrawer()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={[tw`h-px mx-6 mb-4`, { backgroundColor: "#F0F0F0" }]} />

        {/* Main menu */}
        <View style={tw`px-4 gap-1`}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => {
                navigation.closeDrawer();
                if (item.label === "Profile Info") {
                  router.push("/investor/profile-info");
                } else if (item.label === "Bank Details") {
                  router.push("/investor/BankDetails");
                } else if (item.label === "Transactions") {
                  router.push("/investor/transactions");
                } else if (item.label === "Properties") {
                  router.push("/investor/properties");
                } else if (item.label === "Wallet PIN") {
                  router.push("/investor/wallet-pin");
                } else if (item.label === "My Investments") {
                  router.push("/investor/investment");
                } else if (item.label === "Chat") {
                  clearChatUnread();
                  router.push("/investor/message");
                } else if (item.label === "Announcements") {
                  router.push("/investor/announcements");
                } else if (item.label === "Notifications") {
                  router.push("/investor/notifications");
                } else {
                  item.onPress?.();
                }
              }}
              activeOpacity={0.7}
              style={tw`flex-row items-center gap-4 px-2 py-1.5 rounded-xl`}
            >
              <IconCircle name={item.icon} />
              <Text style={tw`text-text-primary text-sm font-medium`}>
                {item.label}
              </Text>

              {item.label === "Announcements" && (
                <View style={tw`ml-auto`}>
                  <QueryBadge />
                </View>
              )}
              {item.label === "Notifications" && (
                <View style={tw`ml-auto`}>
                  <NotificationsBadge />
                </View>
              )}
              {item.label === "Chat" && (
                <View style={tw`ml-auto`}>
                  <ChatBadge />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Divider */}
        <View style={[tw`h-px mx-6 my-4`, { backgroundColor: "#F0F0F0" }]} />

        {/* Bottom */}
        <View style={tw`px-4 gap-1`}>
          <TouchableOpacity
            onPress={() => {
              navigation.closeDrawer();
              router.push("/investor/settings");
            }}
            activeOpacity={0.7}
            style={tw`flex-row items-center gap-4 px-2 py-1.5 rounded-xl`}
          >
            <IconCircle name="settings-outline" />
            <Text style={tw`text-text-primary text-sm font-medium`}>
              Settings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              navigation.closeDrawer();
              setLogoutVisible(true);
            }}
            activeOpacity={0.7}
            style={tw`flex-row items-center gap-4 px-2 py-1.5 rounded-xl`}
          >
            <View
              style={[
                tw`w-10 h-10 rounded-full items-center justify-center`,
                { backgroundColor: "#FDE8DC" },
              ]}
            >
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            </View>
            <Text style={tw`text-red-500 text-sm font-medium`}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
