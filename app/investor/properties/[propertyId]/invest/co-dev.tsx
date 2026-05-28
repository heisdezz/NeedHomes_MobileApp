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

import PageLoader from "@/components/layout/PageLoader";
import SelectInput from "@/components/ui/select-input";
import { useProperty } from "@/lib/queries/investor";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";
import apiClient, { type ApiResponse } from "@/lib/api";
import { AxiosError } from "axios";
import { toast } from "sonner-native";
import { extract_message } from "@/helpers/apihelpers";

// ─── Types & Schema ──────────────────────────────────────────────────────────

const schema = z.object({
  installment: z.boolean(),
  amount: z.number().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
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

// ─── Component ───────────────────────────────────────────────────────────────

export default function CoDevInvestment() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const router = useRouter();
  const query = useProperty(propertyId);

  const [payInstallment, setPayInstallment] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      installment: false,
      amount: undefined,
      quantity: 1,
      installmentDuration: undefined,
      installmentFrequency: undefined,
    },
  });

  // ─── Mutations ───────────────────────────────────────────────────────────

  const installmentMutation = useMutation({
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
    onSuccess: (data) => {
      router.replace(`/investor/invesment/${data.data.id}`);
    },
    onError: (error: AxiosError<ApiResponse>) => {
      toast.error(extract_message(error));
      console.log(JSON.stringify(error));
      return;
    },
  });

  // ─── Submit Handler ──────────────────────────────────────────────────────

  const onSubmit = (values: FormData, amountToPay: number) => {
    if (!propertyId) return;
    if (payInstallment) {
      if (!values.installmentDuration || !values.installmentFrequency) {
        toast.error("Please select installment duration and frequency");
        return;
      }
    }
    return installmentMutation.mutate({
      propertyId,
      amountPaid: amountToPay,
      quantity: values.quantity,
      ...(values.installmentDuration && {
        installmentDuration: values.installmentDuration,
      }),
      ...(values.installmentFrequency && {
        installmentFrequency: values.installmentFrequency,
      }),
    });
  };

  const loading = installmentMutation.isPending;
  const error = installmentMutation.error;

  return (
    <SafeAreaView
      style={[tw`flex-1`, { backgroundColor: "#fff" }]}
      edges={["top", "bottom"]}
    >
      <PageLoader query={query} loadingText="Loading property...">
        {(response) => {
          const property = response.data;

          // ─── Calculations ──────────────────────────────────────────────

          const quantity = form.watch("quantity") || 1;
          const installmentDuration = form.watch("installmentDuration");
          const installmentFrequency = form.watch("installmentFrequency");

          const pricePerUnit = property.basePrice || 0;
          const unitTotal = pricePerUnit * quantity;

          // Additional fees
          const fees = property.additionalFees || [];
          const additionalFeesTotal = fees.reduce(
            (sum, fee) => sum + fee.amount,
            0,
          );

          // System charge
          const systemChargePercentage =
            property.systemCharges?.platformChargePercentage || 0;
          const systemCharge = Math.round(
            unitTotal * (systemChargePercentage / 100),
          );

          const fullTotal = unitTotal + additionalFeesTotal + systemCharge;

          // Minimum first deposit for installment
          const minFirstDeposit =
            property.minimumInstallmentAmount || Math.round(fullTotal * 0.2);

          // Installment calculation
          let amountToPay = fullTotal;
          let perInstallment = 0;

          if (
            payInstallment &&
            installmentDuration &&
            installmentDuration > 0
          ) {
            amountToPay = minFirstDeposit;
            const remaining = fullTotal - minFirstDeposit;
            perInstallment = Math.round(remaining / installmentDuration);
          }

          const formatCurrency = (kobo: number) => {
            return `₦${(kobo / 100).toLocaleString()}`;
          };

          return (
            <>
              {/* Header */}
              <ScrollView>
                <View
                  style={[
                    tw`flex-row items-center  px-4 py-3 border-b`,
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
                    Co-Development Investment
                  </Text>
                </View>

                <ScrollView
                  style={tw`flex-1`}
                  contentContainerStyle={tw`p-4 pb-32`}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Property Info */}
                  <View style={tw`mb-6`}>
                    <Text
                      style={[
                        tw`text-base font-bold mb-2`,
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

                  {/* Payment Type Toggle */}
                  <View style={tw`mb-6`}>
                    <Text
                      style={[
                        tw`text-sm font-semibold mb-3`,
                        { color: Colors.textPrimary },
                      ]}
                    >
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
                            backgroundColor: !payInstallment
                              ? Colors.brand + "15"
                              : "#fff",
                            borderColor: !payInstallment
                              ? Colors.brand
                              : Colors.divider,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            tw`text-sm font-semibold text-center`,
                            {
                              color: !payInstallment
                                ? Colors.brand
                                : Colors.textSecondary,
                            },
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
                            backgroundColor: payInstallment
                              ? Colors.brand + "15"
                              : "#fff",
                            borderColor: payInstallment
                              ? Colors.brand
                              : Colors.divider,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            tw`text-sm font-semibold text-center`,
                            {
                              color: payInstallment
                                ? Colors.brand
                                : Colors.textSecondary,
                            },
                          ]}
                        >
                          Installment
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

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
                        Number of Units
                      </Text>
                      {property.availableUnits != null && (
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
                            Max: {property.availableUnits}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View
                      style={tw`flex-row items-center justify-between mt-3`}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          if (quantity > 1)
                            form.setValue("quantity", quantity - 1);
                        }}
                        disabled={quantity <= 1}
                        style={[
                          tw`w-10 h-10 rounded-xl items-center justify-center border`,
                          {
                            borderColor:
                              quantity <= 1 ? Colors.divider : Colors.brand,
                            backgroundColor:
                              quantity <= 1 ? "#F9FAFB" : Colors.brand + "10",
                          },
                        ]}
                      >
                        <Ionicons
                          name="remove"
                          size={20}
                          color={
                            quantity <= 1 ? Colors.textMuted : Colors.brand
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
                          if (
                            property.availableUnits == null ||
                            quantity < property.availableUnits
                          )
                            form.setValue("quantity", quantity + 1);
                        }}
                        disabled={
                          property.availableUnits != null &&
                          quantity >= property.availableUnits
                        }
                        style={[
                          tw`w-10 h-10 rounded-xl items-center justify-center border`,
                          {
                            borderColor:
                              property.availableUnits != null &&
                              quantity >= property.availableUnits
                                ? Colors.divider
                                : Colors.brand,
                            backgroundColor:
                              property.availableUnits != null &&
                              quantity >= property.availableUnits
                                ? "#F9FAFB"
                                : Colors.brand + "10",
                          },
                        ]}
                      >
                        <Ionicons
                          name="add"
                          size={20}
                          color={
                            property.availableUnits != null &&
                            quantity >= property.availableUnits
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
                      Subtotal: {formatCurrency(unitTotal)}
                    </Text>
                  </View>

                  {/* Installment Options */}
                  {payInstallment && (
                    <View style={tw`mb-6 gap-4`}>
                      <Controller
                        control={form.control}
                        name="installmentDuration"
                        render={({
                          field: { onChange, value },
                          fieldState: { error },
                        }) => (
                          <SelectInput
                            label="Installment Duration (months)"
                            placeholder="Select duration"
                            value={value?.toString() || ""}
                            onChange={(val: string) =>
                              onChange(parseInt(val) || undefined)
                            }
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
                        render={({
                          field: { onChange, value },
                          fieldState: { error },
                        }) => (
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
                      {
                        backgroundColor: Colors.surface + "20",
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
                          Price per unit
                        </Text>
                        <Text
                          style={[
                            tw`text-sm font-semibold`,
                            { color: Colors.textPrimary },
                          ]}
                        >
                          {formatCurrency(pricePerUnit)}
                        </Text>
                      </View>

                      <View style={tw`flex-row justify-between`}>
                        <Text
                          style={[tw`text-sm`, { color: Colors.textSecondary }]}
                        >
                          Quantity × {quantity}
                        </Text>
                        <Text
                          style={[
                            tw`text-sm font-semibold`,
                            { color: Colors.textPrimary },
                          ]}
                        >
                          {formatCurrency(unitTotal)}
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
                            Additional Fees
                          </Text>
                          <Text
                            style={[
                              tw`text-sm font-semibold`,
                              { color: Colors.textPrimary },
                            ]}
                          >
                            {formatCurrency(additionalFeesTotal)}
                          </Text>
                        </View>
                      )}

                      <View
                        style={[
                          tw`flex-row justify-between pt-2 mt-2 border-t`,
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
                          {formatCurrency(fullTotal)}
                        </Text>
                      </View>

                      {payInstallment && (
                        <>
                          <View
                            style={[
                              tw`flex-row justify-between pt-2 mt-2 border-t`,
                              { borderTopColor: Colors.divider },
                            ]}
                          >
                            <Text
                              style={[
                                tw`text-sm font-semibold`,
                                { color: Colors.textPrimary },
                              ]}
                            >
                              First Deposit (Min)
                            </Text>
                            <Text
                              style={[
                                tw`text-sm font-bold`,
                                { color: Colors.brand },
                              ]}
                            >
                              {formatCurrency(minFirstDeposit)}
                            </Text>
                          </View>

                          {installmentDuration && installmentDuration > 0 && (
                            <View style={tw`flex-row justify-between`}>
                              <Text
                                style={[
                                  tw`text-sm`,
                                  { color: Colors.textSecondary },
                                ]}
                              >
                                Per Installment
                              </Text>
                              <Text
                                style={[
                                  tw`text-sm font-semibold`,
                                  { color: Colors.textPrimary },
                                ]}
                              >
                                {formatCurrency(perInstallment)}
                              </Text>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  </View>

                  {/* Info Box */}
                  <View
                    style={[
                      tw`flex-row gap-3 p-4 rounded-xl mb-4`,
                      { backgroundColor: Colors.brand + "10" },
                    ]}
                  >
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color={Colors.brand}
                    />
                    <Text
                      style={[
                        tw`text-xs flex-1 leading-5`,
                        { color: Colors.textSecondary },
                      ]}
                    >
                      {payInstallment
                        ? "You'll pay the first deposit now and complete the remaining payments in scheduled installments."
                        : "You'll pay the full amount now to complete the investment."}
                    </Text>
                  </View>

                  {/* Error Display */}
                  {error && (
                    <View
                      style={[
                        tw`flex-row gap-2 p-3 rounded-xl mb-4`,
                        { backgroundColor: "#FEE2E2" },
                      ]}
                    >
                      <Ionicons name="alert-circle" size={18} color="#DC2626" />
                      <Text style={[tw`text-xs flex-1`, { color: "#DC2626" }]}>
                        {error instanceof Error
                          ? error.message
                          : "An error occurred"}
                      </Text>
                    </View>
                  )}
                </ScrollView>

                {/* Fixed Bottom CTA */}
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
                    <Text
                      style={[tw`text-sm`, { color: Colors.textSecondary }]}
                    >
                      {payInstallment ? "First Payment" : "Total Amount"}
                    </Text>
                    <Text
                      style={[tw`text-xl font-bold`, { color: Colors.brand }]}
                    >
                      {formatCurrency(amountToPay)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={form.handleSubmit((values) =>
                      onSubmit(values, amountToPay),
                    )}
                    disabled={loading}
                    style={[
                      tw`w-full py-4 rounded-2xl items-center`,
                      {
                        backgroundColor: loading
                          ? Colors.divider
                          : Colors.brand,
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
              </ScrollView>
            </>
          );
        }}
      </PageLoader>
    </SafeAreaView>
  );
}
