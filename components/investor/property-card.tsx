import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";

export type Property = {
  id: string;
  title: string;
  location: string;
  propertyType: string;
  price: string;
  status?: "Ongoing" | "Brand New" | "Completed" | "Off Plan";
  imageUri?: string;
  isBookmarked?: boolean;
  cardWidth?: number;
  onBookmark?: () => void;
  onPress?: () => void;
};

const STATUS_COLORS: Record<string, string> = {
  Ongoing: "#22C55E",
  "Brand New": Colors.brand,
  Completed: "#3B82F6",
  "Off Plan": "#8B5CF6",
};

export default function PropertyCard({
  title,
  location,
  propertyType,
  price,
  status,
  imageUri,
  isBookmarked,
  cardWidth = 180,
  onBookmark,
  onPress,
}: Property) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        tw`rounded-2xl overflow-hidden`,
        { backgroundColor: "#fff", width: cardWidth },
      ]}
    >
      {/* Image */}
      <View style={[tw`w-full relative`, { height: 120 }]}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={tw`w-full h-full`}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[tw`w-full h-full items-center justify-center`, { backgroundColor: "#D1D5DB" }]}
          >
            <Ionicons name="home" size={36} color="#9CA3AF" />
          </View>
        )}

        {/* Status badge */}
        {status && (
          <View
            style={[
              tw`absolute top-2 left-2 px-2 py-0.5 rounded-md`,
              { backgroundColor: STATUS_COLORS[status] ?? Colors.brand },
            ]}
          >
            <Text style={tw`text-white text-xs font-semibold`}>{status}</Text>
          </View>
        )}

        {/* Bookmark */}
        <TouchableOpacity
          onPress={onBookmark}
          activeOpacity={0.7}
          style={[
            tw`absolute bottom-2 right-2 w-7 h-7 rounded-full items-center justify-center`,
            { backgroundColor: "rgba(0,0,0,0.45)" },
          ]}
        >
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={14}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={tw`px-3 pt-2 pb-3`}>
        <Text
          style={[tw`text-sm font-bold mb-1`, { color: Colors.textPrimary }]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {/* Location */}
        <View style={tw`flex-row items-center gap-1 mb-2`}>
          <Ionicons name="location-outline" size={11} color={Colors.brand} />
          <Text
            style={[tw`text-xs`, { color: Colors.textSecondary }]}
            numberOfLines={1}
          >
            {location}
          </Text>
        </View>

        {/* Property type */}
        <Text style={[tw`text-xs uppercase mb-0.5`, { color: Colors.textMuted, letterSpacing: 0.5 }]}>
          Property Type
        </Text>
        <View style={tw`flex-row items-center gap-1 mb-3`}>
          <Ionicons name="business-outline" size={11} color={Colors.brand} />
          <Text style={[tw`text-xs font-medium`, { color: Colors.textSecondary }]}>
            {propertyType}
          </Text>
        </View>

        {/* Price */}
        <View
          style={[
            tw`self-stretch items-center py-1.5 rounded-full`,
            { backgroundColor: Colors.brand },
          ]}
        >
          <Text style={tw`text-white text-xs font-bold`}>{price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
