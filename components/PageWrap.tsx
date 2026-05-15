import tw from "@/lib/tw";
import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PageWrap(props: PropsWithChildren) {
  return (
    <SafeAreaView style={tw`flex-1 bg-bg-light`} edges={["top", "bottom"]}>
      {props.children}
    </SafeAreaView>
  );
}
