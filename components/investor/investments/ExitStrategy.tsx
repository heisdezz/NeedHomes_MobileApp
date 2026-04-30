import { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { showMessage } from "react-native-flash-message";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import apiClient, { type ApiResponse } from "@/lib/api";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";
import type { PropertyDetail } from "@/lib/queries/investor";

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
  };
}

interface ExitRequest {
  id: string;
  investmentId: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string | null;
  adminNote: string | null;
  exitAmount: number | null;
  requestedAt: string;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ExitRequestsResponse {
  data: ExitRequest[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface ExitStrategyProps {
  investment: Investment;
  propertyId: string;
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

function getExitPolicyLabel(property: PropertyDetail): string {
  const model = property.investmentModel;
  if (model === "CO_DEVELOPMENT") {
    return `Exit rule: ${property.exitRule?.replace(/_/g, " ") ?? "N/A"}`;
  }
  if (model === "FRACTIONAL_OWNERSHIP") {
    return `Exit window: ${property.exitWindow?.replace(/_/g, " ") ?? "N/A"}`;
  }
  if (model === "LAND_BANKING") {
    return property.buyBackOption
      ? `Buy-back available after ${property.holdingPeriod ?? "?"} month holding period`
      : "No buy-back option";
  }
  return "Exit not available for this investment type";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Status Badge Component ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: ExitRequest["status"] }) {
  const config = {
    PENDING: {
      bg: "#FEF3C7",
      text: "#D97706",
      border: "#FCD34D",
      icon: "time-outline" as const,
      label: "Pending Review",
    },
    APPROVED: {
      bg: "#D1FAE5",
      text: "#059669",
      border: "#6EE7B7",
      icon: "checkmark-circle" as const,
      label: "Approved",
    },
    REJECTED: {
      bg: "#FEE2E2",
      text: "#DC2626",
      border: "#FCA5A5",
      icon: "close-circle" as const,
      label: "Rejected",
    },
  }[status];

  return (
    <View
      style={[
        tw`flex-row items-center gap-1 px-2.5 py-1 rounded-full`,
        {
          backgroundColor: config.bg,
          borderWidth: 1,
          borderColor: config.border,
        },
      ]}
    >
      <Ionicons name={config.icon} size={12} color={config.text} />
      <Text style={[tw`text-xs font-semibold`, { color: config.text }]}>
        {config.label}
      </Text>
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ExitStrategy({
  investment,
  propertyId,
}: ExitStrategyProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();
  const snapPoints = ["75%"];
  const [sheetIndex, setSheetIndex] = useState(-1);

  const propertyQuery = useQuery<ApiResponse<PropertyDetail>>({
    queryKey: ["inv", propertyId],
    queryFn: async () => {
      const resp = await apiClient.get(`/properties/${propertyId}`);
      return resp.data;
    },
  });

  const exitRequestsQuery = useQuery<ApiResponse<ExitRequestsResponse>>({
    queryKey: ["exit-requests", investment.id],
    queryFn: async () => {
      const resp = await apiClient.get(
        "/investments/exit-requests/my-requests",
      );
      return resp.data;
    },
    enabled: investment.status === "ACTIVE",
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const resp = await apiClient.post(
        `/investments/${investment.id}/exit-request`,
        { reason: reason.trim() || undefined },
      );
      return resp.data;
    },
    onSuccess: () => {
      showMessage({
        message: "Exit Request Submitted",
        description: "Your request is pending admin review",
        type: "success",
        icon: "success",
        duration: 3000,
      });
      queryClient.invalidateQueries({
        queryKey: ["exit-requests", investment.id],
      });
      setReason("");
      bottomSheetRef.current?.close();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit exit request";
      showMessage({
        message: "Request Failed",
        description: message,
        type: "danger",
        icon: "danger",
        duration: 4000,
      });
    },
  });

  // Don't show if investment is not active
  if (investment.status !== "ACTIVE") return null;

  // Don't show for certain investment types
  const NON_EXITABLE = ["FRACTIONAL_OWNERSHIP", "OUTRIGHT_PURCHASE"];
  if (NON_EXITABLE.includes(investment.property?.investmentModel ?? "")) {
    return null;
  }

  if (propertyQuery.isLoading) {
    return (
      <View style={tw`py-8 items-center justify-center`}>
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    );
  }

  if (propertyQuery.isError || !propertyQuery.data?.data) return null;

  const property = propertyQuery.data.data;
  const allRequests = exitRequestsQuery.data?.data?.data ?? [];

  const pendingRequest = allRequests.find(
    (r) => r.investmentId === investment.id && r.status === "PENDING",
  );

  const latestRequest = allRequests
    .filter((r) => r.investmentId === investment.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];

  return (
    <>
      {/* Main Card */}
      <View
        style={[
          tw`bg-white rounded-xl my-4`,
          { borderWidth: 1, borderColor: Colors.divider },
        ]}
      >
        {/* Header */}
        <View
          style={[
            tw`flex-row items-center justify-between p-4 border-b`,
            { borderBottomColor: Colors.divider, backgroundColor: "#F9FAFB" },
          ]}
        >
          <View style={tw`flex-row items-center gap-2`}>
            <Ionicons
              name="exit-outline"
              size={20}
              color={Colors.textPrimary}
            />
            <Text
              style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}
            >
              Exit Strategy
            </Text>
          </View>

          {pendingRequest ? (
            <View
              style={[
                tw`flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg`,
                {
                  backgroundColor: "#FEF3C7",
                  borderWidth: 1,
                  borderColor: "#FCD34D",
                },
              ]}
            >
              <Ionicons name="time-outline" size={14} color="#D97706" />
              <Text style={[tw`text-xs font-semibold`, { color: "#D97706" }]}>
                Pending
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => bottomSheetRef.current?.expand()}
              style={[
                tw`flex-row items-center gap-1.5 px-3 py-2 rounded-lg border`,
                {
                  borderColor: Colors.brand,
                  backgroundColor: Colors.brand + "10",
                },
              ]}
            >
              <Ionicons name="exit-outline" size={14} color={Colors.brand} />
              <Text
                style={[tw`text-xs font-semibold`, { color: Colors.brand }]}
              >
                Request Exit
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View style={tw`p-4`}>
          {/* Exit Policy & Current Value */}
          <View style={tw`flex-row gap-4 mb-4`}>
            <View style={tw`flex-1`}>
              <Text
                style={[
                  tw`text-xs uppercase tracking-wide font-medium mb-1`,
                  { color: Colors.textSecondary },
                ]}
              >
                Exit Policy
              </Text>
              <Text
                style={[tw`text-sm font-medium`, { color: Colors.textPrimary }]}
              >
                {getExitPolicyLabel(property)}
              </Text>
            </View>
            <View style={tw`items-end`}>
              <Text
                style={[
                  tw`text-xs uppercase tracking-wide font-medium mb-1`,
                  { color: Colors.textSecondary },
                ]}
              >
                Current Value
              </Text>
              <Text
                style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}
              >
                {formatNaira(investment.currentValue)}
              </Text>
            </View>
          </View>

          {/* Latest Request */}
          {latestRequest && (
            <View
              style={[
                tw`rounded-lg p-4`,
                { borderWidth: 1, borderColor: Colors.divider },
              ]}
            >
              <View style={tw`flex-row items-center justify-between mb-3`}>
                <Text
                  style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}
                >
                  Latest Exit Request
                </Text>
                <StatusBadge status={latestRequest.status} />
              </View>

              <View style={tw`gap-3`}>
                <View style={tw`flex-row gap-4`}>
                  <View style={tw`flex-1`}>
                    <Text
                      style={[tw`text-xs`, { color: Colors.textSecondary }]}
                    >
                      Requested
                    </Text>
                    <Text
                      style={[
                        tw`text-sm font-medium`,
                        { color: Colors.textPrimary },
                      ]}
                    >
                      {formatDate(latestRequest.requestedAt)}
                    </Text>
                  </View>

                  {latestRequest.processedAt && (
                    <View style={tw`flex-1`}>
                      <Text
                        style={[tw`text-xs`, { color: Colors.textSecondary }]}
                      >
                        Processed
                      </Text>
                      <Text
                        style={[
                          tw`text-sm font-medium`,
                          { color: Colors.textPrimary },
                        ]}
                      >
                        {formatDate(latestRequest.processedAt)}
                      </Text>
                    </View>
                  )}
                </View>

                {latestRequest.exitAmount !== null && (
                  <View>
                    <Text
                      style={[tw`text-xs`, { color: Colors.textSecondary }]}
                    >
                      Payout Amount
                    </Text>
                    <Text
                      style={[tw`text-base font-bold`, { color: "#059669" }]}
                    >
                      {formatNaira(latestRequest.exitAmount)}
                    </Text>
                  </View>
                )}

                {latestRequest.reason && (
                  <View>
                    <Text
                      style={[tw`text-xs`, { color: Colors.textSecondary }]}
                    >
                      Your Reason
                    </Text>
                    <Text
                      style={[
                        tw`text-sm font-medium`,
                        { color: Colors.textPrimary },
                      ]}
                    >
                      {latestRequest.reason}
                    </Text>
                  </View>
                )}

                {latestRequest.adminNote && (
                  <View>
                    <Text
                      style={[tw`text-xs`, { color: Colors.textSecondary }]}
                    >
                      Admin Note
                    </Text>
                    <Text
                      style={[
                        tw`text-sm font-medium`,
                        { color: Colors.textPrimary },
                      ]}
                    >
                      {latestRequest.adminNote}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {!latestRequest && !exitRequestsQuery.isLoading && (
            <Text
              style={[
                tw`text-sm text-center py-4`,
                { color: Colors.textMuted },
              ]}
            >
              No exit requests submitted yet
            </Text>
          )}
        </View>
      </View>

      {/* Bottom Sheet Modal */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        animateOnMount={false}
        detached={false}
        onChange={(index) => setSheetIndex(index)}
        backgroundStyle={{ backgroundColor: "#fff" }}
        handleIndicatorStyle={{ backgroundColor: Colors.divider }}
      >
        <BottomSheetView style={tw`flex-1 px-4 pb-8`}>
          {/* Modal Header */}
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <Text
              style={[tw`text-lg font-bold`, { color: Colors.textPrimary }]}
            >
              Request Investment Exit
            </Text>
            <TouchableOpacity
              onPress={() => bottomSheetRef.current?.close()}
              style={tw`p-2`}
            >
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Warning Box */}
          <View
            style={[
              tw`flex-row gap-3 p-3 rounded-xl mb-4`,
              {
                backgroundColor: "#FEF3C7",
                borderWidth: 1,
                borderColor: "#FCD34D",
              },
            ]}
          >
            <Ionicons name="warning-outline" size={18} color="#D97706" />
            <Text style={[tw`text-xs flex-1 leading-5`, { color: "#92400E" }]}>
              Your exit request will be reviewed by an admin. Eligibility is
              verified automatically based on your investment's exit policy.
            </Text>
          </View>

          {/* Info Grid */}
          <View style={tw`flex-row gap-4 mb-4`}>
            <View style={tw`flex-1`}>
              <Text style={[tw`text-xs mb-1`, { color: Colors.textSecondary }]}>
                Exit Policy
              </Text>
              <Text
                style={[tw`text-sm font-medium`, { color: Colors.textPrimary }]}
              >
                {getExitPolicyLabel(property)}
              </Text>
            </View>
            <View>
              <Text style={[tw`text-xs mb-1`, { color: Colors.textSecondary }]}>
                Current Value
              </Text>
              <Text
                style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}
              >
                {formatNaira(investment.currentValue)}
              </Text>
            </View>
          </View>

          {/* Reason Input */}
          <View style={tw`mb-6`}>
            <Text
              style={[
                tw`text-sm font-medium mb-2`,
                { color: Colors.textPrimary },
              ]}
            >
              Reason{" "}
              <Text style={[tw`font-normal`, { color: Colors.textSecondary }]}>
                (optional)
              </Text>
            </Text>
            <TextInput
              style={[
                tw`rounded-xl border px-3 py-3 text-sm`,
                {
                  borderColor: Colors.inputBorder,
                  backgroundColor: Colors.inputBg,
                  color: Colors.textPrimary,
                  textAlignVertical: "top",
                  minHeight: 100,
                },
              ]}
              multiline
              numberOfLines={4}
              placeholder="e.g. Need liquidity for other commitments"
              placeholderTextColor={Colors.textMuted}
              value={reason}
              onChangeText={setReason}
            />
          </View>

          {/* Action Buttons */}
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => bottomSheetRef.current?.close()}
              style={[
                tw`flex-1 py-3 px-4 rounded-xl items-center border`,
                { borderColor: Colors.divider },
              ]}
            >
              <Text
                style={[
                  tw`text-sm font-semibold`,
                  { color: Colors.textSecondary },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              style={[
                tw`flex-1 py-3 px-4 rounded-xl items-center`,
                {
                  backgroundColor: submitMutation.isPending
                    ? Colors.divider
                    : Colors.brand,
                },
              ]}
            >
              {submitMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={tw`text-white text-sm font-bold`}>
                  Submit Request
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
