import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { showMessage } from "react-native-flash-message";

import apiClient, { type ApiResponse } from "@/lib/api";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";
import InstallmentSchedule from "@/components/investor/investments/InstallmentSchedule";
import ExitStrategy from "@/components/investor/investments/ExitStrategy";
import InvPropDetails from "@/components/investor/investments/InvPropDetails";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Investment {
  id: string;
  userId: string;
  propertyId: string;
  amountPaid: number;
  unitsBought: number;
  sharesBought: number | null;
  paymentOption: "OUTRIGHT" | "INSTALLMENT";
  status: "ACTIVE" | "PENDING" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  currentValue: number;
  lastValuationDate: string | null;
  returnPercentage: number;
  totalAmount: number;
  totalReturns: number;
  property?: {
    investmentModel: string;
    exitWindow?: string | null;
    fractionalHoldingPeriodDays?: number | null;
  };
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatCurrency(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Copy Button Component ───────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    showMessage({
      message: "Copied to clipboard",
      type: "success",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TouchableOpacity onPress={handleCopy} style={tw`p-1.5`}>
      <Ionicons
        name={copied ? "checkmark" : "copy-outline"}
        size={14}
        color={copied ? "#059669" : Colors.textMuted}
      />
    </TouchableOpacity>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InvestmentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const query = useQuery<ApiResponse<Investment>>({
    queryKey: ["investment", id],
    queryFn: async () => {
      const resp = await apiClient.get(`/investments/${id}`);
      return resp.data;
    },
    enabled: !!id,
  });

  if (query.isLoading) {
    return (
      <SafeAreaView
        style={[tw`flex-1`, { backgroundColor: "#F9FAFB" }]}
        edges={["top"]}
      >
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <Text style={[tw`text-sm mt-3`, { color: Colors.textMuted }]}>
            Loading investment...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (query.isError || !query.data?.data) {
    return (
      <SafeAreaView
        style={[tw`flex-1`, { backgroundColor: "#F9FAFB" }]}
        edges={["top"]}
      >
        <View style={tw`flex-1 items-center justify-center p-6`}>
          <Ionicons name="alert-circle" size={64} color="#DC2626" />
          <Text
            style={[tw`text-lg font-bold mt-4`, { color: Colors.textPrimary }]}
          >
            Failed to Load Investment
          </Text>
          <Text
            style={[
              tw`text-sm text-center mt-2`,
              { color: Colors.textSecondary },
            ]}
          >
            Could not retrieve investment details
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              tw`mt-6 px-6 py-3 rounded-xl`,
              { backgroundColor: Colors.brand },
            ]}
          >
            <Text style={tw`text-white font-semibold`}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const investment = query.data.data;
  const isInstallment = investment.paymentOption === "INSTALLMENT";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { bg: "#D1FAE5", text: "#059669" };
      case "COMPLETED":
        return { bg: "#DBEAFE", text: "#1D4ED8" };
      case "PENDING":
        return { bg: "#FEF3C7", text: "#D97706" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  const statusColor = getStatusColor(investment.status);

  return (
    <SafeAreaView
      style={[tw`flex-1`, { backgroundColor: "#F9FAFB" }]}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View
        style={[
          tw`flex-row items-center px-4 py-3 bg-white border-b`,
          { borderBottomColor: Colors.divider },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={tw`mr-3`}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text
          style={[tw`text-lg font-bold flex-1`, { color: Colors.textPrimary }]}
        >
          Investment Details
        </Text>
      </View>

      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-4 pb-8`}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={tw`bg-white rounded-xl mb-4 overflow-hidden shadow-sm`}>
          {/* Accent Bar */}
          <View
            style={{
              height: 6,
              backgroundColor: Colors.brand,
            }}
          />

          <View style={tw`p-4`}>
            {/* Title & Status */}
            <View style={tw`flex-row items-start justify-between mb-4`}>
              <View style={tw`flex-1`}>
                <View style={tw`flex-row items-center gap-3 mb-2`}>
                  <View
                    style={[
                      tw`p-2.5 rounded-xl`,
                      { backgroundColor: "#D1FAE5" },
                    ]}
                  >
                    <Ionicons name="trending-up" size={20} color="#059669" />
                  </View>
                  <View>
                    <Text
                      style={[
                        tw`text-xl font-bold`,
                        { color: Colors.textPrimary },
                      ]}
                    >
                      Investment
                    </Text>
                    <View style={tw`flex-row items-center gap-2 mt-1`}>
                      <View
                        style={[
                          tw`px-2.5 py-0.5 rounded-full`,
                          { backgroundColor: statusColor.bg },
                        ]}
                      >
                        <Text
                          style={[
                            tw`text-xs font-semibold`,
                            { color: statusColor.text },
                          ]}
                        >
                          {investment.status}
                        </Text>
                      </View>
                      <View
                        style={[
                          tw`px-2.5 py-0.5 rounded-full`,
                          { backgroundColor: "#F3F4F6" },
                        ]}
                      >
                        <Text
                          style={[
                            tw`text-xs font-medium`,
                            { color: "#6B7280" },
                          ]}
                        >
                          {investment.paymentOption}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Investment ID */}
                <View
                  style={[
                    tw`rounded-lg px-3 py-2.5 flex-row items-center gap-2`,
                    {
                      backgroundColor: "#F9FAFB",
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                    },
                  ]}
                >
                  <Ionicons
                    name="key-outline"
                    size={14}
                    color={Colors.textMuted}
                  />
                  <View style={tw`flex-1`}>
                    <Text
                      style={[
                        tw`text-xs uppercase tracking-wide font-medium mb-0.5`,
                        { color: Colors.textSecondary },
                      ]}
                    >
                      Investment ID
                    </Text>
                    <Text
                      style={[
                        tw`text-xs font-mono font-semibold`,
                        { color: Colors.textPrimary },
                      ]}
                      numberOfLines={1}
                    >
                      {investment.id}
                    </Text>
                  </View>
                  <CopyButton text={investment.id} />
                </View>

                {/* Property ID */}
                <View style={tw`flex-row items-center gap-2 mt-2`}>
                  <Ionicons
                    name="location-outline"
                    size={12}
                    color={Colors.textMuted}
                  />
                  <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
                    Property:
                  </Text>
                  <Text
                    style={[
                      tw`text-xs font-mono`,
                      { color: Colors.textPrimary },
                    ]}
                    numberOfLines={1}
                  >
                    {investment.propertyId.slice(0, 12)}...
                  </Text>
                  <CopyButton text={investment.propertyId} />
                </View>
              </View>
            </View>

            {/* Current Value Card */}
            <View
              style={[
                tw`rounded-xl px-4 py-3`,
                {
                  background:
                    "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
                  backgroundColor: "#FFF7ED",
                  borderWidth: 1,
                  borderColor: "#FDBA74",
                },
              ]}
            >
              <Text
                style={[
                  tw`text-xs uppercase tracking-wide font-medium mb-1`,
                  { color: "#9A3412" },
                ]}
              >
                Current Value
              </Text>
              <Text style={[tw`text-3xl font-bold`, { color: Colors.brand }]}>
                {formatCurrency(investment.currentValue)}
              </Text>
              <View style={tw`flex-row items-center gap-1 mt-1`}>
                <Ionicons name="trending-up" size={14} color="#059669" />
                <Text style={[tw`text-sm font-semibold`, { color: "#059669" }]}>
                  +{investment.returnPercentage}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={tw`flex-row flex-wrap gap-3 mb-4`}>
          {/* Amount Paid */}
          <View
            style={[tw`bg-white rounded-xl p-4 flex-1`, { minWidth: "45%" }]}
          >
            <View
              style={[
                tw`p-2 rounded-lg mb-2`,
                { backgroundColor: "#DBEAFE", alignSelf: "flex-start" },
              ]}
            >
              <Ionicons name="cash-outline" size={16} color="#1D4ED8" />
            </View>
            <Text
              style={[
                tw`text-xs uppercase tracking-wide font-medium mb-1`,
                { color: Colors.textSecondary },
              ]}
            >
              Amount Paid
            </Text>
            <Text
              style={[tw`text-lg font-bold`, { color: Colors.textPrimary }]}
            >
              {formatCurrency(investment.amountPaid)}
            </Text>
          </View>

          {/* Total Returns */}
          <View
            style={[tw`bg-white rounded-xl p-4 flex-1`, { minWidth: "45%" }]}
          >
            <View
              style={[
                tw`p-2 rounded-lg mb-2`,
                { backgroundColor: "#D1FAE5", alignSelf: "flex-start" },
              ]}
            >
              <Ionicons name="trending-up" size={16} color="#059669" />
            </View>
            <Text
              style={[
                tw`text-xs uppercase tracking-wide font-medium mb-1`,
                { color: Colors.textSecondary },
              ]}
            >
              Total Returns
            </Text>
            <Text style={[tw`text-lg font-bold`, { color: "#059669" }]}>
              {formatCurrency(investment.totalReturns * 100)}
            </Text>
          </View>

          {/* Units Bought */}
          <View
            style={[tw`bg-white rounded-xl p-4 flex-1`, { minWidth: "45%" }]}
          >
            <View
              style={[
                tw`p-2 rounded-lg mb-2`,
                { backgroundColor: "#E9D5FF", alignSelf: "flex-start" },
              ]}
            >
              <Ionicons name="bar-chart-outline" size={16} color="#7C3AED" />
            </View>
            <Text
              style={[
                tw`text-xs uppercase tracking-wide font-medium mb-1`,
                { color: Colors.textSecondary },
              ]}
            >
              Units Bought
            </Text>
            <Text
              style={[tw`text-lg font-bold`, { color: Colors.textPrimary }]}
            >
              {investment.unitsBought}
            </Text>
          </View>

          {/* Date Invested */}
          <View
            style={[tw`bg-white rounded-xl p-4 flex-1`, { minWidth: "45%" }]}
          >
            <View
              style={[
                tw`p-2 rounded-lg mb-2`,
                { backgroundColor: "#FED7AA", alignSelf: "flex-start" },
              ]}
            >
              <Ionicons name="calendar-outline" size={16} color="#EA580C" />
            </View>
            <Text
              style={[
                tw`text-xs uppercase tracking-wide font-medium mb-1`,
                { color: Colors.textSecondary },
              ]}
            >
              Date Invested
            </Text>
            <Text
              style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}
            >
              {new Date(investment.createdAt).toLocaleDateString("en-NG", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Investment Information */}
        <View style={tw`bg-white rounded-xl mb-4 overflow-hidden`}>
          <View
            style={[
              tw`px-4 py-3 border-b flex-row items-center justify-between`,
              { borderBottomColor: Colors.divider, backgroundColor: "#F9FAFB" },
            ]}
          >
            <Text
              style={[
                tw`text-xs font-semibold uppercase tracking-wide`,
                { color: Colors.textPrimary },
              ]}
            >
              Investment Information
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push(`/investor/properties/${investment.propertyId}`)
              }
              style={[
                tw`flex-row items-center gap-1 px-3 py-1.5 rounded-lg`,
                { backgroundColor: Colors.textPrimary },
              ]}
            >
              <Text style={tw`text-white text-xs font-semibold`}>
                View Property
              </Text>
              <Ionicons name="arrow-forward" size={12} color="#fff" />
            </TouchableOpacity>
          </View>

          <View>
            {[
              { label: "Payment Plan", value: investment.paymentOption },
              {
                label: "Total Contract",
                value: formatCurrency(investment.totalAmount),
                bold: true,
              },
              {
                label: "Last Valuation",
                value: investment.lastValuationDate
                  ? formatDate(investment.lastValuationDate)
                  : "N/A",
              },
              {
                label: "Last Updated",
                value: formatDate(investment.updatedAt),
              },
            ].map(({ label, value, bold }, index, arr) => (
              <View
                key={label}
                style={[
                  tw`flex-row items-center justify-between px-4 py-3`,
                  index < arr.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: "#F9FAFB",
                  },
                ]}
              >
                <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
                  {label}
                </Text>
                <Text
                  style={[
                    tw`text-sm`,
                    bold
                      ? { fontWeight: "700", color: Colors.textPrimary }
                      : { fontWeight: "500", color: Colors.textPrimary },
                  ]}
                >
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Property */}
        <View style={tw`mb-4`}>
          <InvPropDetails propertyId={investment.propertyId} />
        </View>

        {/* Installment Schedule */}
        {isInstallment && (
          <InstallmentSchedule id={id} propertyId={investment.propertyId} />
        )}

        {/* Exit Strategy */}
        <ExitStrategy
          investment={investment}
          propertyId={investment.propertyId}
        />

        {/* Resell Component - placeholder for now */}
        {investment.status === "COMPLETED" && (
          <View
            style={[
              tw`bg-white rounded-xl p-4 my-4`,
              { borderWidth: 1, borderColor: Colors.divider },
            ]}
          >
            <View style={tw`flex-row items-center gap-2 mb-2`}>
              <Ionicons
                name="sync-outline"
                size={20}
                color={Colors.textPrimary}
              />
              <Text
                style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}
              >
                Resell Listing
              </Text>
            </View>
            <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
              Resell feature coming soon
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
