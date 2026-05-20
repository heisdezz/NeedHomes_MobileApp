import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { useAuth, useKyc } from "@/store";
import apiClient from "@/lib/api";
import { Colors } from "@/constants/theme";
import InvestorStats from "@/components/investor/investor-stats";
import InvestorWallet from "@/components/investor/investor-wallet";
import PromoCarousel from "@/components/investor/promo-carousel";
import InvestorPropertyListings from "@/components/investor/investor-property-listings";
import tw from "@/lib/tw";
import { set_kyc_value } from "@/store/auth-store";

function QuickLinkCard({
  icon,
  label,
  bg,
  textColor,
  onPress,
}: {
  icon: string;
  label: string;
  bg: string;
  textColor: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        tw`flex-1 rounded-2xl items-center justify-center py-5 gap-2`,
        { backgroundColor: bg },
      ]}
    >
      <Text style={{ fontSize: 28 }}>{icon}</Text>
      <Text
        style={[tw`text-xs font-semibold text-center`, { color: textColor }]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const KYC_BADGE: Record<string, { label: string; bg: string; color: string }> =
  {
    VERIFIED: { label: "KYC Verified", bg: "#DCFCE7", color: "#16A34A" },
    PENDING: { label: "KYC Pending", bg: "#FEF9C3", color: "#CA8A04" },
    REJECTED: { label: "KYC Rejected", bg: "#FEE2E2", color: "#DC2626" },
  };

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());
  const auth = useAuth();
  const user = auth?.user;
  const kyc = useKyc();
  const badge = KYC_BADGE[kyc?.account_verification_status as string] ?? null;
  const isVerified = kyc?.account_verification_status === "VERIFIED";

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    if (isVerified) return;
    setRefreshing(true);
    try {
      const { data } = await apiClient.get("kyc");
      const verification = data?.data?.verification;
      if (verification) set_kyc_value(verification);
    } catch {}
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-bg-light`} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
        contentContainerStyle={tw`pb-8`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.brand}
            colors={[Colors.brand]}
          />
        }
      >
        {/* Header */}
        <View style={tw`flex-row items-center justify-between px-5 py-4`}>
          <View style={tw`flex-row items-center gap-3`}>
            <View
              style={[
                tw`w-10 h-10 rounded-full items-center justify-center`,
                { backgroundColor: Colors.surface },
              ]}
            >
              <Ionicons name="person" size={20} color={Colors.textMuted} />
            </View>
            <View>
              <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>
                Welcome back,
              </Text>
              <Text
                style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}
              >
                {user?.firstName ?? "Investor"}
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
              ) : null}
            </View>
          </View>

          <View style={tw`flex-row items-center gap-3`}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                tw`w-9 h-9 rounded-full items-center justify-center`,
                // { s: Colors.surface },
              ]}
            >
              <Ionicons name="notifications" size={24} color={Colors.brand} />
            </TouchableOpacity>
            <TouchableOpacity onPress={openDrawer} activeOpacity={0.7}>
              <Ionicons name="menu" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Key Activities */}
        <InvestorStats />

        {/* Wallet */}
        <View style={tw`mt-5`}>
          <InvestorWallet />
        </View>

        {/* Promo Carousel */}
        {/*<View style={tw`mt-5`}>
          <PromoCarousel />
        </View>*/}

        {/* Property Listings */}
        <View style={tw`mt-5`}>
          <InvestorPropertyListings />
        </View>

        {/* Quick links */}
        <View style={tw`flex-row gap-3 px-4 mt-5`}>
          <QuickLinkCard
            icon="📋"
            label="Frequently Asked Questions"
            bg="#FFDEC1"
            textColor={Colors.textPrimary}
            onPress={() => router.push("/faq")}
          />
          <QuickLinkCard
            icon="📄"
            label="Our Policies"
            bg="#4F6473"
            textColor="#fff"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
