import { useState } from "react";
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
import SelectInput from "@/components/ui/select-input";
import { useProperty } from "@/lib/queries/investor";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";
import apiClient, { type ApiResponse } from "@/lib/api";
import { extract_message } from "@/helpers/apihelpers";

const schema = z.object({
  installment: z.boolean(),
  plots: z.number().min(1, "Must buy at least 1 plot"),
  installmentDuration: z.number().optional(),
  installmentFrequency: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface InstallmentInvestmentResponse {
  id: string;
  propertyId: string;
  userId: string;
  quantity: number;
  amountPaid: number;
  installmentDuration: number;
  installmentFrequency: string;
  nextPaymentDate: string;
  status: string;
}

export default function LandBanking() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const router = useRouter();
  const query = useProperty(propertyId);

  const [payInstallment, setPayInstallment] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      installment: false,
      plots: 1,
      installmentDuration: undefined,
      installmentFrequency: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: {
      propertyId: string;
      amountPaid: number;
      quantity: number;
      installmentDuration?: number;
      installmentFrequency?: string;
    }) => {
      const resp = await apiClient.post("/investments/", data);
      return resp.data as ApiResponse<InstallmentInvestmentResponse>;
    },
    onSuccess: (data) => router.replace(`/investor/invesment/${data.data.id}`),
    onError: (error: AxiosError<ApiResponse>) => toast.error(extract_message(error)),
  });

  const onSubmit = (values: FormData, amountToPay: number) => {
    if (!propertyId) return;
    if (payInstallment) {
      if (!values.installmentDuration || !values.installmentFrequency) {
        toast.error("Please select installment duration and frequency");
        return;
      }
    }
    return mutation.mutate({
      propertyId,
      amountPaid: amountToPay,
      quantity: values.plots,
      ...(values.installmentDuration && { installmentDuration: values.installmentDuration }),
      ...(values.installmentFrequency && { installmentFrequency: values.installmentFrequency }),
    });
  };

  const loading = mutation.isPending;
  const error = mutation.error;

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: "#fff" }]} edges={["top", "bottom"]}>
      <PageLoader query={query} loadingText="Loading property...">
        {(response) => {
          const property = response.data;
          const plots = form.watch("plots") || 1;
          const installmentDuration = form.watch("installmentDuration");

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

          const minFirstDeposit =
            property.minimumInstallmentAmount || Math.round(fullTotal * 0.2);

          let amountToPay = fullTotal;
          let perInstallment = 0;
          if (payInstallment && installmentDuration && installmentDuration > 0) {
            amountToPay = minFirstDeposit;
            const remaining = fullTotal - minFirstDeposit;
            perInstallment = Math.round(remaining / installmentDuration);
          }

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

                <ScrollView
                  style={tw`flex-1`}
                  contentContainerStyle={tw`p-4 pb-32`}
                  showsVerticalScrollIndicator={false}
                >
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

                  {/* Payment Method Toggle */}
                  <View style={tw`mb-6`}>
                    <Text style={[tw`text-sm font-semibold mb-3`, { color: Colors.textPrimary }]}>
                      Payment Method
                    </Text>
                    <View style={tw`flex-row gap-3`}>
                      <TouchableOpacity
                        onPress={() => {
                          setPayInstallment(false);
                          form.setValue("installment", false);
                        }}
                        style={[
                          tw`flex-1 py-3 px-4 rounded-xl border`,
                          {
                            backgroundColor: !payInstallment ? Colors.brand + "15" : "#fff",
                            borderColor: !payInstallment ? Colors.brand : Colors.divider,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            tw`text-sm font-semibold text-center`,
                            { color: !payInstallment ? Colors.brand : Colors.textSecondary },
                          ]}
                        >
                          Full Payment
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setPayInstallment(true);
                          form.setValue("installment", true);
                        }}
                        style={[
                          tw`flex-1 py-3 px-4 rounded-xl border`,
                          {
                            backgroundColor: payInstallment ? Colors.brand + "15" : "#fff",
                            borderColor: payInstallment ? Colors.brand : Colors.divider,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            tw`text-sm font-semibold text-center`,
                            { color: payInstallment ? Colors.brand : Colors.textSecondary },
                          ]}
                        >
                          Installment
                        </Text>
                      </TouchableOpacity>
                    </View>
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

                  {/* Installment Options */}
                  {payInstallment && (
                    <View style={tw`mb-6 gap-4`}>
                      <Controller
                        control={form.control}
                        name="installmentDuration"
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                          <SelectInput
                            label="Installment Duration (months)"
                            placeholder="Select duration"
                            value={value?.toString() || ""}
                            onChange={(val: string) => onChange(parseInt(val) || undefined)}
                            options={[
                              { label: "3 months", value: "3" },
                              { label: "6 months", value: "6" },
                              { label: "9 months", value: "9" },
                              { label: "12 months", value: "12" },
                            ]}
                            error={error?.message}
                          />
                        )}
                      />

                      <Controller
                        control={form.control}
                        name="installmentFrequency"
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                          <SelectInput
                            label="Payment Frequency"
                            placeholder="Select frequency"
                            value={value || ""}
                            onChange={onChange}
                            options={[
                              { label: "Weekly", value: "WEEKLY" },
                              { label: "Monthly", value: "MONTHLY" },
                            ]}
                            error={error?.message}
                          />
                        )}
                      />
                    </View>
                  )}

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

                      {payInstallment && (
                        <>
                          <View
                            style={[
                              tw`flex-row justify-between pt-2 mt-2 border-t`,
                              { borderTopColor: Colors.divider },
                            ]}
                          >
                            <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>
                              First Deposit (Min)
                            </Text>
                            <Text style={[tw`text-sm font-bold`, { color: Colors.brand }]}>
                              {fmt(minFirstDeposit)}
                            </Text>
                          </View>

                          {installmentDuration && installmentDuration > 0 && (
                            <View style={tw`flex-row justify-between`}>
                              <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
                                Per Installment
                              </Text>
                              <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>
                                {fmt(perInstallment)}
                              </Text>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  </View>

                  {/* Info */}
                  <View style={[tw`flex-row gap-3 p-4 rounded-xl mb-4`, { backgroundColor: Colors.brand + "10" }]}>
                    <Ionicons name="information-circle" size={20} color={Colors.brand} />
                    <Text style={[tw`text-xs flex-1 leading-5`, { color: Colors.textSecondary }]}>
                      {payInstallment
                        ? "You'll pay the first deposit now and complete the remaining payments in scheduled installments."
                        : buyBackOption
                        ? `Buy-back option available after ${holdingPeriod ?? "?"} month holding period.`
                        : "No buy-back option for this land banking investment."}
                    </Text>
                  </View>

                  {error && (
                    <View style={[tw`flex-row gap-2 p-3 rounded-xl mb-4`, { backgroundColor: "#FEE2E2" }]}>
                      <Ionicons name="alert-circle" size={18} color="#DC2626" />
                      <Text style={[tw`text-xs flex-1`, { color: "#DC2626" }]}>
                        {error instanceof Error ? error.message : "An error occurred"}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </ScrollView>

              {/* CTA */}
              <View
                style={[
                  tw`absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3`,
                  { backgroundColor: "#fff", borderTopWidth: 1, borderColor: Colors.divider },
                ]}
              >
                <View style={tw`flex-row items-center justify-between mb-3`}>
                  <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
                    {payInstallment ? "First Payment" : "Total Amount"}
                  </Text>
                  <Text style={[tw`text-xl font-bold`, { color: Colors.brand }]}>{fmt(amountToPay)}</Text>
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
