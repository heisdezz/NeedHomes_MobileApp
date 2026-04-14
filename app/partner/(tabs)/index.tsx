import PrimaryButton from "@/components/primary-button";
import tw from "@/lib/tw";
import { useAuth, useKyc } from "@/store";
import { logout, useLogout } from "@/store/auth-store";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function index() {
  const kyc = useKyc();
  const auth = useAuth();
  const { isPending } = useLogout();
  return (
    <SafeAreaView>
      <ScrollView>
        <PrimaryButton
          loading={isPending}
          label="Logout"
          onPress={() => {
            logout();
          }}
        ></PrimaryButton>
        {/*<Text style={tw`text-red-500`}>{JSON.stringify(kyc, null, 2)}</Text>*/}
        <Text style={tw`text-green-500`}>{JSON.stringify(auth, null, 2)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
