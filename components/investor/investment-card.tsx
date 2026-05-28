import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";

export interface Investment {
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

export function getStatusColor(status: string): { bg: string; text: string } {
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

interface InvestmentCardProps {
  investment: Investment;
  onPress: () => void;
}

export default function InvestmentCard({ investment, onPress }: InvestmentCardProps) {
  const statusColors = getStatusColor(investment.status);
  const isOutright = investment.property.investmentModel === "OUTRIGHT_PURCHASE";

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
            style={[tw`text-base font-bold mb-1`, { color: Colors.textPrimary }]}
            numberOfLines={2}
          >
            {investment.property.propertyTitle}
          </Text>
          <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
            {formatDate(investment.createdAt)}
          </Text>
        </View>
        <View style={[tw`px-2.5 py-1 rounded-full`, { backgroundColor: statusColors.bg }]}>
          <Text style={[tw`text-xs font-semibold`, { color: statusColors.text }]}>
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
        {!isOutright && (
          <View style={tw`flex-1`}>
            <Text style={[tw`text-xs mb-1`, { color: Colors.textSecondary }]}>
              Returns
            </Text>
            <Text style={[tw`text-sm font-bold`, { color: "#059669" }]}>
              {formatCurrency(investment.totalReturns * 100)}
            </Text>
          </View>
        )}
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
          <View style={[tw`px-2 py-0.5 rounded`, { backgroundColor: "#F3F4F6" }]}>
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
