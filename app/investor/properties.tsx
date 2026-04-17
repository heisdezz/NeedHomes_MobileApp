import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import PropertyCard from "@/components/investor/property-card";
import type { Property } from "@/components/investor/property-card";
import { useProperties, type ApiProperty, type PropertiesParams } from "@/lib/queries/investor";
import PageLoader from "@/components/layout/PageLoader";
import PriceLocationModal, { type PriceLocationFilters } from "@/components/investor/price-location-modal";
import tw from "@/lib/tw";

const COLUMN_GAP = 12;
const H_PADDING = 32;

function formatKoboToNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

const STAGE_TO_STATUS: Record<string, Property["status"]> = {
  PLANNING: "Off Plan",
  FOUNDATION: "Ongoing",
  ROOFING: "Ongoing",
  FINISHED: "Completed",
};

function mapToCard(p: ApiProperty): Property {
  return {
    id: p.id,
    title: p.propertyTitle,
    location: p.location,
    propertyType: p.propertyType.charAt(0) + p.propertyType.slice(1).toLowerCase(),
    price: formatKoboToNaira(p.basePrice),
    status: STAGE_TO_STATUS[p.developmentStage],
    imageUri: p.coverImage || p.galleryImages?.[0],
  };
}

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

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        tw`px-3 py-1.5 rounded-full border mr-2`,
        active
          ? { backgroundColor: Colors.brand, borderColor: Colors.brand }
          : { backgroundColor: "#fff", borderColor: Colors.inputBorder },
      ]}
    >
      <Text style={[tw`text-xs font-semibold`, { color: active ? "#fff" : Colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function PropertiesScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - H_PADDING - COLUMN_GAP) / 2;

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [propertyType, setPropertyType] = useState<PropertiesParams["propertyType"] | null>(null);
  const [investmentModel, setInvestmentModel] = useState<PropertiesParams["investmentModel"] | null>(null);
  const [priceLocation, setPriceLocation] = useState<PriceLocationFilters>({
    minPrice: null,
    maxPrice: null,
    location: null,
  });
  const [modalVisible, setModalVisible] = useState(false);

  const hasAdvancedFilters = !!(priceLocation.minPrice || priceLocation.maxPrice || priceLocation.location);
  const hasAnyFilter = !!(propertyType || investmentModel || hasAdvancedFilters || activeSearch);

  const params: PropertiesParams = {
    ...(activeSearch && { search: activeSearch }),
    ...(propertyType && { propertyType }),
    ...(investmentModel && { investmentModel }),
    ...(priceLocation.minPrice && { minPrice: priceLocation.minPrice * 100 }),
    ...(priceLocation.maxPrice && { maxPrice: priceLocation.maxPrice * 100 }),
  };

  const query = useProperties(Object.keys(params).length ? params : undefined);

  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setActiveSearch(text.trim()), 400);
  }, []);

  const clearSearch = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setSearch("");
    setActiveSearch("");
  }, []);

  const resetAll = () => {
    clearSearch();
    setPropertyType(null);
    setInvestmentModel(null);
    setPriceLocation({ minPrice: null, maxPrice: null, location: null });
  };

  const activeTagList = [
    priceLocation.minPrice ? `Min: ₦${priceLocation.minPrice.toLocaleString()}` : null,
    priceLocation.maxPrice ? `Max: ₦${priceLocation.maxPrice.toLocaleString()}` : null,
    priceLocation.location ? `📍 ${priceLocation.location}` : null,
  ].filter(Boolean) as string[];

  return (
    <SafeAreaView style={tw`flex-1 bg-bg-light`} edges={["top"]}>
      {/* Header */}
      <View style={tw`flex-row items-center px-4 pt-3 pb-2 gap-3`}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[tw`text-lg font-bold`, { color: Colors.textPrimary }]}>Properties</Text>
      </View>

      {/* Search bar */}
      <View
        style={[
          tw`flex-row items-center mx-4 mb-3 px-3 rounded-xl gap-2`,
          { backgroundColor: Colors.inputBg, height: 44, borderWidth: 1, borderColor: Colors.inputBorder },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={handleSearchChange}
          placeholder="Search properties..."
          placeholderTextColor={Colors.textMuted}
          style={[tw`flex-1 text-sm`, { color: Colors.textPrimary }]}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            setActiveSearch(search.trim());
          }}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={clearSearch} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Property type chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`px-4 mb-2`}
      >
        {PROPERTY_TYPES.map((t) => (
          <FilterChip
            key={t.label}
            label={t.label}
            active={propertyType === t.id}
            onPress={() => setPropertyType(t.id)}
          />
        ))}
      </ScrollView>

      {/* Investment model chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`px-4 mb-3`}
      >
        {INVESTMENT_MODELS.map((m) => (
          <FilterChip
            key={m.label}
            label={m.label}
            active={investmentModel === m.id}
            onPress={() => setInvestmentModel(m.id)}
          />
        ))}
      </ScrollView>

      {/* Price/Location + Reset row */}
      <View style={tw`flex-row items-center px-4 gap-2 mb-2`}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
          style={[
            tw`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border`,
            hasAdvancedFilters
              ? { backgroundColor: Colors.brand, borderColor: Colors.brand }
              : { backgroundColor: "#fff", borderColor: Colors.inputBorder },
          ]}
        >
          <Ionicons
            name="options-outline"
            size={14}
            color={hasAdvancedFilters ? "#fff" : Colors.textSecondary}
          />
          <Text style={[tw`text-xs font-semibold`, { color: hasAdvancedFilters ? "#fff" : Colors.textSecondary }]}>
            Price & Location
          </Text>
        </TouchableOpacity>

        {hasAnyFilter && (
          <TouchableOpacity
            onPress={resetAll}
            activeOpacity={0.7}
            style={[tw`flex-row items-center gap-1 px-3 py-1.5 rounded-full`, { backgroundColor: "#FEE2E2" }]}
          >
            <Ionicons name="close" size={12} color="#DC2626" />
            <Text style={[tw`text-xs font-semibold`, { color: "#DC2626" }]}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Active filter tags */}
      {activeTagList.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`px-4 mb-2`}
        >
          {activeTagList.map((tag) => (
            <View
              key={tag}
              style={[
                tw`px-3 py-1 rounded-full mr-2`,
                { backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#FDBA74" },
              ]}
            >
              <Text style={[tw`text-xs font-medium`, { color: Colors.brand }]}>{tag}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Content */}
      <PageLoader query={query} loadingText="Loading properties...">
        {(data) => {
          const properties = (data.data?.data ?? []).map(mapToCard);
          return (
            <FlatList
              data={properties}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ gap: COLUMN_GAP, paddingHorizontal: 16 }}
              contentContainerStyle={{ gap: COLUMN_GAP, paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <PropertyCard {...item} cardWidth={cardWidth} />}
              ListEmptyComponent={
                <View style={tw`items-center justify-center mt-24 gap-2`}>
                  <Ionicons name="home-outline" size={48} color={Colors.textMuted} />
                  <Text style={[tw`text-sm`, { color: Colors.textMuted }]}>
                    {activeSearch ? `No results for "${activeSearch}"` : "No properties available"}
                  </Text>
                </View>
              }
            />
          );
        }}
      </PageLoader>

      <PriceLocationModal
        visible={modalVisible}
        initial={priceLocation}
        onApply={setPriceLocation}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}
