import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";
import type { AccountType } from "@/types";

type CardProps = {
  type: AccountType;
  selected: boolean;
  icon: ImageSourcePropType;
  title: string;
  description: string;
  onPress: () => void;
};

function AccountCard({
  selected,
  icon,
  title,
  description,
  onPress,
}: CardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        tw`w-full rounded-2xl py-8 px-6 items-center gap-3`,
        {
          backgroundColor: selected ? Colors.brand : "#EFEFEF",
        },
      ]}
    >
      {/* Icon circle */}
      <View
        style={[
          tw`w-16 h-16 rounded-full items-center justify-center`,
          {
            backgroundColor: selected ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.1)",
          },
        ]}
      >
        <Image source={icon} style={tw`w-9 h-9`} resizeMode="contain" />
      </View>

      {/* Text */}
      <View style={tw`items-center gap-1`}>
        <Text
          style={[
            tw`text-base font-bold`,
            { color: selected ? "#fff" : Colors.textPrimary },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            tw`text-xs leading-5 text-center`,
            {
              color: selected ? "rgba(255,255,255,0.8)" : Colors.textSecondary,
            },
          ]}
        >
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SignUpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={tw`flex-1 bg-bg`} edges={["top", "bottom"]}>
      {/* Logo */}
      <View style={tw`items-center pt-6 pb-8`}>
        <Image
          source={require("@/assets/need/logo.png")}
          style={tw`w-36 h-14`}
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <View style={tw`flex-1 px-6`}>
        <Text style={tw`text-white text-2xl font-bold text-center mb-2`}>
          Sign Up
        </Text>
        <Text style={tw`text-white/60 text-sm text-center mb-10 leading-5`}>
          Select the type of account you would{"\n"}like to create
        </Text>

        {/* Cards */}
        <View style={tw`gap-4`}>
          <AccountCard
            type="investor"
            selected
            icon={require("@/assets/sign-up/investor.png")}
            title="Investor"
            description="Invest on properties and make Profit"
            onPress={() => router.push("/auth/investor/individual")}
          />
          <AccountCard
            type="partner"
            selected={false}
            icon={require("@/assets/sign-up/partner.png")}
            title="Partner"
            description="Promote and Sell Properties to Earn Commission"
            onPress={() => router.push("/auth/partner")}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={tw`px-6 pb-8`}>
        <Text style={tw`text-white/50 text-sm text-center`}>
          Already have an account?{" "}
          <Text
            style={tw`text-brand font-semibold`}
            onPress={() => router.push("/auth/login")}
          >
            Log in
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}
