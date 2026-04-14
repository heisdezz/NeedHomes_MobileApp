import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from '@/lib/tw';

type Option = { label: string; value: string };

type Props = {
  label: string;
  placeholder?: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
};

export default function SelectInput({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={tw`gap-1.5`}>
      <Text style={tw`text-[#1A1A1A] text-sm font-medium`}>{label}</Text>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={tw`flex-row items-center bg-white border rounded-xl px-4 py-3.5 ${
          error ? 'border-red-400' : 'border-[#E0E0E0]'
        }`}
      >
        <Text style={tw`flex-1 text-sm ${selected ? 'text-[#1A1A1A]' : 'text-[#A0A0A0]'}`}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#A0A0A0" />
      </TouchableOpacity>
      {error ? <Text style={tw`text-red-500 text-xs`}>{error}</Text> : null}

      <Modal visible={open} animationType="slide" transparent>
        <TouchableOpacity
          style={tw`flex-1 bg-black/40`}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />
        <SafeAreaView style={tw`bg-white rounded-t-3xl`}>
          <View style={tw`px-4 py-3 border-b border-[#F0F0F0]`}>
            <Text style={tw`text-base font-semibold text-[#1A1A1A] text-center`}>{label}</Text>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            style={tw`max-h-72`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                style={tw`px-6 py-4 border-b border-[#F5F5F5] flex-row items-center justify-between`}
              >
                <Text style={tw`text-sm text-[#1A1A1A]`}>{item.label}</Text>
                {item.value === value && (
                  <Ionicons name="checkmark" size={18} color="#F56821" />
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
