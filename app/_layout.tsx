import "react-native-reanimated";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Toaster, toast } from "sonner-native";
import FlashMessage from "react-native-flash-message";
const queryClient = new QueryClient();
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useEffect } from "react";
import { useAuth } from "@/store/auth-store";
import { useSocketStore } from "@/store/socket-store";
export const unstable_settings = {
  anchor: "index",
};

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const auth = useAuth();
  const { connect, disconnect, socket } = useSocketStore();

  useEffect(() => {
    if (auth?.accessToken) {
      connect();
    } else {
      disconnect();
    }
  }, [auth?.accessToken]);

  useEffect(() => {
    if (!socket) return;

    const handleAnnouncement = (data: any) => {
      console.log("📢 New announcement:", data);
      toast.info("New Announcement", {
        description: data.content,
      });
    };

    const handleNotification = (data: any) => {
      console.log("🔔 New notification:", data);
      toast.info("New Notification", {
        description: data.notification?.content || data.content,
      });
    };

    const handleChat = () => {
      console.log("💬 New chat message");
      toast.info("You have a New Message");
    };

    socket.on("announcement:new", handleAnnouncement);
    socket.on("notification:new", handleNotification);
    socket.on("chat:newMessage", handleChat);

    return () => {
      socket.off("announcement:new", handleAnnouncement);
      socket.off("notification:new", handleNotification);
      socket.off("chat:newMessage", handleChat);
    };
  }, [socket]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <FlashMessage position="top" statusBarHeight={32} />
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
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
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
