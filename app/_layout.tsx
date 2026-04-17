import "react-native-reanimated";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Toaster } from "sonner-native";
import FlashMessage from "react-native-flash-message";
const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: "index",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <FlashMessage position="top" statusBarHeight={32} />
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="onboarding"
              options={{ headerShown: false, animation: "fade" }}
            />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="investor" options={{ headerShown: false }} />
            <Stack.Screen name="partner" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
          </Stack>
          <StatusBar style="light" backgroundColor="#3C3C44" />
        </ThemeProvider>
      </QueryClientProvider>
      <Toaster />
    </GestureHandlerRootView>
  );
}
