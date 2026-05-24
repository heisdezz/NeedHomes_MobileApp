import { useEffect } from "react";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useOnboardingStore } from "@/store";
import { useAuth } from "@/store/auth-store";
import { useHydration } from "@/hooks/use-hydration";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const hydrated = useHydration();
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const auth = useAuth();

  useEffect(() => {
    if (hydrated) {
      SplashScreen.hideAsync();
    }
  }, [hydrated]);

  if (!hydrated) return null;

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
