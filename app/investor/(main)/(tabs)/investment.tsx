import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import apiClient from "@/lib/api";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/ui/Pagination";
import InvStatistics from "@/components/investor/inv-statistics";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Investment {
  id: string;
  userId: string;
  propertyId: string;
  amountPaid: number;
  unitsBought: number;
  sharesBought: number | null;
  paymentOption: "OUTRIGHT" | "INSTALLMENT";
  status: "ACTIVE" | "PENDING" | "COMPLETED" | "CANCELLED" | "EXITED";
  createdAt: string;
  property: {
    basePrice: number;
    id: string;
    investmentModel: string;
    propertyType: string;
    propertyTitle: string;
  };
  updatedAt: string;
  deletedAt: string | null;
  currentValue: number;
  lastValuationDate: string | null;
  returnPercentage: number;
  totalAmount: number;
  totalReturns: number;
}

type StatusFilter =
  | "ALL"
  | "ACTIVE"
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED"
  | "EXITED";

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatCurrency(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case "ACTIVE":
      return { bg: "#D1FAE5", text: "#059669" };
    case "PENDING":
      return { bg: "#FEF3C7", text: "#D97706" };
    case "COMPLETED":
      return { bg: "#DBEAFE", text: "#1D4ED8" };
    case "CANCELLED":
      return { bg: "#FEE2E2", text: "#DC2626" };
    case "EXITED":
      return { bg: "#E9D5FF", text: "#7C3AED" };
    default:
      return { bg: "#F3F4F6", text: "#6B7280" };
  }
}

// ─── Investment Card Component ───────────────────────────────────────────────

interface InvestmentCardProps {
  investment: Investment;
  onPress: () => void;
}

