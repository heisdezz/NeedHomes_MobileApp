import tw from "@/lib/tw";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof KeyboardAwareScrollView>;

export default function AwareScrollview({ style, children, ...props }: Props) {
  return (
    <KeyboardAwareScrollView style={[tw`flex-1`, style]} bottomOffset={30} {...props}>
      {children}
    </KeyboardAwareScrollView>
  );
}
