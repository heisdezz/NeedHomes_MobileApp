import { View, Text, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from '@/lib/tw';
import type { AccountType } from '@/types';

type CardProps = {
  type: AccountType;
  selected: boolean;
  icon: ImageSourcePropType;
  title: string;
  description: string;
  onPress: () => void;
};

function AccountCard({ selected, icon, title, description, onPress }: CardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={tw`w-full rounded-2xl p-5 flex-row items-center gap-4 ${
        selected ? 'bg-brand' : 'bg-surface'
      }`}
    >
      {/* Icon circle */}
      <View
        style={tw`w-14 h-14 rounded-full items-center justify-center ${
          selected ? 'bg-white/20' : 'bg-bg'
        }`}
      >
        <Image source={icon} style={tw`w-8 h-8`} resizeMode="contain" />
      </View>

      {/* Text */}
      <View style={tw`flex-1`}>
        <Text style={tw`text-white text-base font-bold mb-0.5`}>{title}</Text>
        <Text style={tw`text-white/70 text-xs leading-4`}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SignUpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={tw`flex-1 bg-bg`} edges={['top', 'bottom']}>
      {/* Logo */}
      <View style={tw`items-center pt-6 pb-8`}>
        <Image
          source={require('@/assets/need/logo.png')}
          style={tw`w-36 h-14`}
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <View style={tw`flex-1 px-6`}>
        <Text style={tw`text-white text-2xl font-bold text-center mb-2`}>Sign Up</Text>
        <Text style={tw`text-white/60 text-sm text-center mb-10 leading-5`}>
          Select the type of account you would{'\n'}like to create
        </Text>

        {/* Cards */}
        <View style={tw`gap-4`}>
          <AccountCard
            type="investor"
            selected
            icon={require('@/assets/sign-up/investor.png')}
            title="Investor"
            description="Invest on properties and make Profit"
            onPress={() => router.push('/auth/investor/individual')}
          />
          <AccountCard
            type="partner"
            selected={false}
            icon={require('@/assets/sign-up/partner.png')}
            title="Partner"
            description="Promote and Sell Properties to Earn Commission"
            onPress={() => router.push('/auth/partner')}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={tw`px-6 pb-8`}>
        <Text style={tw`text-white/50 text-sm text-center`}>
          Already have an account?{' '}
          <Text
            style={tw`text-brand font-semibold`}
            onPress={() => router.push('/auth/login')}
          >
            Log in
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}
