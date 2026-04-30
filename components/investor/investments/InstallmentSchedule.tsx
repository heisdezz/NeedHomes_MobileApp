import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";

import apiClient from "@/lib/api";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Installment {
  id: string;
  investmentId: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: "PENDING" | "PAID" | "OVERDUE";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface InstallmentScheduleProps {
  id: string;
  propertyId: string;
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatCurrency(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString()}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusColor(status: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "PAID":
      return {
        bg: "#D1FAE5",
        text: "#059669",
        border: "#6EE7B7",
      };
    case "PENDING":
      return {
        bg: "#FEF3C7",
        text: "#D97706",
        border: "#FCD34D",
      };
    case "OVERDUE":
      return {
        bg: "#FEE2E2",
        text: "#DC2626",
        border: "#FCA5A5",
      };
    default:
      return {
        bg: "#F3F4F6",
        text: "#6B7280",
        border: "#D1D5DB",
      };
  }
}

// ─── Installment Card Component ──────────────────────────────────────────────

interface InstallmentCardProps {
  installment: Installment;
  onPay: (installment: Installment) => void;
  isPaying: boolean;
}

function InstallmentCard({
  installment,
  onPay,
  isPaying,
}: InstallmentCardProps) {
  const statusColors = getStatusColor(installment.status);
  const isPending = installment.status === "PENDING";

  return (
    <View
      style={[
        tw`bg-white rounded-xl p-4 mb-3`,
        { borderWidth: 1, borderColor: Colors.divider },
      ]}
    >
      {/* Header: Status Badge */}
      <View style={tw`flex-row items-center justify-between mb-3`}>
        <View
          style={[
            tw`px-3 py-1 rounded-full`,
            {
              backgroundColor: statusColors.bg,
              borderWidth: 1,
              borderColor: statusColors.border,
            },
          ]}
        >
          <Text
            style={[tw`text-xs font-semibold`, { color: statusColors.text }]}
          >
            {installment.status}
          </Text>
        </View>

        {isPending && (
          <View style={tw`flex-row items-center gap-1`}>
            <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
            <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>
              Due Soon
            </Text>
          </View>
        )}
      </View>

      {/* Amount */}
      <View style={tw`mb-3`}>
        <Text style={[tw`text-xs mb-1`, { color: Colors.textSecondary }]}>
          Amount
        </Text>
        <Text style={[tw`text-2xl font-bold`, { color: Colors.textPrimary }]}>
          {formatCurrency(installment.amount)}
        </Text>
      </View>

      {/* Dates Row */}
      <View style={tw`flex-row gap-4 mb-3`}>
        {/* Due Date */}
        <View style={tw`flex-1`}>
          <Text style={[tw`text-xs mb-1`, { color: Colors.textSecondary }]}>
            Due Date
          </Text>
          <View style={tw`flex-row items-center gap-1`}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={Colors.textPrimary}
            />
            <Text
              style={[tw`text-sm font-medium`, { color: Colors.textPrimary }]}
            >
              {formatDate(installment.dueDate)}
            </Text>
          </View>
        </View>

        {/* Paid Date */}
        {installment.paidDate && (
          <View style={tw`flex-1`}>
            <Text style={[tw`text-xs mb-1`, { color: Colors.textSecondary }]}>
              Paid Date
            </Text>
            <View style={tw`flex-row items-center gap-1`}>
              <Ionicons name="checkmark-circle" size={14} color="#059669" />
              <Text
                style={[tw`text-sm font-medium`, { color: Colors.textPrimary }]}
              >
                {formatDate(installment.paidDate)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Pay Now Button */}
      {isPending && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onPay(installment)}
          disabled={isPaying}
          style={[
            tw`py-3 px-4 rounded-xl items-center justify-center`,
            {
              backgroundColor: isPaying ? Colors.divider : Colors.brand,
            },
          ]}
        >
          {isPaying ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={tw`flex-row items-center gap-2`}>
              <Ionicons name="card-outline" size={16} color="#fff" />
              <Text style={tw`text-white text-sm font-bold`}>Pay Now</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {installment.status === "PAID" && (
        <View
          style={[
            tw`py-2 px-4 rounded-xl items-center`,
            { backgroundColor: "#D1FAE5" },
          ]}
        >
          <View style={tw`flex-row items-center gap-2`}>
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <Text style={[tw`text-sm font-semibold`, { color: "#059669" }]}>
              Payment Completed
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InstallmentSchedule({
  id,
  propertyId,
}: InstallmentScheduleProps) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["inv-schedule", id],
    queryFn: async () => {
      const resp = await apiClient.get(`/investments/${id}/installments`);
      return resp.data;
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (installment: Installment) => {
      const resp = await apiClient.post(
        `/investments/installments/${installment.id}/pay`,
        {
          amount: installment.amount,
        },
      );
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inv-schedule", id] });
      showMessage({
        message: "Payment Successful",
        description: "Your installment payment has been processed.",
        type: "success",
        icon: "success",
        duration: 3000,
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Payment failed. Please try again.";
      showMessage({
        message: "Payment Failed",
        description: message,
        type: "danger",
        icon: "danger",
        duration: 4000,
      });
    },
  });

  const handlePay = (installment: Installment) => {
    if (installment.status !== "PENDING") return;
    paymentMutation.mutate(installment);
  };

  // Don't render if no data or empty array
  if (query.isSuccess && (!query.data?.data || query.data.data.length === 0)) {
    return null;
  }

  if (query.isLoading) {
    return (
      <View style={tw`py-8 items-center justify-center`}>
        <ActivityIndicator size="large" color={Colors.brand} />
        <Text style={[tw`text-sm mt-2`, { color: Colors.textMuted }]}>
          Loading schedule...
        </Text>
      </View>
    );
  }

  if (query.isError) {
    return (
      <View
        style={[
          tw`rounded-xl p-4 my-4`,
          {
            backgroundColor: "#FEE2E2",
            borderWidth: 1,
            borderColor: "#FCA5A5",
          },
        ]}
      >
        <View style={tw`flex-row items-center gap-2`}>
          <Ionicons name="alert-circle" size={20} color="#DC2626" />
          <Text style={[tw`text-sm font-medium flex-1`, { color: "#DC2626" }]}>
            Failed to load installment schedule
          </Text>
        </View>
      </View>
    );
  }

  const installments = (query.data?.data || []) as Installment[];

  // Calculate summary stats
  const totalAmount = installments.reduce((sum, item) => sum + item.amount, 0);
  const paidAmount = installments
    .filter((item) => item.status === "PAID")
    .reduce((sum, item) => sum + item.amount, 0);
  const pendingCount = installments.filter(
    (item) => item.status === "PENDING",
  ).length;

  return (
    <View style={tw`my-4`}>
      {/* Header */}
      <View
        style={[
          tw`bg-white rounded-t-xl p-4 border-b shadow`,
          {
            borderBottomColor: Colors.divider,
            borderTopWidth: 1,
            borderTopColor: Colors.divider,
          },
        ]}
      >
        <Text
          style={[tw`text-lg font-bold mb-2`, { color: Colors.textPrimary }]}
        >
          Installment Schedule
        </Text>

        {/* Summary Stats */}
        <View style={tw`flex-row gap-3 mt-2`}>
          <View style={tw`flex-1`}>
            <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
              Total
            </Text>
            <Text
              style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}
            >
              {formatCurrency(totalAmount)}
            </Text>
          </View>
          <View style={tw`flex-1`}>
            <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
              Paid
            </Text>
            <Text style={[tw`text-sm font-bold`, { color: "#059669" }]}>
              {formatCurrency(paidAmount)}
            </Text>
          </View>
          <View style={tw`flex-1`}>
            <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
              Pending
            </Text>
            <Text style={[tw`text-sm font-bold`, { color: "#D97706" }]}>
              {pendingCount} {pendingCount === 1 ? "payment" : "payments"}
            </Text>
          </View>
        </View>
      </View>

      {/* List of Installments */}
      <View
        style={[
          tw`bg-white rounded-b-xl p-4 shadow`,
          {
            borderBottomWidth: 1,
            borderBottomColor: Colors.divider,
          },
        ]}
      >
        {installments.length === 0 ? (
          <View style={tw`items-center justify-center py-8`}>
            <Ionicons
              name="calendar-outline"
              size={48}
              color={Colors.textMuted}
            />
            <Text style={[tw`text-sm mt-2`, { color: Colors.textMuted }]}>
              No installments scheduled
            </Text>
          </View>
        ) : (
          installments.map((item) => (
            <InstallmentCard
              key={item.id}
              installment={item}
              onPay={handlePay}
              isPaying={
                paymentMutation.isPending &&
                paymentMutation.variables?.id === item.id
              }
            />
          ))
        )}
      </View>
    </View>
  );
}
