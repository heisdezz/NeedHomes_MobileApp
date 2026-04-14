import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useOnboardingStore } from "@/store";
import { useAuth } from "@/store/auth-store";
import { useHydration } from "@/hooks/use-hydration";
import tw from "@/lib/tw";
import { Text } from "react-native";
export default function Index() {
  const hydrated = useHydration();
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const auth = useAuth();
  // if (!hydrated) {
  //   return (
  //     <View style={tw`flex-1 items-center justify-center bg-[#3C3C44]`}>
  //       <Text>{JSON.stringify({ hasSeenOnboarding, auth, hydrated })}</Text>
  //       <ActivityIndicator color="#F56821" />
  //     </View>
  //   );
  // }

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!auth) {
    return <Redirect href="/auth/sign-up" />;
  }

  if (auth.user.accountType === "INVESTOR") {
    return <Redirect href="/investor" />;
  }

  return <Redirect href="/partner" />;
}
