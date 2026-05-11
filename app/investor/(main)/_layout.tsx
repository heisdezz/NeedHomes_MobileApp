import { Drawer } from "expo-router/drawer";
import DrawerContent from "@/components/investor/drawer-menu";

export default function InvestorDrawerLayout() {
  return (
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
    </Drawer>
  );
}
