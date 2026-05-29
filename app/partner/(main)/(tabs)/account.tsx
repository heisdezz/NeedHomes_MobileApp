import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/store/auth-store";
import { Colors } from "@/constants/theme";
import PrimaryButton from "@/components/primary-button";
import LogoutModal from "@/components/ui/LogoutModal";
import tw from "@/lib/tw";
import { useState } from "react";

export default function PartnerAccountScreen() {
  const auth = useAuth();
  const [logoutVisible, setLogoutVisible] = useState(false);

  const user = auth?.user;

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  function handleLogoutConfirm() {
    setLogoutVisible(false);
    router.replace("/auth/login");
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-bg-light`} edges={["top"]}>
      <LogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={handleLogoutConfirm}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-10`}
      >
        {/* Header */}
        <View style={tw`px-5 pt-4 pb-2`}>
          <Text style={[tw`text-xl font-bold`, { color: Colors.textPrimary }]}>
            Account
          </Text>
        </View>

        {/* Profile Card */}
        <View
          style={[
            tw`mx-4 mt-3 rounded-2xl p-5`,
            {
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: Colors.divider,
            },
          ]}
        >
          <View style={tw`flex-row items-start justify-between`}>
            <View
              style={[
                tw`w-16 h-16 rounded-2xl items-center justify-center mr-4`,
                {
                  backgroundColor: Colors.brand + "15",
                },
              ]}
            >
              <Text style={[tw`text-2xl font-bold`, { color: Colors.brand }]}>
                {initials}
              </Text>
            </View>

            <View style={tw`flex-1 justify-center`}>
              <Text
                style={[
                  tw`text-lg font-bold mb-0.5`,
                  { color: Colors.textPrimary },
                ]}
              >
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
                {user?.email ?? "—"}
              </Text>
              {user?.phoneNumber ? (
                <Text style={[tw`text-sm mt-0.5`, { color: Colors.textMuted }]}>
                  {user.phoneNumber}
                </Text>
              ) : null}
              <View
                style={[
                  tw`self-start mt-1.5 px-2 py-0.5 rounded-full`,
                  { backgroundColor: Colors.brand + "15" },
                ]}
              >
                <Text
                  style={[
                    tw`text-[10px] font-semibold uppercase tracking-wide`,
                    { color: Colors.brand },
                  ]}
                >
                  {user?.accountType ?? "Partner"}
                </Text>
              </View>
            </View>
          </View>

          <View style={tw`mt-4`}>
            <PrimaryButton
              label="Edit Profile"
              onPress={() => router.push("/partner/profile-info")}
            />
          </View>
        </View>

        {/* Quick Links */}
        <View
          style={[
            tw`mx-4 mt-4 rounded-2xl overflow-hidden`,
            { borderWidth: 1, borderColor: Colors.inputBorder },
          ]}
        >
          {(
            [
              {
                icon: "notifications-outline" as const,
                label: "Announcements",
                onPress: () => router.push("/partner/announcements"),
              },
              {
                icon: "settings-outline" as const,
                label: "Settings",
                onPress: () => router.push("/partner/settings"),
              },
              {
                icon: "help-circle-outline" as const,
                label: "Help & Support",
                onPress: () => router.push("/partner/message"),
              },
            ] as const
          ).map(({ icon, label, onPress }, i, arr) => (
            <TouchableOpacity
              key={label}
              onPress={onPress}
              activeOpacity={0.7}
              style={[
                tw`flex-row items-center justify-between px-4 py-4 bg-white`,
                i < arr.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.divider,
                },
              ]}
            >
              <View style={tw`flex-row items-center gap-3`}>
                <Ionicons name={icon} size={20} color={Colors.textSecondary} />
                <Text
                  style={[
                    tw`text-sm font-medium`,
                    { color: Colors.textPrimary },
                  ]}
                >
                  {label}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View style={tw`mx-4 mt-4`}>
          <TouchableOpacity
            onPress={() => setLogoutVisible(true)}
            activeOpacity={0.8}
            style={[
              tw`flex-row items-center justify-center gap-2 py-4 rounded-2xl`,
              {
                backgroundColor: "#FEE2E2",
                borderWidth: 1,
                borderColor: "#FCA5A5",
              },
            ]}
          >
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
            <Text style={[tw`text-sm font-semibold`, { color: "#DC2626" }]}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
