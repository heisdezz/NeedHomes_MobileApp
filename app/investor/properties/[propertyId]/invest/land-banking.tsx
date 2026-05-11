import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner-native";

import PageLoader from "@/components/layout/PageLoader";
import FormInput from "@/components/ui/form-input";
import { useProperty } from "@/lib/queries/investor";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";
import apiClient, { type ApiResponse } from "@/lib/api";
import { extract_message } from "@/helpers/apihelpers";

const schema = z.object({
  plots: z.number().min(1, "Must buy at least 1 plot"),
});
type FormData = z.infer<typeof schema>;

export default function LandBanking() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const router = useRouter();
  const query = useProperty(propertyId);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { plots: 1 },
  });

  const mutation = useMutation({
    mutationFn: async (data: { propertyId: string; amountPaid: number; quantity: number }) => {
      const resp = await apiClient.post("/investments/", data);
      return resp.data as ApiResponse<{ id: string }>;
    },
    onSuccess: (data) => router.replace(`/investor/invesment/${data.data.id}`),
    onError: (error: AxiosError<ApiResponse>) => toast.error(extract_message(error)),
  });

  const loading = mutation.isPending;

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: "#fff" }]} edges={["top", "bottom"]}>
      <PageLoader query={query} loadingText="Loading property...">
        {(response) => {
          const property = response.data;
          const plots = form.watch("plots") || 1;

          const pricePerPlot = property.pricePerPlot || property.basePrice || 0;
          const availablePlots = property.availablePlots;
          const holdingPeriod = property.holdingPeriod;
          const buyBackOption = property.buyBackOption;

          const plotsTotal = pricePerPlot * plots;
          const systemChargePercentage = property.systemCharges?.platformChargePercentage || 0;
          const systemCharge = Math.round(plotsTotal * (systemChargePercentage / 100));
          const fees = property.additionalFees || [];
          const additionalFeesTotal = fees.reduce((sum, fee) => sum + fee.amount, 0);
          const fullTotal = plotsTotal + additionalFeesTotal + systemCharge;

          const fmt = (kobo: number) => `₦${(kobo / 100).toLocaleString()}`;

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
                    Land Banking
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

                  {/* Plot stats */}
                  <View style={tw`flex-row gap-3 mb-6`}>
                    {[
                      { label: "Price / Plot", value: fmt(pricePerPlot) },
                      ...(availablePlots != null ? [{ label: "Available", value: String(availablePlots) }] : []),
                      ...(holdingPeriod != null ? [{ label: "Hold Period", value: `${holdingPeriod}mo` }] : []),
                    ].map(({ label, value }) => (
                      <View
                        key={label}
                        style={[
                          tw`flex-1 rounded-xl p-3`,
                          { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: Colors.divider },
                        ]}
                      >
                        <Text style={[tw`text-xs mb-1`, { color: Colors.textSecondary }]}>{label}</Text>
                        <Text style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}>{value}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Plots input */}
                  <View style={tw`mb-6`}>
                    <Controller
                      control={form.control}
                      name="plots"
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <FormInput
                          label="Number of Plots"
                          placeholder="Enter number of plots"
                          keyboardType="numeric"
                          value={value?.toString() || ""}
                          onChangeText={(text) => onChange(parseInt(text) || 1)}
                          error={error?.message}
                        />
                      )}
                    />
                  </View>

                  {/* Breakdown */}
                  <View
                    style={[
                      tw`rounded-xl p-4 mb-6`,
                      { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: Colors.divider },
                    ]}
                  >
                    <Text style={[tw`text-base font-bold mb-3`, { color: Colors.textPrimary }]}>
                      Investment Breakdown
                    </Text>
                    <View style={tw`gap-2`}>
                      <View style={tw`flex-row justify-between`}>
                        <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>Price per plot</Text>
                        <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>{fmt(pricePerPlot)}</Text>
                      </View>
                      <View style={tw`flex-row justify-between`}>
                        <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>Plots × {plots}</Text>
                        <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>{fmt(plotsTotal)}</Text>
                      </View>
                      {fees.length > 0 && (
                        <View style={tw`flex-row justify-between`}>
                          <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>Management Fees</Text>
                          <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>{fmt(additionalFeesTotal)}</Text>
                        </View>
                      )}
                      {systemChargePercentage > 0 && (
                        <View style={tw`flex-row justify-between`}>
                          <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
                            Platform Charge ({systemChargePercentage}%)
                          </Text>
                          <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>{fmt(systemCharge)}</Text>
                        </View>
                      )}
                      <View
                        style={[
                          tw`flex-row justify-between pt-2 mt-1 border-t`,
                          { borderTopColor: Colors.divider },
                        ]}
                      >
                        <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>Total</Text>
                        <Text style={[tw`text-base font-bold`, { color: Colors.brand }]}>{fmt(fullTotal)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Buy-back / holding period info */}
                  <View style={[tw`flex-row gap-3 p-4 rounded-xl mb-4`, { backgroundColor: Colors.brand + "10" }]}>
                    <Ionicons name="information-circle" size={20} color={Colors.brand} />
                    <Text style={[tw`text-xs flex-1 leading-5`, { color: Colors.textSecondary }]}>
                      {buyBackOption
                        ? `Buy-back option available after ${holdingPeriod ?? "?"} month holding period.`
                        : "No buy-back option for this land banking investment."}
                    </Text>
                  </View>

                  {mutation.isError && (
                    <View style={[tw`flex-row gap-2 p-3 rounded-xl mb-4`, { backgroundColor: "#FEE2E2" }]}>
                      <Ionicons name="alert-circle" size={18} color="#DC2626" />
                      <Text style={[tw`text-xs flex-1`, { color: "#DC2626" }]}>
                        {mutation.error instanceof Error ? mutation.error.message : "An error occurred"}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* CTA */}
              <View
                style={[
                  tw`absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3`,
                  { backgroundColor: "#fff", borderTopWidth: 1, borderColor: Colors.divider },
                ]}
              >
                <View style={tw`flex-row items-center justify-between mb-3`}>
                  <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>Total Amount</Text>
                  <Text style={[tw`text-xl font-bold`, { color: Colors.brand }]}>{fmt(fullTotal)}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={form.handleSubmit((values) =>
                    mutation.mutate({ propertyId, amountPaid: fullTotal, quantity: values.plots }),
                  )}
                  disabled={loading}
                  style={[
                    tw`w-full py-4 rounded-2xl items-center`,
                    { backgroundColor: loading ? Colors.divider : Colors.brand },
                  ]}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : (
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
