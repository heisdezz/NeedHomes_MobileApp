import { useState, useCallback, useMemo, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";
import type { PropertiesParams } from "@/lib/queries/investor";

export type PropertyFilters = {
  propertyType: PropertiesParams["propertyType"] | null;
  investmentModel: PropertiesParams["investmentModel"] | null;
  minPrice: number | null;
  maxPrice: number | null;
  location: string | null;
};

export type PriceLocationFilters = PropertyFilters;

type Props = {
  visible: boolean;
  initial: PropertyFilters;
  onApply: (filters: PropertyFilters) => void;
  onClose: () => void;
};

const PROPERTY_TYPES: { id: PropertiesParams["propertyType"] | null; label: string }[] = [
  { id: null, label: "All" },
  { id: "RESIDENTIAL", label: "Residential" },
  { id: "COMMERCIAL", label: "Commercial" },
  { id: "LAND", label: "Land" },
];

const INVESTMENT_MODELS: { id: PropertiesParams["investmentModel"] | null; label: string }[] = [
  { id: null, label: "All Models" },
  { id: "OUTRIGHT_PURCHASE", label: "Outright Purchase" },
  { id: "CO_DEVELOPMENT", label: "Co-Development" },
  { id: "FRACTIONAL_OWNERSHIP", label: "Fractional Ownership" },
  { id: "LAND_BANKING", label: "Land Banking" },
  { id: "SAVE_TO_OWN", label: "Save to Own" },
];

function FilterOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        tw`px-4 py-2.5 rounded-xl mr-2 mb-2 border`,
        selected
          ? { backgroundColor: Colors.brand, borderColor: Colors.brand }
          : { backgroundColor: "#fff", borderColor: Colors.inputBorder },
      ]}
    >
      <Text
        style={[
          tw`text-sm font-semibold`,
          { color: selected ? "#fff" : Colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function PriceLocationModal({ visible, initial, onApply, onClose }: Props) {
  const [propertyType, setPropertyType] = useState<PropertiesParams["propertyType"] | null>(
    initial.propertyType ?? null,
  );
  const [investmentModel, setInvestmentModel] = useState<
    PropertiesParams["investmentModel"] | null
  >(initial.investmentModel ?? null);
  const [minPrice, setMinPrice] = useState(initial.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice?.toString() ?? "");
  const [location, setLocation] = useState(initial.location ?? "");

  const snapPoints = useMemo(() => ["65%", "90%"], []);

  useEffect(() => {
    setPropertyType(initial.propertyType ?? null);
    setInvestmentModel(initial.investmentModel ?? null);
    setMinPrice(initial.minPrice?.toString() ?? "");
    setMaxPrice(initial.maxPrice?.toString() ?? "");
    setLocation(initial.location ?? "");
  }, [initial]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose],
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  function handleApply() {
    onApply({
      propertyType,
      investmentModel,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      location: location.trim() || null,
    });
    onClose();
  }

  function handleClear() {
    setPropertyType(null);
    setInvestmentModel(null);
    setMinPrice("");
    setMaxPrice("");
    setLocation("");
  }

  // Only mount when visible — prevents the GestureDetector overlay
  // from intercepting touches on the underlying screen when closed
  if (!visible) return null;

  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      animateOnMount
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: Colors.divider }}
      backgroundStyle={{ backgroundColor: "#fff" }}
    >
      <BottomSheetScrollView style={tw`px-5`} contentContainerStyle={tw`pb-10`}>
        <View style={tw`flex-row items-center justify-between mb-5`}>
          <Text style={[tw`text-lg font-bold`, { color: Colors.textPrimary }]}>
            Filter Properties
          </Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Property Type */}
        <View style={tw`mb-5`}>
          <Text style={[tw`text-sm font-bold mb-2`, { color: Colors.textPrimary }]}>
            Property Type
          </Text>
          <View style={tw`flex-row flex-wrap`}>
            {PROPERTY_TYPES.map((type) => (
              <FilterOption
                key={type.label}
                label={type.label}
                selected={propertyType === type.id}
                onPress={() => setPropertyType(type.id)}
              />
            ))}
          </View>
        </View>

        {/* Investment Model */}
        <View style={tw`mb-5`}>
          <Text style={[tw`text-sm font-bold mb-2`, { color: Colors.textPrimary }]}>
            Investment Model
          </Text>
          <View style={tw`flex-row flex-wrap`}>
            {INVESTMENT_MODELS.map((model) => (
              <FilterOption
                key={model.label}
                label={model.label}
                selected={investmentModel === model.id}
                onPress={() => setInvestmentModel(model.id)}
              />
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={tw`mb-4 gap-1.5`}>
          <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>
            Location
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Lekki, Abuja, Victoria Island"
            placeholderTextColor={Colors.inputPlaceholder}
            style={[
              tw`border rounded-xl px-4 py-3 text-sm`,
              {
                borderColor: Colors.inputBorder,
                backgroundColor: Colors.inputBg,
                color: Colors.textPrimary,
              },
            ]}
          />
        </View>

        {/* Price Range */}
        <View style={tw`mb-6`}>
          <Text style={[tw`text-sm font-bold mb-2`, { color: Colors.textPrimary }]}>
            Price Range
          </Text>
          <View style={tw`flex-row gap-3`}>
            <View style={tw`flex-1 gap-1.5`}>
              <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>
                Min Price (₦)
              </Text>
              <TextInput
                value={minPrice}
                onChangeText={setMinPrice}
                placeholder="Min price"
                keyboardType="numeric"
                placeholderTextColor={Colors.inputPlaceholder}
                style={[
                  tw`border rounded-xl px-4 py-3 text-sm`,
                  {
                    borderColor: Colors.inputBorder,
                    backgroundColor: Colors.inputBg,
                    color: Colors.textPrimary,
                  },
                ]}
              />
            </View>
            <View style={tw`flex-1 gap-1.5`}>
              <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>
                Max Price (₦)
              </Text>
              <TextInput
                value={maxPrice}
                onChangeText={setMaxPrice}
                placeholder="Max price"
                keyboardType="numeric"
                placeholderTextColor={Colors.inputPlaceholder}
                style={[
                  tw`border rounded-xl px-4 py-3 text-sm`,
                  {
                    borderColor: Colors.inputBorder,
                    backgroundColor: Colors.inputBg,
                    color: Colors.textPrimary,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={tw`flex-row gap-3 mt-2`}>
          <TouchableOpacity
            onPress={handleClear}
            activeOpacity={0.7}
            style={[
              tw`flex-1 py-3.5 rounded-xl items-center border`,
              { borderColor: Colors.divider },
            ]}
          >
            <Text style={[tw`text-sm font-semibold`, { color: Colors.textSecondary }]}>
              Clear
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleApply}
            activeOpacity={0.8}
            style={[tw`flex-1 py-3.5 rounded-xl items-center`, { backgroundColor: Colors.brand }]}
          >
            <Text style={tw`text-white text-sm font-bold`}>Apply</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
