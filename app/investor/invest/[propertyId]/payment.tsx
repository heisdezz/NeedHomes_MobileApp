import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";

export default function PaymentScreen() {
  const { investmentId } = useLocalSearchParams<{ investmentId: string }>();
  const router = useRouter();

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: "#fff" }]} edges={["top", "bottom"]}>
      {/* Header */}
      <View
        style={[
          tw`flex-row items-center px-4 py-3 border-b`,
          { borderBottomColor: Colors.divider },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={tw`mr-3`}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[tw`text-lg font-bold flex-1`, { color: Colors.textPrimary }]}>
          Payment
        </Text>
      </View>

      <View style={tw`flex-1 items-center justify-center p-6`}>
        <Ionicons name="card-outline" size={64} color={Colors.brand} />
        <Text style={[tw`text-xl font-bold mt-4 mb-2`, { color: Colors.textPrimary }]}>
          Payment Integration
        </Text>
        <Text style={[tw`text-sm text-center`, { color: Colors.textSecondary }]}>
          Payment gateway integration will be added here.
        </Text>
        <Text style={[tw`text-xs mt-4`, { color: Colors.textSecondary }]}>
          Investment ID: {investmentId}
        </Text>
      </View>
    </SafeAreaView>
  );
}
