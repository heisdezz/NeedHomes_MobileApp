import { useEffect } from "react";
import { View, Image } from "react-native";
import { Redirect } from "expo-router";
import { useOnboardingStore } from "@/store";
import { useAuth } from "@/store/auth-store";
import { useHydration } from "@/hooks/use-hydration";

export default function Index() {
  const hydrated = useHydration();
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const auth = useAuth();

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: "#3C3C44", alignItems: "center", justifyContent: "center" }}>
        <Image
          source={require("@/assets/need/logo.png")}
          style={{ width: 180, height: 80, resizeMode: "contain" }}
        />
      </View>
    );
  }

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
