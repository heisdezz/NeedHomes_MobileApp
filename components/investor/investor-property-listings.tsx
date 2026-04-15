import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import PropertyCard, { Property } from "./property-card";
import tw from "@/lib/tw";

const FILTER_TABS = ["Outright Purchase", "Installment", "Joint Venture"];

const SAMPLE_PROPERTIES: Property[] = [
  {
    id: "1",
    title: "3 Bedroom Block of Flats",
    location: "Ikeja, Lagos",
    propertyType: "Commercial",
    price: "₦100,000,000",
    status: "Ongoing",
  },
  {
    id: "2",
    title: "3 Bedroom Block of Flats",
    location: "Ikeja, Lagos",
    propertyType: "Commercial",
    price: "₦100,000,000",
    status: "Brand New",
  },
  {
    id: "3",
    title: "4 Bedroom Detached Duplex",
    location: "Lekki, Lagos",
    propertyType: "Residential",
    price: "₦250,000,000",
    status: "Off Plan",
  },
];

type Props = {
  properties?: Property[];
  onSeeAll?: () => void;
};

export default function InvestorPropertyListings({
  properties = SAMPLE_PROPERTIES,
  onSeeAll,
}: Props) {
  const [activeFilter, setActiveFilter] = useState(FILTER_TABS[0]);

  return (
    <View>
      {/* Section header */}
      <View style={tw`flex-row items-center justify-between px-4 mb-3`}>
        <TouchableOpacity style={tw`flex-row items-center gap-1`} activeOpacity={0.7}>
          <Text style={tw`text-white text-base font-bold`}>Properties</Text>
          <Ionicons name="chevron-down" size={16} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
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
        {FILTER_TABS.map((tab) => {
          const isActive = tab === activeFilter;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.7}
              style={[
                tw`px-4 py-1.5 rounded-full`,
                {
                  backgroundColor: isActive ? Colors.brand : "rgba(255,255,255,0.1)",
                  borderWidth: isActive ? 0 : 1,
                  borderColor: "rgba(255,255,255,0.2)",
                },
              ]}
            >
              <Text
                style={[
                  tw`text-xs font-semibold`,
                  { color: isActive ? "#fff" : "rgba(255,255,255,0.6)" },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Property cards */}
      <FlatList
        horizontal
        data={properties}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`px-4 gap-3`}
        renderItem={({ item }) => <PropertyCard {...item} />}
      />
    </View>
  );
}
