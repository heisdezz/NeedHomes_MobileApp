// import { Drawer } from "expo-router/drawer";
// import DrawerContent from "@/components/investor/drawer-menu";

// export default function InvestorDrawerLayout() {
//   return (
//     <Drawer
//       drawerContent={(props) => <DrawerContent {...props} />}
//       screenOptions={{
//         headerShown: false,
//         drawerPosition: "right",
//         drawerStyle: { width: "82%" },
//         overlayColor: "rgba(0,0,0,0.5)",
//         swipeEdgeWidth: 40,
//       }}
//     >
//       <Drawer.Screen name="(tabs)" />
//     </Drawer>
//   );
// }

import { useEffect } from "react";
import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";
import DrawerContent from "@/components/partner/drawer-menu";
import { useAuth } from "@/store";

export default function PartnerLayout() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth && auth.user.accountType !== "PARTNER") {
      router.replace("/investor");
    }
  }, [auth]);

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
