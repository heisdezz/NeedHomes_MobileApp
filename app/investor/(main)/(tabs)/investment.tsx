import { useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import apiClient from "@/lib/api";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";
import InvStatistics from "@/components/investor/inv-statistics";
import InvestmentCard, { type Investment } from "@/components/investor/investment-card";

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InvestmentsListScreen() {
  const router = useRouter();

  const query = useQuery({
    queryKey: ["recent-investments"],
    queryFn: async () => {
      const resp = await apiClient.get("/investments/my-investments", {
        params: {
          page: 1,
          limit: 3,
        },
      });
      return resp.data;
    },
  });

  const investments: Investment[] = query.data?.data?.data ?? [];
  const totalInvestments = query.data?.data?.meta?.total ?? 0;

  return (
    <SafeAreaView
      style={[tw`flex-1`, { backgroundColor: "#F9FAFB" }]}
      edges={["top", "bottom"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View
          style={[
            tw`px-4 py-3 bg-white border-b`,
            { borderBottomColor: Colors.divider },
          ]}
        >
          <View style={tw`flex-row items-center gap-3 mb-2`}>
            <View style={[tw`p-2 rounded-lg`, { backgroundColor: "#E9D5FF" }]}>
              <Ionicons name="trending-up" size={20} color="#7C3AED" />
            </View>
            <View style={tw`flex-1`}>
              <Text
                style={[tw`text-xl font-bold`, { color: Colors.textPrimary }]}
              >
                My Investments
              </Text>
              <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
                Track your investment portfolio
              </Text>
            </View>
          </View>
        </View>

        {/* Investment Statistics */}
        <View style={tw`py-4 bg-white mb-2`}>
          <InvStatistics />
        </View>

        {/* Add Investment Button */}
        <View style={tw`px-4 pb-3`}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/investor/properties")}
            style={[
              tw`flex-row items-center justify-center gap-2 py-3 rounded-xl`,
              { backgroundColor: Colors.brand },
            ]}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={tw`text-white text-sm font-bold`}>
              Add New Investment
            </Text>
          </TouchableOpacity>
        </View>

        {/* Latest Investments Section */}
        <View style={tw`px-4`}>
          {query.isLoading ? (
            <View style={tw`items-center justify-center py-8`}>
              <ActivityIndicator size="large" color={Colors.brand} />
              <Text style={[tw`text-sm mt-3`, { color: Colors.textMuted }]}>
                Loading investments...
              </Text>
            </View>
          ) : query.isError ? (
            <View style={tw`items-center justify-center p-6 bg-red-50 rounded-xl`}>
              <Ionicons name="alert-circle" size={48} color="#DC2626" />
              <Text
                style={[
                  tw`text-base font-bold mt-3`,
                  { color: Colors.textPrimary },
                ]}
              >
                Failed to Load
              </Text>
              <Text
                style={[
                  tw`text-sm text-center mt-2`,
                  { color: Colors.textSecondary },
                ]}
              >
                Could not retrieve your investments
              </Text>
              <TouchableOpacity
                onPress={() => query.refetch()}
                style={[
                  tw`mt-4 px-4 py-2 rounded-lg`,
                  { backgroundColor: Colors.brand },
                ]}
              >
                <Text style={tw`text-white text-sm font-semibold`}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : investments.length === 0 ? (
            <View style={tw`items-center justify-center p-6 bg-gray-50 rounded-xl`}>
              <Ionicons
                name="briefcase-outline"
                size={64}
                color={Colors.textMuted}
              />
              <Text
                style={[
                  tw`text-lg font-bold mt-4`,
                  { color: Colors.textPrimary },
                ]}
              >
                No Investments Yet
              </Text>
              <Text
                style={[
                  tw`text-sm text-center mt-2`,
                  { color: Colors.textSecondary },
                ]}
              >
                Start your investment journey by browsing available properties
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/investor/properties")}
                style={[
                  tw`mt-6 px-6 py-3 rounded-xl`,
                  { backgroundColor: Colors.brand },
                ]}
              >
                <Text style={tw`text-white font-semibold`}>
                  Browse Properties
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Header with count */}
              <View style={tw`mb-3`}>
                <Text
                  style={[
                    tw`text-sm font-semibold`,
                    { color: Colors.textPrimary },
                  ]}
                >
                  Latest Investments ({Math.min(3, investments.length)} of {totalInvestments})
                </Text>
              </View>

              {/* Investment Cards */}
              {investments.map((investment) => (
                <InvestmentCard
                  key={investment.id}
                  investment={investment}
                  onPress={() => router.push(`/investor/invesment/${investment.id}`)}
                />
              ))}

              {/* View More Button */}
              {totalInvestments > 3 && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push("/investor/investments")}
                  style={[
                    tw`flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 mt-2`,
                    { borderColor: Colors.brand },
                  ]}
                >
                  <Text
                    style={[
                      tw`text-base font-bold`,
                      { color: Colors.brand },
                    ]}
                  >
                    View More
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={Colors.brand} />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
