import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOnboardingStore } from '@/store';
import { useAuth } from '@/store/auth-store';

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: 'onboarding',
};

function NavigationGuard() {
  const router = useRouter();
  const segments = useSegments();
  const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
  const auth = useAuth();

  useEffect(() => {
    const root = segments[0] as string | undefined;

    if (!hasSeenOnboarding) {
      if (root !== 'onboarding') router.replace('/onboarding');
      return;
    }

    if (!auth) {
      if (root !== 'auth') router.replace('/auth/sign-up');
      return;
    }

    // Logged in — route by account type
    const accountType = auth.user.accountType;
    if (accountType === 'investor' && root !== 'investor') {
      router.replace('/investor');
    } else if (accountType === 'partner' && root !== 'partner') {
      router.replace('/partner');
    }
  }, [hasSeenOnboarding, auth, segments]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <NavigationGuard />
        <Stack>
          <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="investor" options={{ headerShown: false }} />
          <Stack.Screen name="partner" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="light" backgroundColor="#3C3C44" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
