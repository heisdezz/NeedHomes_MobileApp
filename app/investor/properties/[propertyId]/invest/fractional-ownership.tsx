import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner-native";
import { useEffect } from "react";

import PageLoader from "@/components/layout/PageLoader";
import { useProperty } from "@/lib/queries/investor";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";
import apiClient, { type ApiResponse } from "@/lib/api";
import { extract_message } from "@/helpers/apihelpers";

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  quantity: z.number().min(1),
  selectedReturnDays: z.number().min(1, "Please select a return duration"),
});
type FormData = z.infer<typeof schema>;

// ─── Component ───────────────────────────────────────────────────────────────

export default function FractionalOwnership() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const router = useRouter();
  const query = useProperty(propertyId);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1, selectedReturnDays: 0 },
  });

  const mutation = useMutation({
    mutationFn: async (data: {
      propertyId: string;
      amountPaid: number;
      quantity: number;
      selectedReturnDays: number;
    }) => {
      const resp = await apiClient.post("/investments/", {
        ...data,
        paymentOption: "FULL_PAYMENT",
      });
      return resp.data as ApiResponse<{ id: string }>;
    },
    onSuccess: (data) => {
      toast.success("Investment successful!");
      router.replace(`/investor/invesment/${data.data.id}`);
    },
    onError: (error: AxiosError<ApiResponse>) =>
      toast.error(extract_message(error)),
  });

  const loading = mutation.isPending;

  return (
    <SafeAreaView
      style={[tw`flex-1`, { backgroundColor: "#fff" }]}
      edges={["top", "bottom"]}
    >
      <PageLoader query={query} loadingText="Loading property...">
        {(response) => {
          const property = response.data;

          // ─── Calculations ─────────────────────────────────────────────
          const quantity = form.watch("quantity") || 1;
          const selectedReturnDays = form.watch("selectedReturnDays");

          const pricePerShare = property.pricePerShare || 0;
          const minimumShares = property.minimumShares || 1;
          const availableShares = property.availableShares ?? 0;
          const fees = property.additionalFees || [];
          const additionalFeesTotal = fees.reduce(
            (sum, fee) => sum + fee.amount,
            0,
          );
          const systemChargePercentage =
            property.systemCharges?.platformChargePercentage || 0;

          const sharesTotal = pricePerShare * quantity;
          const systemCharge = Math.round(
            sharesTotal * (systemChargePercentage / 100),
          );
          const fullTotal = sharesTotal + additionalFeesTotal + systemCharge;

          const tierOptions = Object.entries(property.returnTiers ?? {})
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([days, rate]) => ({
              days: Number(days),
              rate: Number(rate),
            }));

          const selectedTier = tierOptions.find(
            (t) => t.days === selectedReturnDays,
          );
          const expectedPayout = selectedTier
            ? Math.round(fullTotal * (1 + selectedTier.rate / 100))
            : null;

          const fmt = (kobo: number) => `₦${(kobo / 100).toLocaleString()}`;

          // Set quantity to minimumShares when property loads
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            if (minimumShares > 1) form.setValue("quantity", minimumShares);
          }, [minimumShares]);

          return (
            <>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View
                  style={[
                    tw`flex-row items-center px-4 py-3 border-b`,
                    { borderBottomColor: Colors.divider },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={tw`mr-3`}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={24}
                      color={Colors.textPrimary}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[
                      tw`text-lg font-bold flex-1`,
                      { color: Colors.textPrimary },
                    ]}
                  >
                    Fractional Ownership
                  </Text>
                </View>

                <View style={tw`p-4 pb-40`}>
                  {/* Property Info */}
                  <View style={tw`mb-6`}>
                    <Text
                      style={[
                        tw`text-base font-bold mb-1`,
                        { color: Colors.textPrimary },
                      ]}
                    >
                      {property.propertyTitle}
                    </Text>
                    <View style={tw`flex-row items-center gap-1`}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={Colors.brand}
                      />
                      <Text
                        style={[tw`text-sm`, { color: Colors.textSecondary }]}
                      >
                        {property.location}
                      </Text>
                    </View>
                  </View>

                  {/* Share stats */}
                  <View style={tw`flex-row gap-3 mb-6`}>
                    {[
                      { label: "Price / Share", value: fmt(pricePerShare) },
                      { label: "Min. Shares", value: String(minimumShares) },
                      { label: "Available", value: String(availableShares) },
                    ].map(({ label, value }) => (
                      <View
                        key={label}
                        style={[
                          tw`flex-1 rounded-xl p-3`,
                          {
                            backgroundColor: "#F9FAFB",
                            borderWidth: 1,
                            borderColor: Colors.divider,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            tw`text-xs mb-1`,
                            { color: Colors.textSecondary },
                          ]}
                        >
                          {label}
                        </Text>
                        <Text
                          style={[
                            tw`text-sm font-bold`,
                            { color: Colors.textPrimary },
                          ]}
                        >
                          {value}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Holding period notice */}
                  {property.fractionalHoldingPeriodDays != null && (
                    <View
                      style={[
                        tw`flex-row gap-3 p-3 rounded-xl mb-6`,
                        {
                          backgroundColor: "#FEF3C7",
                          borderWidth: 1,
                          borderColor: "#FCD34D",
                        },
                      ]}
                    >
                      <Ionicons name="time-outline" size={18} color="#D97706" />
                      <Text
                        style={[
                          tw`text-xs flex-1 leading-5`,
                          { color: "#92400E" },
                        ]}
                      >
                        Minimum holding period:{" "}
                        {property.fractionalHoldingPeriodDays} days. Early exit
                        may incur a penalty.
                      </Text>
                    </View>
                  )}

                  {/* Quantity stepper */}
                  <View
                    style={[
                      tw`rounded-xl p-4 mb-6`,
                      {
                        backgroundColor: "#F9FAFB",
                        borderWidth: 1,
                        borderColor: Colors.divider,
                      },
                    ]}
                  >
                    <View
                      style={tw`flex-row items-center justify-between mb-1`}
                    >
                      <Text
                        style={[
                          tw`text-sm font-bold`,
                          { color: Colors.textPrimary },
                        ]}
                      >
                        Number of Shares
                      </Text>
                      <View
                        style={[
                          tw`px-2 py-0.5 rounded-full`,
                          { backgroundColor: Colors.brand + "15" },
                        ]}
                      >
                        <Text
                          style={[
                            tw`text-xs font-semibold`,
                            { color: Colors.brand },
                          ]}
                        >
                          Min: {minimumShares}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={tw`flex-row items-center justify-between mt-3`}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          if (quantity > minimumShares)
                            form.setValue("quantity", quantity - 1);
                        }}
                        disabled={quantity <= minimumShares}
                        style={[
                          tw`w-10 h-10 rounded-xl items-center justify-center border`,
                          {
                            borderColor:
                              quantity <= minimumShares
                                ? Colors.divider
                                : Colors.brand,
                            backgroundColor:
                              quantity <= minimumShares
                                ? "#F9FAFB"
                                : Colors.brand + "10",
                          },
                        ]}
                      >
                        <Ionicons
                          name="remove"
                          size={20}
                          color={
                            quantity <= minimumShares
                              ? Colors.textMuted
                              : Colors.brand
                          }
                        />
                      </TouchableOpacity>

                      <Text
                        style={[
                          tw`text-2xl font-bold`,
                          { color: Colors.textPrimary },
                        ]}
                      >
                        {quantity}
                      </Text>

                      <TouchableOpacity
                        onPress={() => {
                          if (quantity < availableShares)
                            form.setValue("quantity", quantity + 1);
                        }}
                        disabled={
                          availableShares > 0 && quantity >= availableShares
                        }
                        style={[
                          tw`w-10 h-10 rounded-xl items-center justify-center border`,
                          {
                            borderColor:
                              availableShares > 0 && quantity >= availableShares
                                ? Colors.divider
                                : Colors.brand,
                            backgroundColor:
                              availableShares > 0 && quantity >= availableShares
                                ? "#F9FAFB"
                                : Colors.brand + "10",
                          },
                        ]}
                      >
                        <Ionicons
                          name="add"
                          size={20}
                          color={
                            availableShares > 0 && quantity >= availableShares
                              ? Colors.textMuted
                              : Colors.brand
                          }
                        />
                      </TouchableOpacity>
                    </View>

                    <Text
                      style={[
                        tw`text-xs text-center mt-2`,
                        { color: Colors.textSecondary },
                      ]}
                    >
                      Subtotal: {fmt(sharesTotal)}
                    </Text>
                  </View>

                  {/* Return tier selector */}
                  {tierOptions.length > 0 && (
                    <View style={tw`mb-6`}>
                      <Text
                        style={[
                          tw`text-sm font-bold mb-3`,
                          { color: Colors.textPrimary },
                        ]}
                      >
                        Select Return Duration
                      </Text>
                      <View style={tw`gap-2`}>
                        {tierOptions.map((tier) => {
                          const selected = selectedReturnDays === tier.days;
                          return (
                            <TouchableOpacity
                              key={tier.days}
                              onPress={() =>
                                form.setValue("selectedReturnDays", tier.days)
                              }
                              style={[
                                tw`flex-row items-center justify-between p-4 rounded-xl border`,
                                {
                                  borderColor: selected
                                    ? Colors.brand
                                    : Colors.divider,
                                  backgroundColor: selected
                                    ? Colors.brand + "08"
                                    : "#fff",
                                },
                              ]}
                            >
                              <View style={tw`flex-row items-center gap-3`}>
                                <View
                                  style={[
                                    tw`w-5 h-5 rounded-full border-2 items-center justify-center`,
                                    {
                                      borderColor: selected
                                        ? Colors.brand
                                        : Colors.divider,
                                    },
                                  ]}
                                >
                                  {selected && (
                                    <View
                                      style={[
                                        tw`w-2.5 h-2.5 rounded-full`,
                                        { backgroundColor: Colors.brand },
                                      ]}
                                    />
                                  )}
                                </View>
                                <View>
                                  <Text
                                    style={[
                                      tw`text-sm font-semibold`,
                                      { color: Colors.textPrimary },
                                    ]}
                                  >
                                    {tier.days} days
                                  </Text>
                                  {property.fractionalHoldingPeriodDays !=
                                    null && (
                                    <Text
                                      style={[
                                        tw`text-xs`,
                                        { color: Colors.textMuted },
                                      ]}
                                    >
                                      Holding:{" "}
                                      {property.fractionalHoldingPeriodDays}{" "}
                                      days
                                    </Text>
                                  )}
                                </View>
                              </View>
                              <Text
                                style={[
                                  tw`text-sm font-bold`,
                                  { color: "#059669" },
                                ]}
                              >
                                {tier.rate}% return
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* Breakdown */}
                  <View
                    style={[
                      tw`rounded-xl p-4 mb-6`,
                      {
                        backgroundColor: "#F9FAFB",
                        borderWidth: 1,
                        borderColor: Colors.divider,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        tw`text-base font-bold mb-3`,
                        { color: Colors.textPrimary },
                      ]}
                    >
                      Investment Breakdown
                    </Text>
                    <View style={tw`gap-2`}>
                      <View style={tw`flex-row justify-between`}>
                        <Text
                          style={[tw`text-sm`, { color: Colors.textSecondary }]}
                        >
                          Shares × {quantity}
                        </Text>
                        <Text
                          style={[
                            tw`text-sm font-semibold`,
                            { color: Colors.textPrimary },
                          ]}
                        >
                          {fmt(sharesTotal)}
                        </Text>
                      </View>
                      {fees.length > 0 && (
                        <View style={tw`flex-row justify-between`}>
                          <Text
                            style={[
                              tw`text-sm`,
                              { color: Colors.textSecondary },
                            ]}
                          >
                            Management Fees
                          </Text>
                          <Text
                            style={[
                              tw`text-sm font-semibold`,
                              { color: Colors.textPrimary },
                            ]}
                          >
                            {fmt(additionalFeesTotal)}
                          </Text>
                        </View>
                      )}

                      <View
                        style={[
                          tw`flex-row justify-between pt-2 mt-1 border-t`,
                          { borderTopColor: Colors.divider },
                        ]}
                      >
                        <Text
                          style={[
                            tw`text-base font-bold`,
                            { color: Colors.textPrimary },
                          ]}
                        >
                          Total
                        </Text>
                        <Text
                          style={[
                            tw`text-base font-bold`,
                            { color: Colors.brand },
                          ]}
                        >
                          {fmt(fullTotal)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Expected payout */}
                  {selectedTier && expectedPayout && (
                    <View
                      style={[
                        tw`flex-row items-center justify-between p-4 rounded-xl mb-4`,
                        {
                          backgroundColor: "#D1FAE5",
                          borderWidth: 1,
                          borderColor: "#6EE7B7",
                        },
                      ]}
                    >
                      <View style={tw`flex-row items-center gap-2`}>
                        <Ionicons
                          name="trending-up"
                          size={18}
                          color="#059669"
                        />
                        <Text
                          style={[
                            tw`text-sm font-medium`,
                            { color: "#065F46" },
                          ]}
                        >
                          Expected after {selectedTier.days} days
                        </Text>
                      </View>
                      <Text
                        style={[tw`text-sm font-bold`, { color: "#059669" }]}
                      >
                        {fmt(expectedPayout)}
                      </Text>
                    </View>
                  )}

                  {mutation.isError && (
                    <View
                      style={[
                        tw`flex-row gap-2 p-3 rounded-xl mb-4`,
                        { backgroundColor: "#FEE2E2" },
                      ]}
                    >
                      <Ionicons name="alert-circle" size={18} color="#DC2626" />
                      <Text style={[tw`text-xs flex-1`, { color: "#DC2626" }]}>
                        {mutation.error instanceof Error
                          ? mutation.error.message
                          : "An error occurred"}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* CTA */}
              <View
                style={[
                  tw`absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3`,
                  {
                    backgroundColor: "#fff",
                    borderTopWidth: 1,
                    borderColor: Colors.divider,
                  },
                ]}
              >
                <View style={tw`flex-row items-center justify-between mb-3`}>
                  <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
                    Total Amount
                  </Text>
                  <Text
                    style={[tw`text-xl font-bold`, { color: Colors.brand }]}
                  >
                    {fmt(fullTotal)}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={form.handleSubmit(
                    (values) => {
                      if (!values.selectedReturnDays) {
                        toast.error("Please select a return duration");
                        return;
                      }
                      mutation.mutate({
                        propertyId,
                        amountPaid: fullTotal,
                        quantity: values.quantity,
                        selectedReturnDays: values.selectedReturnDays,
                      });
                    },
                    () => toast.error("Please select a return duration"),
                  )}
                  disabled={loading}
                  style={[
                    tw`w-full py-4 rounded-2xl items-center`,
                    {
                      backgroundColor: loading ? Colors.divider : Colors.brand,
                    },
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={tw`text-white text-base font-bold`}>
                      Proceed to Payment
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          );
        }}
      </PageLoader>
    </SafeAreaView>
  );
}
