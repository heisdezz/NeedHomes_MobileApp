import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { useAuth } from "@/store";
import tw from "@/lib/tw";

export default function HomeScreen() {
  const navigation = useNavigation();
  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());
  const auth = useAuth();
  const user = auth?.user;

  return (
    <SafeAreaView style={tw`flex-1 bg-bg`} edges={["top"]}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-5 py-4`}>
        <View>
          <Text style={tw`text-white/60 text-sm`}>Welcome back,</Text>
          <Text style={tw`text-white text-lg font-bold`}>
            {user?.firstName ?? "Investor"}
          </Text>
        </View>
        <TouchableOpacity onPress={openDrawer} activeOpacity={0.7}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Placeholder */}
      <View style={tw`flex-1 items-center justify-center`}>
        <Text style={tw`text-white/30 text-base`}>Home</Text>
      </View>
    </SafeAreaView>
  );
}
