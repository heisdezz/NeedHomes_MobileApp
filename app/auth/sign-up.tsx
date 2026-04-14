import { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from '@/lib/tw';
import type { AccountType } from '@/types';

type CardProps = {
  type: AccountType;
  selected: boolean;
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
};

function AccountCard({ type, selected, icon, title, description, onPress }: CardProps) {
  const isOrange = selected;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={tw`w-full rounded-2xl p-5 flex-row items-center gap-4 ${
        isOrange ? 'bg-[#F56821]' : 'bg-[#2E2E36]'
      }`}
    >
      {/* Icon circle */}
      <View
        style={tw`w-14 h-14 rounded-full items-center justify-center ${
          isOrange ? 'bg-white/20' : 'bg-[#3C3C44]'
        }`}
      >
        <Text style={tw`text-2xl`}>{icon}</Text>
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
  const [selected, setSelected] = useState<AccountType>('investor');

  const handleContinue = () => {
    if (selected === 'investor') {
      router.push('/auth/investor-register');
    } else {
      router.push('/auth/partner-register');
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#3C3C44]`} edges={['top', 'bottom']}>
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
            selected={selected === 'investor'}
            icon="👤"
            title="Investor"
            description="Invest on properties and make Profit"
            onPress={() => setSelected('investor')}
          />
          <AccountCard
            type="partner"
            selected={selected === 'partner'}
            icon="🤝"
            title="Partner"
            description="Promote and Sell Properties to Earn Commission"
            onPress={() => setSelected('partner')}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={tw`px-6 pb-8 gap-4`}>
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.85}
          style={tw`bg-[#F56821] rounded-xl py-4 items-center`}
        >
          <Text style={tw`text-white text-base font-semibold`}>Continue</Text>
        </TouchableOpacity>

        <Text style={tw`text-white/50 text-sm text-center`}>
          Already have an account?{' '}
          <Text
            style={tw`text-[#F56821] font-semibold`}
            onPress={() => router.push('/auth/login')}
          >
            Log in
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}
