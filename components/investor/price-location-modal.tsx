import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";

export type PriceLocationFilters = {
  minPrice: number | null;
  maxPrice: number | null;
  location: string | null;
};

type Props = {
  visible: boolean;
  initial: PriceLocationFilters;
  onApply: (filters: PriceLocationFilters) => void;
  onClose: () => void;
};

export default function PriceLocationModal({ visible, initial, onApply, onClose }: Props) {
  const [minPrice, setMinPrice] = useState(initial.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice?.toString() ?? "");
  const [location, setLocation] = useState(initial.location ?? "");

  function handleApply() {
    onApply({
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      location: location.trim() || null,
    });
    onClose();
  }

  function handleClear() {
    setMinPrice("");
    setMaxPrice("");
    setLocation("");
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity
          style={[tw`flex-1`, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[tw`rounded-t-3xl px-5 pt-5 pb-10`, { backgroundColor: "#fff" }]}>
          <View style={[tw`w-10 h-1 rounded-full self-center mb-5`, { backgroundColor: Colors.divider }]} />

          <View style={tw`flex-row items-center justify-between mb-5`}>
            <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>
              Price & Location
            </Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={tw`gap-4`}>
            <View style={tw`gap-1.5`}>
              <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>Location</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Lekki, Abuja, Victoria Island"
                placeholderTextColor={Colors.inputPlaceholder}
                style={[
                  tw`border rounded-xl px-4 py-3 text-sm`,
                  { borderColor: Colors.inputBorder, backgroundColor: Colors.inputBg, color: Colors.textPrimary },
                ]}
              />
            </View>

            <View style={tw`flex-row gap-3`}>
              <View style={tw`flex-1 gap-1.5`}>
                <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>Min Price (₦)</Text>
                <TextInput
                  value={minPrice}
                  onChangeText={setMinPrice}
                  placeholder="e.g. 5000000"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.inputPlaceholder}
                  style={[
                    tw`border rounded-xl px-4 py-3 text-sm`,
                    { borderColor: Colors.inputBorder, backgroundColor: Colors.inputBg, color: Colors.textPrimary },
                  ]}
                />
              </View>
              <View style={tw`flex-1 gap-1.5`}>
                <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>Max Price (₦)</Text>
                <TextInput
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholder="e.g. 100000000"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.inputPlaceholder}
                  style={[
                    tw`border rounded-xl px-4 py-3 text-sm`,
                    { borderColor: Colors.inputBorder, backgroundColor: Colors.inputBg, color: Colors.textPrimary },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={tw`flex-row gap-3 mt-6`}>
            <TouchableOpacity
              onPress={handleClear}
              activeOpacity={0.7}
              style={[tw`flex-1 py-3.5 rounded-xl items-center border`, { borderColor: Colors.divider }]}
            >
              <Text style={[tw`text-sm font-semibold`, { color: Colors.textSecondary }]}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              activeOpacity={0.8}
              style={[tw`flex-1 py-3.5 rounded-xl items-center`, { backgroundColor: Colors.brand }]}
            >
              <Text style={tw`text-white text-sm font-bold`}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
