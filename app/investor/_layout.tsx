import { StatusBar } from "react-native";
import { Drawer } from "expo-router/drawer";
import DrawerContent from "@/components/investor/drawer-menu";

export default function InvestorLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: "right",
        drawerStyle: { width: "82%" },
        overlayColor: "rgba(0,0,0,0.5)",
        swipeEdgeWidth: 40,
      }}
    >
      <Drawer.Screen name="(tabs)" />
      <Drawer.Screen name="settings" options={{ headerShown: false, swipeEnabled: false }} />
      <Drawer.Screen name="properties" options={{ headerShown: false, swipeEnabled: false }} />
      <Drawer.Screen name="kyc" options={{ headerShown: false, swipeEnabled: false }} />
    </Drawer>
    </>
  );
}
