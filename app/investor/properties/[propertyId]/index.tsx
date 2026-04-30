import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useLocalSearchParams,
  router,
  useNavigationContainerRef,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useProperty } from "@/lib/queries/investor";
import PageLoader from "@/components/layout/PageLoader";
import InvestmentDetails from "@/components/investor/investment-details";
import AdditionalFees from "@/components/investor/additional-fees";
import ImageCarousel from "@/components/investor/image-carousel";
import { RenderDocuments } from "@/components/RenderDocuments";
import tw from "@/lib/tw";

function fmt(kobo: number | null | undefined): string {
  if (kobo == null) return "N/A";
  return `₦${(kobo / 100).toLocaleString()}`;
}

export default function PropertyDetailScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const query = useProperty(propertyId);

  function handleBack() {
    // Navigate to the properties list if there's no proper back stack
    // (e.g. when opened directly from the home screen's property listings)
    const canGoBack = router.canGoBack();
    if (canGoBack) {
      router.back();
    } else {
      router.replace("/investor/properties");
    }
  }

  return (
    <SafeAreaView
      style={[tw`flex-1 relative`, { backgroundColor: "#fff" }]}
      edges={["top", "bottom"]}
    >
      <PageLoader query={query} loadingText="Loading property...">
        {(response) => {
          const property = response.data;
          const allImages = [
            ...(property.coverImage ? [property.coverImage] : []),
            ...(property.galleryImages ?? []),
          ];
          const fees = property.additionalFees ?? [];

          return (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tw`pb-28`}
              >
                {/* Hero carousel */}
                <ImageCarousel
                  images={allImages}
                  height={260}
                  onBack={handleBack}
                  onBookmark={() => {}}
                />

                {/* Content */}
                <View style={tw`px-4 pt-4`}>
                  {/* Title + Price */}
                  <View
                    style={tw`flex-row items-start justify-between gap-3 mb-2`}
                  >
                    <Text
                      style={[
                        tw`text-lg font-bold flex-1`,
                        { color: Colors.textPrimary },
                      ]}
                    >
                      {property.propertyTitle}
                    </Text>
                    <Text
                      style={[tw`text-base font-bold`, { color: Colors.brand }]}
                    >
                      {fmt(property.basePrice)}
                    </Text>
                  </View>

                  {/* Location */}
                  <View style={tw`flex-row items-center gap-1 mb-4`}>
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color={Colors.brand}
                    />
                    <Text
                      style={[tw`text-sm`, { color: Colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {property.location}
                    </Text>
                  </View>

                  {/* Description */}
                  <View style={tw`mb-5`}>
                    <Text
                      style={[
                        tw`text-sm font-bold mb-2`,
                        { color: Colors.textPrimary },
                      ]}
                    >
                      Description
                    </Text>
                    <Text
                      style={[
                        tw`text-sm leading-5`,
                        { color: Colors.textSecondary },
                      ]}
                    >
                      {property.description || "No description available."}
                    </Text>
                  </View>

                  {/* Investment Details */}
                  <View style={tw`mb-5`}>
                    <InvestmentDetails
                      type={property.investmentModel}
                      property={property}
                    />
                  </View>

                  {/* Management Fees */}
                  {fees.length > 0 && (
                    <View style={tw`mb-5`}>
                      <AdditionalFees fees={fees} />
                    </View>
                  )}

                  {/* Documents */}
                  <View style={tw`mb-5`}>
                    <Text
                      style={[
                        tw`text-sm font-bold mb-3`,
                        { color: Colors.textPrimary },
                      ]}
                    >
                      Documents
                    </Text>
                    <RenderDocuments
                      buildingPermitNumber={property.buildingPermitNumber}
                      propertyDocument={property.propertyDocument}
                      propertyTitleDocuments={property.propertyTitleDocuments}
                    />
                  </View>
                </View>
              </ScrollView>

              {/* Invest Now — fixed bottom CTA */}
              <View
                style={[
                  tw`absolute bottom-0  left-0 right-0 px-4 pb-6 pt-3`,
                  {
                    backgroundColor: "#fff",
                    borderTopWidth: 1,
                    borderColor: Colors.divider,
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    // Navigate to appropriate investment form based on model
                    if (property.investmentModel === "CO_DEVELOPMENT") {
                      router.push(`/investor/invest/${propertyId}/co-dev`);
                    } else {
                      // Handle other investment models
                      router.push(`/investor/invest/${propertyId}/co-dev`);
                    }
                  }}
                  style={[
                    tw`w-full py-4 rounded-2xl items-center`,
                    { backgroundColor: Colors.brand },
                  ]}
                >
                  <Text style={tw`text-white text-base font-bold`}>
                    Invest Now
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          );
        }}
      </PageLoader>
    </SafeAreaView>
  );
}
