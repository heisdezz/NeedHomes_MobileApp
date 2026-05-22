import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import tw from "@/lib/tw";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/store/auth-store";
import KYCForm from "@/components/kyc/KYCForm";
import CorpKYCForm from "@/components/kyc/CorpKYCForm";

export default function KYCScreen() {
  const router = useRouter();
  const auth = useAuth();
  const verificationType = auth?.user?.accountType;
  const isCorporate = verificationType === "CORPORATE";

  return (
    <SafeAreaView
      style={tw`flex-1 bg-[${Colors.bgLight}]`}
      edges={["top", "bottom"]}
    >
      <View style={tw`flex-row items-center px-4 py-3 gap-3`}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={tw`p-1`}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>
          KYC Verification
        </Text>
      </View>
      <View style={[tw`h-px`, { backgroundColor: Colors.divider }]} />

      {/*<Text>{auth?.user.accountType}</Text>*/}
      {isCorporate ? <CorpKYCForm /> : <KYCForm />}
    </SafeAreaView>
  );
}
