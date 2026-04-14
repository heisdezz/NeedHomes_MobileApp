import { View, Text, TextInput, TextInputProps } from 'react-native';
import tw from '@/lib/tw';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export default function FormInput({ label, error, ...props }: Props) {
  return (
    <View style={tw`gap-1.5`}>
      <Text style={tw`text-[#1A1A1A] text-sm font-medium`}>{label}</Text>
      <TextInput
        style={tw`bg-white border rounded-xl px-4 py-3.5 text-sm text-[#1A1A1A] ${
          error ? 'border-red-400' : 'border-[#E0E0E0]'
        }`}
        placeholderTextColor="#A0A0A0"
        {...props}
      />
      {error ? <Text style={tw`text-red-500 text-xs`}>{error}</Text> : null}
    </View>
  );
}
