// import { useEffect } from "react";
// import { Drawer } from "expo-router/drawer";
// import { useRouter } from "expo-router";
// import DrawerContent from "@/components/partner/drawer-menu";
// import { useAuth } from "@/store";

// export default function PartnerLayout() {
//   const router = useRouter();
//   const auth = useAuth();

//   useEffect(() => {
//     if (auth && auth.user.accountType !== "PARTNER") {
//       router.replace("/investor");
//     }
//   }, [auth]);
// return <
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
//
import { useAuth } from "@/store";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";

export default function InvestorLayout() {
  const router = useRouter();

  const auth = useAuth();

  useEffect(() => {
    if (auth && auth.user.accountType !== "PARTNER") {
      router.replace("/investor");
    }
  }, [auth]);
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
