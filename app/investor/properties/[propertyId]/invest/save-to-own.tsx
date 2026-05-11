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

import PageLoader from "@/components/layout/PageLoader";
import { useProperty } from "@/lib/queries/investor";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";
import apiClient, { type ApiResponse } from "@/lib/api";
import { extract_message } from "@/helpers/apihelpers";

// ─── Types & Schema ──────────────────────────────────────────────────────────

const schema = z.object({
  savingsFrequency: z.enum(["WEEKLY", "MONTHLY"]),
  savingsDuration: z.number(),
});

type FormData = z.infer<typeof schema>;

const FREQUENCIES = ["WEEKLY", "MONTHLY"] as const;
const DURATIONS = [3, 6, 12] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export default function SaveToOwnInvestment() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const router = useRouter();
  const query = useProperty(propertyId);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      savingsFrequency: "MONTHLY",
      savingsDuration: 12,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: {
      propertyId: string;
      amountPaid: number;
      savingsFrequency: "WEEKLY" | "MONTHLY";
      savingsDuration: number;
    }) => {
      const resp = await apiClient.post("/investments/", data);
      return resp.data as ApiResponse<{ id: string }>;
    },
    onSuccess: (data) => {
      router.replace(`/investor/invesment/${data.data.id}`);
    },
    onError: (error: AxiosError<ApiResponse>) => {
      toast.error(extract_message(error));
    },
  });

  const onSubmit = (values: FormData, amountPaid: number) => {
    if (!propertyId) return;
    mutation.mutate({
      propertyId,
      amountPaid,
      savingsFrequency: values.savingsFrequency,
      savingsDuration: values.savingsDuration,
    });
  };

  const loading = mutation.isPending;
  const error = mutation.error;

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: "#fff" }]} edges={["top", "bottom"]}>
      <PageLoader query={query} loadingText="Loading property...">
        {(response) => {
          const property = response.data;

          // ─── Calculations ───────────────────────────────────────────────
          const savingsFrequency = form.watch("savingsFrequency");
          const savingsDuration = form.watch("savingsDuration");

          const basePrice = property.basePrice || 0;
          const fees = property.additionalFees || [];
          const additionalFeesTotal = fees.reduce((sum, fee) => sum + fee.amount, 0);
          const systemChargePercentage = property.systemCharges?.platformChargePercentage || 0;
          const systemCharge = Math.round(basePrice * (systemChargePercentage / 100));
          const fullTotal = basePrice + additionalFeesTotal + systemCharge;

          // Minimum per period = ceil(total / duration)
          const minimumInstallment = Math.ceil(fullTotal / savingsDuration / 100) * 100;
          const amountToPay = minimumInstallment;

          const formatCurrency = (kobo: number) => `₦${(kobo / 100).toLocaleString()}`;
          const periodLabel = savingsFrequency === "WEEKLY" ? "week" : "month";

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
                  <TouchableOpacity onPress={() => router.back()} style={tw`mr-3`}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <Text style={[tw`text-lg font-bold flex-1`, { color: Colors.textPrimary }]}>
                    Save to Own
                  </Text>
                </View>

                <View style={tw`p-4 pb-40`}>
                  {/* Property Info */}
                  <View style={tw`mb-6`}>
                    <Text style={[tw`text-base font-bold mb-1`, { color: Colors.textPrimary }]}>
                      {property.propertyTitle}
                    </Text>
                    <View style={tw`flex-row items-center gap-1`}>
                      <Ionicons name="location-outline" size={14} color={Colors.brand} />
                      <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
                        {property.location}
                      </Text>
                    </View>
                  </View>

                  {/* Savings Frequency */}
                  <View style={tw`mb-6`}>
                    <Text
                      style={[tw`text-sm font-semibold mb-3`, { color: Colors.textPrimary }]}
                    >
                      Savings Frequency
                    </Text>
                    <View style={tw`flex-row gap-3`}>
                      {FREQUENCIES.map((freq) => {
                        const selected = savingsFrequency === freq;
                        return (
                          <TouchableOpacity
                            key={freq}
                            onPress={() => form.setValue("savingsFrequency", freq)}
                            style={[
                              tw`flex-1 py-3 px-4 rounded-xl border items-center`,
                              {
                                backgroundColor: selected ? Colors.brand + "15" : "#fff",
                                borderColor: selected ? Colors.brand : Colors.divider,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                tw`text-sm font-semibold`,
                                { color: selected ? Colors.brand : Colors.textSecondary },
                              ]}
                            >
                              {freq.charAt(0) + freq.slice(1).toLowerCase()}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Savings Duration */}
                  <View style={tw`mb-6`}>
                    <Text
                      style={[tw`text-sm font-semibold mb-3`, { color: Colors.textPrimary }]}
                    >
                      Savings Duration
                    </Text>
                    <View style={tw`flex-row gap-3`}>
                      {DURATIONS.map((dur) => {
                        const selected = savingsDuration === dur;
                        return (
                          <TouchableOpacity
                            key={dur}
                            onPress={() => form.setValue("savingsDuration", dur)}
                            style={[
                              tw`flex-1 py-3 px-4 rounded-xl border items-center`,
                              {
                                backgroundColor: selected ? Colors.brand + "15" : "#fff",
                                borderColor: selected ? Colors.brand : Colors.divider,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                tw`text-sm font-semibold`,
                                { color: selected ? Colors.brand : Colors.textSecondary },
                              ]}
                            >
                              {dur}{savingsFrequency === "WEEKLY" ? "w" : "m"}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Breakdown */}
                  <View
                    style={[
                      tw`rounded-xl p-4 mb-6`,
                      { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: Colors.divider },
                    ]}
                  >
                    <Text
                      style={[tw`text-base font-bold mb-3`, { color: Colors.textPrimary }]}
                    >
                      Investment Breakdown
                    </Text>

                    <View style={tw`gap-2`}>
                      <View style={tw`flex-row justify-between`}>
                        <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
                          Base Price
                        </Text>
                        <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>
                          {formatCurrency(basePrice)}
                        </Text>
                      </View>

                      {fees.length > 0 && (
                        <View style={tw`flex-row justify-between`}>
                          <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
                            Management Fees
                          </Text>
                          <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>
                            {formatCurrency(additionalFeesTotal)}
                          </Text>
                        </View>
                      )}

                      {systemChargePercentage > 0 && (
                        <View style={tw`flex-row justify-between`}>
                          <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
                            Platform Charge ({systemChargePercentage}%)
                          </Text>
                          <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>
                            {formatCurrency(systemCharge)}
                          </Text>
                        </View>
                      )}

                      <View
                        style={[
                          tw`flex-row justify-between pt-2 mt-1 border-t`,
                          { borderTopColor: Colors.divider },
                        ]}
                      >
                        <Text style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}>
                          Total Target
                        </Text>
                        <Text style={[tw`text-sm font-bold`, { color: Colors.brand }]}>
                          {formatCurrency(fullTotal)}
                        </Text>
                      </View>

                      <View
                        style={[
                          tw`flex-row justify-between pt-2 mt-1 border-t`,
                          { borderTopColor: Colors.divider },
                        ]}
                      >
                        <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>
                          Per {periodLabel}
                        </Text>
                        <Text style={[tw`text-sm font-bold`, { color: Colors.brand }]}>
                          {formatCurrency(minimumInstallment)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Info box */}
                  <View
                    style={[
                      tw`flex-row gap-3 p-4 rounded-xl mb-4`,
                      { backgroundColor: Colors.brand + "10" },
                    ]}
                  >
                    <Ionicons name="information-circle" size={20} color={Colors.brand} />
                    <Text style={[tw`text-xs flex-1 leading-5`, { color: Colors.textSecondary }]}>
                      You will save {formatCurrency(minimumInstallment)} {savingsFrequency.toLowerCase()} for{" "}
                      {savingsDuration} {periodLabel}s toward full ownership of this property.
                    </Text>
                  </View>

                  {/* Error */}
                  {error && (
                    <View
                      style={[
                        tw`flex-row gap-2 p-3 rounded-xl mb-4`,
                        { backgroundColor: "#FEE2E2" },
                      ]}
                    >
                      <Ionicons name="alert-circle" size={18} color="#DC2626" />
                      <Text style={[tw`text-xs flex-1`, { color: "#DC2626" }]}>
                        {error instanceof Error ? error.message : "An error occurred"}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Fixed Bottom CTA */}
              <View
                style={[
                  tw`absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3`,
                  { backgroundColor: "#fff", borderTopWidth: 1, borderColor: Colors.divider },
                ]}
              >
                <View style={tw`flex-row items-center justify-between mb-3`}>
                  <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
                    First Payment ({savingsDuration} {periodLabel}s)
                  </Text>
                  <Text style={[tw`text-xl font-bold`, { color: Colors.brand }]}>
                    {formatCurrency(amountToPay)}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={form.handleSubmit((values) => onSubmit(values, amountToPay))}
                  disabled={loading}
                  style={[
                    tw`w-full py-4 rounded-2xl items-center`,
                    { backgroundColor: loading ? Colors.divider : Colors.brand },
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={tw`text-white text-base font-bold`}>Proceed to Payment</Text>
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
