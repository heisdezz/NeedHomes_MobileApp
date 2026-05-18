import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProperty } from "@/lib/queries/investor";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";

const MODEL_LABEL: Record<string, string> = {
  CO_DEVELOPMENT: "Co-Development",
  OUTRIGHT_PURCHASE: "Outright Purchase",
  FRACTIONAL_OWNERSHIP: "Fractional Ownership",
  LAND_BANKING: "Land Banking",
  SAVE_TO_OWN: "Save to Own",
};

const STAGE_LABEL: Record<string, string> = {
  PLANNING: "Planning",
  FOUNDATION: "Ongoing",
  ROOFING: "Ongoing",
  FINISHED: "Completed",
};

function fmt(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString()}`;
}

interface Props {
  propertyId: string;
}

export default function InvPropDetails({ propertyId }: Props) {
  const query = useProperty(propertyId);

  if (query.isLoading) {
    return (
      <View
        style={[
          tw`rounded-2xl p-5 items-center justify-center`,
          { borderWidth: 1, borderColor: Colors.divider, minHeight: 80 },
        ]}
      >
        <ActivityIndicator size="small" color={Colors.brand} />
      </View>
    );
  }

  if (query.isError || !query.data?.data) return null;

  const property = query.data.data;
  const coverImage = property.coverImage || property.galleryImages?.[0];
  const stageLabel =
    STAGE_LABEL[property.developmentStage] ?? property.developmentStage;
  const modelLabel =
    MODEL_LABEL[property.investmentModel] ?? property.investmentModel;

  return (
    <View
      style={[
        tw`bg-white rounded-2xl overflow-hidden`,
        { borderWidth: 1, borderColor: Colors.divider },
      ]}
    >
      {/* Section header */}
      <View
        style={[
          tw`flex-row items-center justify-between px-4 py-3 border-b`,
          {
            backgroundColor: Colors.inputBg,
            borderBottomColor: Colors.divider,
          },
        ]}
      >
        <View style={tw`flex-row items-center gap-2`}>
          <Ionicons name="home-outline" size={16} color={Colors.textPrimary} />
          <Text style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}>
            Property
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push(`/investor/properties/${propertyId}`)}
          activeOpacity={0.7}
          style={tw`flex-row items-center gap-1`}
        >
          <Text style={[tw`text-xs font-semibold`, { color: Colors.brand }]}>
            View
          </Text>
          <Ionicons name="arrow-forward" size={12} color={Colors.brand} />
        </TouchableOpacity>
      </View>

      {/* Cover image */}
      {coverImage ? (
        <Image
          source={{ uri: coverImage }}
          style={{ width: "100%", height: 140 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            tw`w-full items-center justify-center`,
            { height: 140, backgroundColor: Colors.inputBg },
          ]}
        >
          <Ionicons name="image-outline" size={40} color={Colors.textMuted} />
        </View>
      )}

      {/* Details */}
      <View style={tw`p-4 gap-3`}>
        {/* Title + price */}
        <View style={tw`flex-row items-start justify-between gap-3`}>
          <Text
            style={[
              tw`text-base font-bold flex-1`,
              { color: Colors.textPrimary },
            ]}
            numberOfLines={2}
          >
            {property.propertyTitle}
          </Text>
          <Text style={[tw`text-base font-bold`, { color: Colors.brand }]}>
            {fmt(property.basePrice)}
          </Text>
        </View>

        {/* Location */}
        <View style={tw`flex-row items-center gap-1`}>
          <Ionicons name="location-outline" size={13} color={Colors.brand} />
          <Text
            style={[tw`text-sm flex-1`, { color: Colors.textSecondary }]}
            numberOfLines={1}
          >
            {property.location}
          </Text>
        </View>

        {/* Badges */}
        <View style={tw`flex-row gap-2 flex-wrap`}>
          <View
            style={[
              tw`px-3 py-1 rounded-full`,
              { backgroundColor: Colors.brand + "15" },
            ]}
          >
            <Text style={[tw`text-xs font-semibold`, { color: Colors.brand }]}>
              {modelLabel}
            </Text>
          </View>
          <View
            style={[
              tw`px-3 py-1 rounded-full`,
              {
                backgroundColor: Colors.inputBg,
                borderWidth: 1,
                borderColor: Colors.divider,
              },
            ]}
          >
            <Text
              style={[tw`text-xs font-medium`, { color: Colors.textSecondary }]}
            >
              {stageLabel}
            </Text>
          </View>
          <View
            style={[
              tw`px-3 py-1 rounded-full`,
              {
                backgroundColor: Colors.inputBg,
                borderWidth: 1,
                borderColor: Colors.divider,
              },
            ]}
          >
            <Text
              style={[tw`text-xs font-medium`, { color: Colors.textSecondary }]}
            >
              {property.propertyType.charAt(0) +
                property.propertyType.slice(1).toLowerCase()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
