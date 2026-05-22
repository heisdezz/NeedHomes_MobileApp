import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "@/lib/tw";

export default function PromotionsScreen() {
  return (
    <SafeAreaView style={tw`flex-1 bg-bg`}>
      <View style={tw`flex-1 items-center justify-center`}>
        <Text style={tw`text-white/50 text-base`}>Promotions</Text>
      </View>
    </SafeAreaView>
  );
}
