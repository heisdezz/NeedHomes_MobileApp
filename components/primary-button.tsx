import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import tw from '@/lib/tw';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function PrimaryButton({ label, onPress, loading, disabled }: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={tw`bg-brand rounded-xl py-4 px-6 items-center justify-center ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={tw`text-text-inverse text-base font-semibold`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
