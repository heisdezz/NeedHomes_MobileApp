import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import PropertyCard from "@/components/investor/property-card";
import type { Property } from "@/components/investor/property-card";
import { useProperties, type ApiProperty } from "@/lib/queries/investor";
import PageLoader from "@/components/layout/PageLoader";
import tw from "@/lib/tw";

const COLUMN_GAP = 12;
const H_PADDING = 32; // 16px each side

function formatKoboToNaira(kobo: number): string {
  const naira = kobo / 100;
  return `₦${naira.toLocaleString("en-NG")}`;
}

const STAGE_TO_STATUS: Record<string, Property["status"]> = {
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  PLANNING: "Off Plan",
};

function mapToCard(p: ApiProperty): Property {
  return {
    id: p.id,
    title: p.title,
    location: p.location ?? p.address ?? "",
    propertyType:
      p.propertyType.charAt(0) + p.propertyType.slice(1).toLowerCase(),
    price: formatKoboToNaira(p.basePrice),
    status: STAGE_TO_STATUS[p.developmentStage],
    imageUri: p.images?.[0],
  };
}

export default function PropertiesScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - H_PADDING - COLUMN_GAP) / 2;

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useProperties(activeSearch ? { search: activeSearch } : undefined);

  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setActiveSearch(text.trim());
    }, 400);
  }, []);

  const clearSearch = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setSearch("");
    setActiveSearch("");
  }, []);

  return (
    <SafeAreaView style={tw`flex-1 bg-bg`} edges={["top"]}>
      {/* Header */}
      <View style={tw`flex-row items-center px-4 pt-3 pb-2 gap-3`}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={tw`text-white text-lg font-bold`}>Properties</Text>
      </View>

      {/* "All Properties" title row */}
      <View style={tw`flex-row items-center justify-between px-4 mb-3`}>
        <Text style={[tw`text-base font-semibold`, { color: Colors.textInverse }]}>
          All Properties
        </Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="options-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View
        style={[
          tw`flex-row items-center mx-4 mb-4 px-3 rounded-xl gap-2`,
          { backgroundColor: Colors.surface, height: 44 },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={handleSearchChange}
          placeholder="Search"
          placeholderTextColor={Colors.textMuted}
          style={[tw`flex-1 text-sm`, { color: Colors.textInverse }]}
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
              contentContainerStyle={{ gap: COLUMN_GAP, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <PropertyCard {...item} cardWidth={cardWidth} />
              )}
              ListEmptyComponent={
                <View style={tw`items-center justify-center mt-24 gap-2`}>
                  <Ionicons name="home-outline" size={48} color={Colors.textMuted} />
                  <Text style={[tw`text-sm`, { color: Colors.textMuted }]}>
                    {activeSearch
                      ? `No results for "${activeSearch}"`
                      : "No properties available"}
                  </Text>
                </View>
              }
            />
          );
        }}
      </PageLoader>
    </SafeAreaView>
  );
}
