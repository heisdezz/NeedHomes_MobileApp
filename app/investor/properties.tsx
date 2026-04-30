import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import PropertyCard from "@/components/investor/property-card";
import type { Property } from "@/components/investor/property-card";
import {
  useProperties,
  type ApiProperty,
  type PropertiesParams,
} from "@/lib/queries/investor";
import PageLoader from "@/components/layout/PageLoader";
import PriceLocationModal, {
  type PropertyFilters,
} from "@/components/investor/price-location-modal";
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
    propertyType:
      p.propertyType.charAt(0) + p.propertyType.slice(1).toLowerCase(),
    price: formatKoboToNaira(p.basePrice),
    status: STAGE_TO_STATUS[p.developmentStage],
    imageUri: p.coverImage || p.galleryImages?.[0],
  };
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  RESIDENTIAL: "Residential",
  COMMERCIAL: "Commercial",
  LAND: "Land",
};

const INVESTMENT_MODEL_LABELS: Record<string, string> = {
  OUTRIGHT_PURCHASE: "Outright Purchase",
  CO_DEVELOPMENT: "Co-Development",
  FRACTIONAL_OWNERSHIP: "Fractional Ownership",
  LAND_BANKING: "Land Banking",
  SAVE_TO_OWN: "Save to Own",
};

export default function PropertiesScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - H_PADDING - COLUMN_GAP) / 2;

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [filters, setFilters] = useState<PropertyFilters>({
    propertyType: null,
    investmentModel: null,
    minPrice: null,
    maxPrice: null,
    location: null,
  });
  const [modalVisible, setModalVisible] = useState(false);

  const hasActiveFilters = !!(
    filters.propertyType ||
    filters.investmentModel ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.location
  );
  const hasAnyFilter = hasActiveFilters || activeSearch;

  const params: PropertiesParams = {
    ...(activeSearch && { search: activeSearch }),
    ...(filters.propertyType && { propertyType: filters.propertyType }),
    ...(filters.investmentModel && {
      investmentModel: filters.investmentModel,
    }),
    ...(filters.minPrice && { minPrice: filters.minPrice * 100 }),
    ...(filters.maxPrice && { maxPrice: filters.maxPrice * 100 }),
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
    setFilters({
      propertyType: null,
      investmentModel: null,
      minPrice: null,
      maxPrice: null,
      location: null,
    });
  };

  const activeTagList = [
    filters.propertyType ? PROPERTY_TYPE_LABELS[filters.propertyType] : null,
    filters.investmentModel
      ? INVESTMENT_MODEL_LABELS[filters.investmentModel]
      : null,
    filters.minPrice ? `Min: ₦${filters.minPrice.toLocaleString()}` : null,
    filters.maxPrice ? `Max: ₦${filters.maxPrice.toLocaleString()}` : null,
    filters.location ? `📍 ${filters.location}` : null,
  ].filter(Boolean) as string[];

  return (
    <SafeAreaView style={tw`flex-1 bg-bg-light`} edges={["top"]}>
      {/* Header */}
      <View style={tw`flex-row items-center px-4 pt-3 pb-2 gap-3`}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[tw`text-lg font-bold`, { color: Colors.textPrimary }]}>
          Properties
        </Text>
      </View>

      {/* Search bar */}
      <View
        style={[
          tw`flex-row items-center mx-4 mb-3 px-3 rounded-xl gap-2`,
          {
            backgroundColor: Colors.inputBg,
            height: 44,
            borderWidth: 1,
            borderColor: Colors.inputBorder,
          },
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

      {/* Filters + Reset row */}
      <View style={tw`flex-row items-center px-4 gap-2 mb-2`}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
          style={[
            tw`flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl border`,
            hasActiveFilters
              ? { backgroundColor: Colors.brand, borderColor: Colors.brand }
              : { backgroundColor: "#fff", borderColor: Colors.inputBorder },
          ]}
        >
          <Ionicons
            name="options-outline"
            size={16}
            color={hasActiveFilters ? "#fff" : Colors.textSecondary}
          />
          <Text
            style={[
              tw`text-sm font-semibold`,
              { color: hasActiveFilters ? "#fff" : Colors.textSecondary },
            ]}
          >
            {hasActiveFilters
              ? `Filters (${activeTagList.length})`
              : "All Filters"}
          </Text>
        </TouchableOpacity>

        {hasAnyFilter && (
          <TouchableOpacity
            onPress={resetAll}
            activeOpacity={0.7}
            style={[
              tw`flex-row items-center gap-1 px-4 py-2.5 rounded-xl`,
              { backgroundColor: "#FEE2E2" },
            ]}
          >
            <Ionicons name="close" size={14} color="#DC2626" />
            <Text style={[tw`text-sm font-semibold`, { color: "#DC2626" }]}>
              Reset All
            </Text>
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
                {
                  backgroundColor: "#FFF7ED",
                  borderWidth: 1,
                  borderColor: "#FDBA74",
                },
              ]}
            >
              <Text style={[tw`text-xs font-medium`, { color: Colors.brand }]}>
                {tag}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Content */}
      <View style={tw`flex-1`}>
        <PageLoader query={query} loadingText="Loading properties...">
          {(data) => {
            const properties = (data.data?.data ?? []).map(mapToCard);
            return (
              <>
                <FlashList
                  data={properties}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  style={tw`flex-1`}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: 80,
                  }}
                  renderItem={({ item }) => (
                    <View
                      style={{ width: cardWidth, marginBottom: COLUMN_GAP }}
                    >
                      <PropertyCard {...item} cardWidth={cardWidth} />
                    </View>
                  )}
                  ListEmptyComponent={
                    <View style={tw`items-center justify-center mt-24 gap-2`}>
                      <Ionicons
                        name="home-outline"
                        size={48}
                        color={Colors.textMuted}
                      />
                      <Text style={[tw`text-sm`, { color: Colors.textMuted }]}>
                        {activeSearch
                          ? `No results for "${activeSearch}"`
                          : "No properties available"}
                      </Text>
                    </View>
                  }
                />
              </>
            );
          }}
        </PageLoader>
      </View>

      <PriceLocationModal
        visible={modalVisible}
        initial={filters}
        onApply={setFilters}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}
