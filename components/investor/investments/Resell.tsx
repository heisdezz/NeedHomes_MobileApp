import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { toast } from "sonner-native";

import apiClient from "@/lib/api";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";
import { extract_message } from "@/helpers/apihelpers";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Investment {
  id: string;
  status: "ACTIVE" | "PENDING" | "COMPLETED";
  amountPaid: number;
  propertyId: string;
  currentValue: number;
  sharesBought?: number | null;
  unitsBought?: number | null;
  property?: {
    pricePerShare?: number | null;
    pricePerPlot?: number | null;
  } | null;
}

interface PricingData {
  minPrice: number;
  maxPrice: number;
  roi: number;
  units: number;
}

type ResellStatus = "PENDING" | "APPROVED" | "REJECTED" | "SOLD";

interface ResellSlot {
  id: string;
  originalInvestmentId: string;
  units: number;
  soldUnits: number;
  status: ResellStatus;
  rejectionReason: string | null;
  createdAt: string;
  property: {
    id: string;
    propertyTitle: string;
    investmentModel: string;
    coverImage: string;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ResellStatus,
  { bg: string; text: string; border: string; icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  PENDING: { bg: "#FEF3C7", text: "#D97706", border: "#FCD34D", icon: "time-outline", label: "Pending Review" },
  APPROVED: { bg: "#D1FAE5", text: "#059669", border: "#6EE7B7", icon: "checkmark-circle", label: "Approved & Live" },
  REJECTED: { bg: "#FEE2E2", text: "#DC2626", border: "#FCA5A5", icon: "close-circle", label: "Rejected" },
  SOLD: { bg: "#DBEAFE", text: "#1D4ED8", border: "#93C5FD", icon: "bag-check-outline", label: "Sold" },
};

function ResellStatusBadge({ status }: { status: ResellStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <View
      style={[
        tw`flex-row items-center gap-1 px-2.5 py-1 rounded-full`,
        { backgroundColor: c.bg, borderWidth: 1, borderColor: c.border },
      ]}
    >
      <Ionicons name={c.icon} size={12} color={c.text} />
      <Text style={[tw`text-xs font-semibold`, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Resell({ investment }: { investment: Investment }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [askingPrice, setAskingPrice] = useState("");
  const queryClient = useQueryClient();

  const isEligible = investment.status === "COMPLETED";

  const listingsQuery = useQuery<{ data: { data: ResellSlot[] } }>({
    queryKey: ["resell-listings"],
    queryFn: async () => {
      const resp = await apiClient.get("resell/my-listings");
      return resp.data;
    },
    enabled: isEligible,
  });

  const listing = (listingsQuery.data?.data?.data ?? []).find(
    (l) => l.originalInvestmentId === investment.id,
  );

  const canRequest = !listing || listing.status === "REJECTED";

  const pricingQuery = useQuery<{ data: PricingData }>({
    queryKey: ["resell-pricing", investment.id],
    queryFn: async () => {
      const resp = await apiClient.get(`resell/pricing/${investment.id}`);
      return resp.data;
    },
    enabled: isEligible && canRequest,
  });

  const pricing = pricingQuery.data?.data;

  const submitMutation = useMutation({
    mutationFn: async () => {
      const body: Record<string, number> = {};
      if (askingPrice.trim()) {
        const kobo = Math.round(parseFloat(askingPrice.replace(/,/g, "")) * 100);
        if (!kobo || kobo <= 0) throw new Error("Invalid asking price");
        if (pricing) {
          if (kobo < pricing.minPrice)
            throw new Error(`Asking price must be at least ${formatNaira(pricing.minPrice)}`);
          if (kobo > pricing.maxPrice)
            throw new Error(`Asking price cannot exceed ${formatNaira(pricing.maxPrice)}`);
        }
        body.askingPrice = kobo;
      }
      const resp = await apiClient.post(`resell/${investment.id}`, body);
      return resp.data;
    },
    onSuccess: () => {
      toast.success("Resell request submitted — awaiting admin review");
      queryClient.invalidateQueries({ queryKey: ["resell-listings"] });
      setAskingPrice("");
      setModalVisible(false);
    },
    onError: (error: any) => {
      toast.error(extract_message(error));
    },
  });

  return (
    <>
      {/* ── Card ── */}
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
            <Ionicons name="refresh-outline" size={20} color={Colors.textPrimary} />
            <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>
              Resell Listing
            </Text>
          </View>

          {!isEligible ? (
            <View
              style={[
                tw`flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg`,
                { backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#E5E7EB" },
              ]}
            >
              <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
              <Text style={[tw`text-xs font-semibold`, { color: Colors.textMuted }]}>
                Available when fully paid
              </Text>
            </View>
          ) : listing && (listing.status === "PENDING" || listing.status === "APPROVED") ? (
            <ResellStatusBadge status={listing.status} />
          ) : canRequest ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalVisible(true)}
              style={[
                tw`flex-row items-center gap-1.5 px-3 py-2 rounded-lg border`,
                { borderColor: Colors.brand, backgroundColor: Colors.brand + "10" },
              ]}
            >
              <Ionicons name="cash-outline" size={14} color={Colors.brand} />
              <Text style={[tw`text-xs font-semibold`, { color: Colors.brand }]}>
                Request Resell
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Body */}
        <View style={tw`p-4`}>
          {!isEligible ? (
            <Text style={[tw`text-sm`, { color: Colors.textMuted }]}>
              Resell is only available once your investment is fully paid (status: COMPLETED).
            </Text>
          ) : listingsQuery.isLoading ? (
            <View style={tw`flex-row items-center gap-2 py-2`}>
              <ActivityIndicator size="small" color={Colors.brand} />
              <Text style={[tw`text-sm`, { color: Colors.textMuted }]}>Loading resell status…</Text>
            </View>
          ) : listing ? (
            <View style={[tw`rounded-lg p-4`, { borderWidth: 1, borderColor: Colors.divider }]}>
              <View style={tw`flex-row items-center justify-between mb-3`}>
                <Text
                  style={[tw`text-sm font-semibold flex-1 mr-2`, { color: Colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {listing.property.propertyTitle}
                </Text>
                <ResellStatusBadge status={listing.status} />
              </View>

              <View style={tw`flex-row gap-3 mb-3`}>
                <View style={tw`flex-1`}>
                  <Text style={[tw`text-xs mb-0.5`, { color: Colors.textSecondary }]}>Units</Text>
                  <Text style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}>
                    {listing.soldUnits} / {listing.units} sold
                  </Text>
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[tw`text-xs mb-0.5`, { color: Colors.textSecondary }]}>Model</Text>
                  <Text style={[tw`text-sm font-medium`, { color: Colors.textPrimary }]}>
                    {listing.property.investmentModel.replace(/_/g, " ")}
                  </Text>
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[tw`text-xs mb-0.5`, { color: Colors.textSecondary }]}>Submitted</Text>
                  <Text style={[tw`text-sm font-medium`, { color: Colors.textPrimary }]}>
                    {formatDate(listing.createdAt)}
                  </Text>
                </View>
              </View>

              {listing.status === "REJECTED" && (
                <View
                  style={[
                    tw`flex-row gap-2 p-3 rounded-xl`,
                    { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FCA5A5" },
                  ]}
                >
                  <Ionicons name="close-circle" size={16} color="#DC2626" />
                  <View style={tw`flex-1`}>
                    <Text style={[tw`text-xs font-medium`, { color: "#DC2626" }]}>
                      Your listing was rejected. You may submit a new resell request.
                    </Text>
                    {listing.rejectionReason ? (
                      <Text style={[tw`text-xs mt-1 opacity-80`, { color: "#DC2626" }]}>
                        Reason: {listing.rejectionReason}
                      </Text>
                    ) : null}
                  </View>
                </View>
              )}

              {listing.status === "SOLD" && (
                <View
                  style={[
                    tw`flex-row gap-2 p-3 rounded-xl`,
                    { backgroundColor: "#D1FAE5", borderWidth: 1, borderColor: "#6EE7B7" },
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={[tw`text-xs font-medium flex-1`, { color: "#059669" }]}>
                    Your property was sold and the proceeds have been credited to your wallet.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={[tw`text-sm`, { color: Colors.textMuted }]}>
              No resell listing submitted yet. Your investment is fully paid — you can list it for resale.
            </Text>
          )}
        </View>
      </View>

      {/* ── Request Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={[tw`flex-1`, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          onPress={() => setModalVisible(false)}
        />
        <View
          style={[
            tw`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-4 pt-3`,
            { paddingBottom: Platform.OS === "ios" ? 34 : 24 },
          ]}
        >
          {/* Handle */}
          <View
            style={[
              tw`self-center rounded-full mb-4`,
              { width: 40, height: 4, backgroundColor: Colors.divider },
            ]}
          />

          {/* Header */}
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <Text style={[tw`text-lg font-bold`, { color: Colors.textPrimary }]}>
              Request Resell Listing
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={tw`p-2`}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Info box */}
          <View
            style={[
              tw`flex-row gap-3 p-3 rounded-xl mb-4`,
              { backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE" },
            ]}
          >
            <Ionicons name="information-circle-outline" size={18} color="#1D4ED8" />
            <Text style={[tw`text-xs flex-1 leading-5`, { color: "#1E40AF" }]}>
              Your resell listing will be reviewed by an admin before going live. Once approved,
              other investors can purchase it and your wallet will be credited automatically.
            </Text>
          </View>

          {/* Pricing grid */}
          {pricingQuery.isLoading ? (
            <View style={tw`flex-row items-center gap-2 py-2 mb-4`}>
              <ActivityIndicator size="small" color={Colors.brand} />
              <Text style={[tw`text-sm`, { color: Colors.textMuted }]}>Loading pricing…</Text>
            </View>
          ) : pricing ? (
            <View
              style={[
                tw`flex-row gap-2 rounded-xl p-3 mb-4`,
                { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: Colors.divider },
              ]}
            >
              {(
                [
                  { label: "Min Price", value: formatNaira(pricing.minPrice) },
                  { label: "Max Price", value: formatNaira(pricing.maxPrice) },
                  {
                    label: "ROI",
                    value: `${pricing.roi >= 0 ? "+" : ""}${pricing.roi.toFixed(2)}%`,
                    color: pricing.roi >= 0 ? "#059669" : "#DC2626",
                  },
                  { label: "Units", value: String(pricing.units) },
                ] as { label: string; value: string; color?: string }[]
              ).map(({ label, value, color }) => (
                <View key={label} style={tw`flex-1`}>
                  <Text
                    style={[
                      tw`text-[10px] uppercase tracking-wide mb-0.5`,
                      { color: Colors.textSecondary },
                    ]}
                  >
                    {label}
                  </Text>
                  <Text
                    style={[tw`text-xs font-bold`, { color: color ?? Colors.textPrimary }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Asking price input */}
          <View style={tw`mb-6`}>
            <Text style={[tw`text-sm font-medium mb-1.5`, { color: Colors.textPrimary }]}>
              Asking Price{" "}
              <Text style={[tw`font-normal`, { color: Colors.textSecondary }]}>(in ₦, optional)</Text>
            </Text>
            <View
              style={[
                tw`flex-row items-center rounded-xl border px-4`,
                { borderColor: Colors.inputBorder, backgroundColor: Colors.inputBg },
              ]}
            >
              <Text style={[tw`text-sm mr-1`, { color: Colors.textSecondary }]}>₦</Text>
              <TextInput
                style={[tw`flex-1 py-3.5 text-sm`, { color: Colors.textPrimary }]}
                keyboardType="decimal-pad"
                placeholder={
                  pricing
                    ? `${(pricing.minPrice / 100).toLocaleString()} – ${(pricing.maxPrice / 100).toLocaleString()}`
                    : "Enter amount"
                }
                placeholderTextColor={Colors.textMuted}
                value={askingPrice}
                onChangeText={setAskingPrice}
              />
            </View>
            {pricing ? (
              <Text style={[tw`text-xs mt-1`, { color: Colors.textSecondary }]}>
                Must be between {formatNaira(pricing.minPrice)} and {formatNaira(pricing.maxPrice)}.
              </Text>
            ) : null}
          </View>

          {/* Actions */}
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setModalVisible(false)}
              style={[
                tw`flex-1 py-3 px-4 rounded-xl items-center border`,
                { borderColor: Colors.divider },
              ]}
            >
              <Text style={[tw`text-sm font-semibold`, { color: Colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || pricingQuery.isLoading}
              style={[
                tw`flex-1 py-3 px-4 rounded-xl items-center`,
                {
                  backgroundColor:
                    submitMutation.isPending || pricingQuery.isLoading
                      ? Colors.divider
                      : Colors.brand,
                },
              ]}
            >
              {submitMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={tw`text-white text-sm font-bold`}>Submit Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
