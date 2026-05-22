import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useKyc, useAuthStore } from "@/store/auth-store";
import { Colors } from "@/constants/theme";
import PrimaryButton from "@/components/primary-button";
import tw from "@/lib/tw";

const KYC_CONFIG: Record<
  string,
  {
    label: string;
    bg: string;
    color: string;
    border: string;
    icon: keyof typeof Ionicons.glyphMap;
    description: string;
  }
> = {
  VERIFIED: {
    label: "Verified",
    bg: "#D1FAE5",
    color: "#059669",
    border: "#6EE7B7",
    icon: "checkmark-circle",
    description:
      "Your identity has been verified. You have full access to all investment features.",
  },
  PENDING: {
    label: "Under Review",
    bg: "#FEF3C7",
    color: "#D97706",
    border: "#FCD34D",
    icon: "time-outline",
    description:
      "Your documents are being reviewed. This usually takes 1–2 business days.",
  },
  REJECTED: {
    label: "Rejected",
    bg: "#FEE2E2",
    color: "#DC2626",
    border: "#FCA5A5",
    icon: "close-circle",
    description:
      "Your KYC was rejected. Please re-submit with valid documents.",
  },
};

export default function AccountScreen() {
  const auth = useAuth();
  const kyc = useKyc();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const clearKyc = useAuthStore((s) => s.clearKyc);

  const user = auth?.user;
  const kycStatus = (kyc as any)?.account_verification_status as
    | string
    | undefined;
  const kycConfig = kycStatus ? KYC_CONFIG[kycStatus] : null;

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";

  function handleLogout() {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          clearAuth();
          clearKyc();
          router.replace("/auth/login");
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-bg-light`} edges={["top"]}>
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
              backgroundColor: Colors.card,
              borderWidth: 1,
              borderColor: Colors.inputBorder,
            },
          ]}
        >
          <View style={tw`flex-row items-center gap-4`}>
            {/* Avatar */}
            <View
              style={[
                tw`w-16 h-16 rounded-full items-center justify-center`,
                { backgroundColor: Colors.brand + "20" },
              ]}
            >
              <Text style={[tw`text-2xl font-bold`, { color: Colors.brand }]}>
                {initials}
              </Text>
            </View>

            {/* Name + email */}
            <View style={tw`flex-1`}>
              {user?.accountType === "CORPORATE" && (user as any)?.companyName ? (
                <>
                  <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>
                    {(user as any).companyName}
                  </Text>
                  <Text style={[tw`text-xs mt-0.5`, { color: Colors.textMuted }]}>
                    {`${user.firstName} ${user.lastName}`}
                  </Text>
                </>
              ) : (
                <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>
                  {user ? `${user.firstName} ${user.lastName}` : "—"}
                </Text>
              )}
              <Text
                style={[tw`text-sm mt-0.5`, { color: Colors.textSecondary }]}
              >
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
                  {user?.accountType ?? "Investor"}
                </Text>
              </View>
            </View>
          </View>

          <View style={tw`mt-4`}>
            <PrimaryButton
              label="Edit Profile"
              onPress={() => router.push("/investor/profile-info")}
            />
          </View>
        </View>

        {/* KYC Card */}
        <View
          style={[
            tw`mx-4 mt-4 rounded-2xl overflow-hidden`,
            { borderWidth: 1, borderColor: Colors.inputBorder },
          ]}
        >
          {/* Card header */}
          <View
            style={[
              tw`flex-row items-center justify-between px-4 py-3`,
              {
                backgroundColor: Colors.inputBg,
                borderBottomWidth: 1,
                borderBottomColor: Colors.divider,
              },
            ]}
          >
            <View style={tw`flex-row items-center gap-2`}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={Colors.textPrimary}
              />
              <Text
                style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}
              >
                KYC Verification
              </Text>
            </View>

            {kycConfig ? (
              <View
                style={[
                  tw`flex-row items-center gap-1 px-2.5 py-1 rounded-full`,
                  {
                    backgroundColor: kycConfig.bg,
                    borderWidth: 1,
                    borderColor: kycConfig.border,
                  },
                ]}
              >
                <Ionicons
                  name={kycConfig.icon}
                  size={12}
                  color={kycConfig.color}
                />
                <Text
                  style={[
                    tw`text-xs font-semibold`,
                    { color: kycConfig.color },
                  ]}
                >
                  {kycConfig.label}
                </Text>
              </View>
            ) : (
              <View
                style={[
                  tw`px-2.5 py-1 rounded-full`,
                  {
                    backgroundColor: "#F3F4F6",
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                  },
                ]}
              >
                <Text
                  style={[
                    tw`text-xs font-semibold`,
                    { color: Colors.textMuted },
                  ]}
                >
                  Not Started
                </Text>
              </View>
            )}
          </View>

          {/* Card body */}
          <View style={[tw`p-4`, { backgroundColor: Colors.card }]}>
            <Text
              style={[
                tw`text-sm leading-5 mb-4`,
                { color: Colors.textSecondary },
              ]}
            >
              {kycConfig?.description ??
                "Complete your KYC to unlock full investment features and increase your transaction limits."}
            </Text>

            {kycStatus !== "VERIFIED" && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/investor/kyc")}
                style={[
                  tw`flex-row items-center justify-center gap-2 py-3 rounded-xl`,
                  { backgroundColor: Colors.brand },
                ]}
              >
                <Ionicons
                  name={
                    kycStatus === "REJECTED"
                      ? "refresh-outline"
                      : "document-text-outline"
                  }
                  size={16}
                  color="#fff"
                />
                <Text style={tw`text-white text-sm font-bold`}>
                  {kycStatus === "REJECTED"
                    ? "Re-submit KYC"
                    : kycStatus === "PENDING"
                      ? "View KYC Status"
                      : "Complete KYC"}
                </Text>
              </TouchableOpacity>
            )}
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
                icon: "settings-outline" as const,
                label: "Settings",
                onPress: () => router.push("/investor/settings"),
              },
              {
                icon: "help-circle-outline" as const,
                label: "Help & Support",
                onPress: () => {},
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
            onPress={handleLogout}
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