function InvestmentCard({ investment, onPress }: InvestmentCardProps) {
  const statusColors = getStatusColor(investment.status);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        tw`bg-white rounded-xl p-4 mb-3`,
        { borderWidth: 1, borderColor: Colors.divider },
      ]}
    >
      {/* Header: Property Title & Status */}
      <View style={tw`flex-row items-start justify-between mb-3`}>
        <View style={tw`flex-1 mr-2`}>
          <Text
            style={[
              tw`text-base font-bold mb-1`,
              { color: Colors.textPrimary },
            ]}
            numberOfLines={2}
          >
            {investment.property.propertyTitle}
          </Text>
          <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
            {formatDate(investment.createdAt)}
          </Text>
        </View>
        <View
          style={[
            tw`px-2.5 py-1 rounded-full`,
            { backgroundColor: statusColors.bg },
          ]}
        >
          <Text
            style={[tw`text-xs font-semibold`, { color: statusColors.text }]}
          >
            {investment.status}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={tw`flex-row gap-3 mb-3`}>
        <View style={tw`flex-1`}>
          <Text style={[tw`text-xs mb-1`, { color: Colors.textSecondary }]}>
            Amount Paid
          </Text>
          <Text style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}>
            {formatCurrency(investment.amountPaid)}
          </Text>
        </View>
        <View style={tw`flex-1`}>
          <Text style={[tw`text-xs mb-1`, { color: Colors.textSecondary }]}>
            Returns
          </Text>
          <Text style={[tw`text-sm font-bold`, { color: "#059669" }]}>
            {formatCurrency(investment.totalReturns * 100)}
          </Text>
        </View>
      </View>

      {/* Bottom Row */}
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center gap-3`}>
          <View style={tw`flex-row items-center gap-1`}>
            <Ionicons name="grid-outline" size={14} color={Colors.textMuted} />
            <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
              {investment.unitsBought}{" "}
              {investment.unitsBought === 1 ? "slot" : "slots"}
            </Text>
          </View>
          <View
            style={[tw`px-2 py-0.5 rounded`, { backgroundColor: "#F3F4F6" }]}
          >
            <Text style={[tw`text-xs font-medium`, { color: "#6B7280" }]}>
              {investment.paymentOption}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InvestmentsListScreen() {
  const router = useRouter();
  const filterSheetRef = useRef<BottomSheet>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [tempStatusFilter, setTempStatusFilter] = useState<StatusFilter>("ALL");
  const snapPoints = ["45%"];

  const {
    page,
    limit,
    meta,
    setMeta,
    totalPages,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    goToPage,
    reset,
  } = usePagination({ initialPage: 1, limit: 10 });

  const query = useQuery({
    queryKey: ["investments", page, statusFilter],
    queryFn: async () => {
      const resp = await apiClient.get("/investments/my-investments", {
        params: {
          page,
          limit,
          ...(statusFilter !== "ALL" && { status: statusFilter }),
        },
      });
      return resp.data;
    },
  });

  // Sync pagination meta from API response
  useEffect(() => {
    const m = query.data?.data?.meta;
    if (m) setMeta(m);
  }, [query.data]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    reset();
  }, [statusFilter]);

  const investments: Investment[] = query.data?.data?.data ?? [];

  const statuses: StatusFilter[] = [
    "ALL",
    "ACTIVE",
    "PENDING",
    "COMPLETED",
    "CANCELLED",
    "EXITED",
  ];

  return (
    <SafeAreaView
      style={[tw`flex-1`, { backgroundColor: "#F9FAFB" }]}
      edges={["top", "bottom"]}
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

      {/* Filter Button */}
      <View style={tw`px-4 py-3 bg-white border-b`}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => filterSheetRef.current?.expand()}
          style={[
            tw`flex-row items-center justify-between px-4 py-3 rounded-xl border`,
            { borderColor: Colors.divider, backgroundColor: "#F9FAFB" },
          ]}
        >
          <View style={tw`flex-row items-center gap-2`}>
            <Ionicons name="filter-outline" size={18} color={Colors.brand} />
            <Text
              style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}
            >
              Filter by Status
            </Text>
          </View>
          <View style={tw`flex-row items-center gap-2`}>
            {statusFilter !== "ALL" && (
              <View
                style={[
                  tw`px-2 py-0.5 rounded-full`,
                  { backgroundColor: Colors.brand },
                ]}
              >
                <Text style={tw`text-xs font-semibold text-white`}>
                  {statusFilter}
                </Text>
              </View>
            )}
            <Ionicons name="chevron-down" size={18} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>
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

      {/* Investments List */}
      <View style={tw`flex-1 px-4`}>
        {query.isLoading ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <ActivityIndicator size="large" color={Colors.brand} />
            <Text style={[tw`text-sm mt-3`, { color: Colors.textMuted }]}>
              Loading investments...
            </Text>
          </View>
        ) : query.isError ? (
          <View style={tw`flex-1 items-center justify-center p-6`}>
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
          <View style={tw`flex-1 items-center justify-center p-6`}>
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
              {statusFilter === "ALL"
                ? "Start your investment journey by browsing available properties"
                : `No ${statusFilter.toLowerCase()} investments found`}
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
          <FlashList
            data={investments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <InvestmentCard
                investment={item}
                onPress={() => router.push(`/investor/invesment/${item.id}`)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
            ListHeaderComponent={
              <View style={tw`mb-3`}>
                <Text
                  style={[
                    tw`text-sm font-semibold`,
                    { color: Colors.textPrimary },
                  ]}
                >
                  {meta?.total ?? investments.length}{" "}
                  {(meta?.total ?? investments.length) === 1
                    ? "Investment"
                    : "Investments"}
                </Text>
              </View>
            }
            ListFooterComponent={
              <Pagination
                page={page}
                totalPages={totalPages}
                hasNext={hasNext}
                hasPrev={hasPrev}
                onNext={nextPage}
                onPrev={prevPage}
                onGoTo={goToPage}
              />
            }
          />
        )}
      </View>

      {/* Filter Bottom Sheet */}
      <BottomSheet
        ref={filterSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: "#fff" }}
        handleIndicatorStyle={{ backgroundColor: Colors.divider }}
      >
        <BottomSheetView style={tw`flex-1 px-4 pb-6`}>
          {/* Header */}
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <View style={tw`flex-row items-center gap-2`}>
              <Ionicons name="filter-outline" size={20} color={Colors.brand} />
              <Text
                style={[tw`text-lg font-bold`, { color: Colors.textPrimary }]}
              >
                Filter Investments
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => filterSheetRef.current?.close()}
              style={tw`p-2`}
            >
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Status Filter */}
          <View style={tw`mb-6`}>
            <Text
              style={[
                tw`text-xs font-semibold mb-3 uppercase tracking-wide`,
                { color: Colors.textSecondary },
              ]}
            >
              Status
            </Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              {statuses.map((status) => {
                const isActive = tempStatusFilter === status;
                const statusColors = getStatusColor(status);
                return (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setTempStatusFilter(status)}
                    style={[
                      tw`px-4 py-2.5 rounded-xl border`,
                      {
                        backgroundColor: isActive ? statusColors.bg : "#fff",
                        borderColor: isActive
                          ? statusColors.text
                          : Colors.divider,
                        borderWidth: isActive ? 1.5 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        tw`text-sm font-semibold`,
                        {
                          color: isActive
                            ? statusColors.text
                            : Colors.textSecondary,
                        },
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={tw`flex-row gap-3 mt-auto`}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setTempStatusFilter("ALL");
                setStatusFilter("ALL");
              }}
              style={[
                tw`flex-1 py-3 px-4 rounded-xl border`,
                { borderColor: Colors.divider },
              ]}
            >
              <Text
                style={[
                  tw`text-sm font-semibold text-center`,
                  { color: Colors.textSecondary },
                ]}
              >
                Reset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setStatusFilter(tempStatusFilter);
                filterSheetRef.current?.close();
              }}
              style={[
                tw`flex-1 py-3 px-4 rounded-xl`,
                { backgroundColor: Colors.brand },
              ]}
            >
              <Text style={tw`text-white text-sm font-bold text-center`}>
                Apply Filter
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}
