import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import PropertyCard from "./property-card";
import type { Property } from "./property-card";
import {
  useProperties,
  type ApiProperty,
  type PropertiesParams,
} from "@/lib/queries/investor";
import tw from "@/lib/tw";

// ─── Filter config ────────────────────────────────────────────────────────────

type FilterTab = {
  label: string;
  params: Partial<PropertiesParams>;
};

const FILTER_TABS: FilterTab[] = [
  { label: "All", params: {} },
  { label: "Outright Purchase", params: { investmentModel: "OUTRIGHT_PURCHASE" } },
  { label: "Co-Development", params: { investmentModel: "CO_DEVELOPMENT" } },
  { label: "Fractional", params: { investmentModel: "FRACTIONAL_OWNERSHIP" } },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatKoboToNaira(kobo: number): string {
  const naira = kobo / 100;
  return `₦${naira.toLocaleString("en-NG")}`;
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvestorPropertyListings() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeFilter = FILTER_TABS[activeIndex];
  const { data, isLoading, isError } = useProperties({
    ...activeFilter.params,
    limit: 10,
  });

  const properties: Property[] = (data?.data?.data ?? []).map(mapToCard);

  return (
    <View>
      {/* Section header */}
      <View style={tw`flex-row items-center justify-between px-4 mb-3`}>
        <TouchableOpacity style={tw`flex-row items-center gap-1`} activeOpacity={0.7}>
          <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>Properties</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/investor/properties")}
          activeOpacity={0.7}
        >
          <Text style={[tw`text-sm font-semibold`, { color: Colors.brand }]}>
            See All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`px-4 gap-2 mb-4`}
      >
        {FILTER_TABS.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <TouchableOpacity
              key={tab.label}
              onPress={() => setActiveIndex(index)}
              activeOpacity={0.7}
              style={[
                tw`px-4 py-1.5 rounded-full`,
                {
                  backgroundColor: isActive ? Colors.brand : Colors.inputBg,
                  borderWidth: isActive ? 0 : 1,
                  borderColor: Colors.inputBorder,
                },
              ]}
            >
              <Text
                style={[
                  tw`text-xs font-semibold`,
                  { color: isActive ? "#fff" : Colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Cards */}
      {isLoading ? (
        <View style={tw`items-center py-6`}>
          <ActivityIndicator color={Colors.brand} />
        </View>
      ) : isError ? (
        <View style={tw`items-center py-6`}>
          <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>
            Could not load properties
          </Text>
        </View>
      ) : properties.length === 0 ? (
        <View style={tw`items-center py-6`}>
          <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>
            No properties available
          </Text>
        </View>
      ) : (
        <FlatList
          horizontal
          data={properties}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`px-4 gap-3`}
          renderItem={({ item }) => <PropertyCard {...item} />}
        />
      )}
    </View>
  );
}
