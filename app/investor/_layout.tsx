import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function InvestorLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
