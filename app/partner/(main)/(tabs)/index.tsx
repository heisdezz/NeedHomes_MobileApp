import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { useAuth } from "@/store";
import { Colors } from "@/constants/theme";
import PartnerStats from "@/components/partner/partner-stats";
import PartnerPropertyListings from "@/components/partner/partner-property-listings";
import PartnerCalendar from "@/components/partner/partner-calendar";
import PartnerWallet from "@/components/partner/partner-wallet";
import tw from "@/lib/tw";

export default function PartnerHomeScreen() {
  const navigation = useNavigation();
  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());
  const auth = useAuth();
  const user = auth?.user;

  return (
    <SafeAreaView style={tw`flex-1 bg-bg-light`} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
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
              <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>Welcome back,</Text>
              <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>
                {user?.firstName ?? "Partner"}
              </Text>
            </View>
          </View>

          <View style={tw`flex-row items-center gap-3`}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                tw`w-9 h-9 rounded-full items-center justify-center`,
                { backgroundColor: Colors.brand + "15" },
              ]}
            >
              <Ionicons name="notifications" size={22} color={Colors.brand} />
            </TouchableOpacity>
            <TouchableOpacity onPress={openDrawer} activeOpacity={0.7}>
              <Ionicons name="menu" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Statistics */}
        <PartnerStats />

        {/* Recent Properties */}
        <View style={tw`mt-5`}>
          <PartnerPropertyListings />
        </View>

        {/* Calendar */}
        <View style={tw`mt-5`}>
          <PartnerCalendar />
        </View>

        {/* Wallet */}
        <View style={tw`mt-5`}>
          <PartnerWallet />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
