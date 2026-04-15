import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { useAuth } from "@/store";
import { Colors } from "@/constants/theme";
import InvestorStats from "@/components/investor/investor-stats";
import InvestorWallet from "@/components/investor/investor-wallet";
import PromoCarousel from "@/components/investor/promo-carousel";
import InvestorPropertyListings from "@/components/investor/investor-property-listings";
import tw from "@/lib/tw";

function QuickLinkCard({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        tw`flex-1 rounded-2xl items-center justify-center py-5 gap-2`,
        { backgroundColor: Colors.surface },
      ]}
    >
      <Text style={{ fontSize: 28 }}>{icon}</Text>
      <Text
        style={[
          tw`text-xs font-semibold text-center`,
          { color: Colors.textInverse },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());
  const auth = useAuth();
  const user = auth?.user;

  return (
    <SafeAreaView style={tw`flex-1 bg-bg-light`} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-8`}
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
            </View>
          </View>

          <View style={tw`flex-row items-center gap-3`}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                tw`w-9 h-9 rounded-full items-center justify-center`,
                { backgroundColor: Colors.surface },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={Colors.brand}
              />
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
        <View style={tw`mt-5`}>
          <PromoCarousel />
        </View>

        {/* Property Listings */}
        <View style={tw`mt-5`}>
          <InvestorPropertyListings />
        </View>

        {/* Quick links */}
        <View style={tw`flex-row gap-3 px-4 mt-5`}>
          <QuickLinkCard icon="📋" label="Frequently Asked Questions" />
          <QuickLinkCard icon="📄" label="Our Policies" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
