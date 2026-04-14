import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from '@/lib/tw';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export default function PasswordInput({ label, error, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={tw`gap-1.5`}>
      <Text style={tw`text-[#1A1A1A] text-sm font-medium`}>{label}</Text>
      <View
        style={tw`flex-row items-center bg-white border rounded-xl px-4 ${
          error ? 'border-red-400' : 'border-[#E0E0E0]'
        }`}
      >
        <TextInput
          style={tw`flex-1 py-3.5 text-sm text-[#1A1A1A]`}
          placeholderTextColor="#A0A0A0"
          secureTextEntry={!visible}
          {...props}
        />
        <TouchableOpacity onPress={() => setVisible((v) => !v)} hitSlop={8}>
          <Ionicons
            name={visible ? 'eye-outline' : 'eye-off-outline'}
            size={18}
            color="#A0A0A0"
          />
        </TouchableOpacity>
      </View>
      {error ? <Text style={tw`text-red-500 text-xs`}>{error}</Text> : null}
    </View>
  );
}
