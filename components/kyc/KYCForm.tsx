import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner-native";
import tw from "@/lib/tw";
import { Colors } from "@/constants/theme";
import FormInput from "@/components/ui/form-input";
import SelectImage, { type SelectedImage } from "@/components/ui/SelectImage";
import { useAuth, get_user_value } from "@/store/auth-store";
import apiClient, { type ApiResponse, new_url } from "@/lib/api";
import { extract_message } from "@/helpers/apihelpers";
import type { AxiosError } from "axios";

interface KycFormData {
  idType: "NIN" | "drivers-license" | "passport" | "voters-card" | "";
  address: string;
  frontPage: string | null;
  backPage: string | null;
  utilityBill: string | null;
}

interface SubmitPayload {
  form: KycFormData;
  frontImage: SelectedImage | null;
  backImage: SelectedImage | null;
  utilityImage: SelectedImage | null;
  frontPrev: string | null;
  backPrev: string | null;
  utilityPrev: string | null;
}

const ID_TYPES = [
  { label: "NIN (National Identification Number)", value: "NIN" },
  { label: "Driver's License", value: "drivers-license" },
  { label: "International Passport", value: "passport" },
  { label: "Voter's Card", value: "voters-card" },
] as const;

async function resolveUpload(
  img: SelectedImage | null,
  prev: string | null,
): Promise<string> {
  if (img) {
    const form = new FormData();
    form.append("file", {
      uri: img.uri,
      name: img.fileName ?? "upload.jpg",
      type: img.mimeType ?? "image/jpeg",
    } as any);
    const token = get_user_value()?.accessToken;
    const res = await fetch(`${new_url}multimedia/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const json: ApiResponse<{ url: string }> = await res.json();
    return json.data.url;
  }
  return prev ?? "";
}

export default function KYCForm() {
  const auth = useAuth();
  const accountType = auth?.user?.accountType ?? "INDIVIDUAL";

  const [frontImage, setFrontImage] = useState<SelectedImage | null>(null);
  const [backImage, setBackImage] = useState<SelectedImage | null>(null);
  const [utilityImage, setUtilityImage] = useState<SelectedImage | null>(null);
  const [frontPrev, setFrontPrev] = useState<string | null>(null);
  const [backPrev, setBackPrev] = useState<string | null>(null);
  const [utilityPrev, setUtilityPrev] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<KycFormData>({
    defaultValues: {
      idType: "",
      address: "",
      frontPage: null,
      backPage: null,
      utilityBill: null,
    },
  });

  const {
    data: kycData,
    isLoading,
    refetch,
  } = useQuery<ApiResponse<{ verification: any }>>({
    queryKey: ["kyc-status", accountType],
    queryFn: () => apiClient.get("kyc").then((r) => r.data),
    enabled: !!accountType,
    retry: 1,
  });

  useEffect(() => {
    const v = kycData?.data?.verification;
    if (!v) return;
    reset({ idType: v.idType ?? "", address: v.address ?? "" });
    if (v.frontPage) setFrontPrev(v.frontPage);
    if (v.backPage) setBackPrev(v.backPage);
    if (v.utilityBill) setUtilityPrev(v.utilityBill);
  }, [kycData]);

  const mutation = useMutation<ApiResponse<any>, AxiosError, SubmitPayload>({
    mutationFn: async ({
      form,
      frontImage,
      backImage,
      utilityImage,
      frontPrev,
      backPrev,
      utilityPrev,
    }) => {
      const [frontPage, backPage, utilityBill] = await Promise.all([
        resolveUpload(frontImage, frontPrev),
        resolveUpload(backImage, backPrev),
        resolveUpload(utilityImage, utilityPrev),
      ]);
      return apiClient
        .post(`kyc/submit?accountType=${accountType}`, {
          ...form,
          frontPage,
          backPage,
          utilityBill,
        })
        .then((r) => r.data);
    },
    onSuccess: () => refetch(),
    onError: (err: AxiosError) => {
      console.log(JSON.stringify(err));
    },
  });

  const onSubmit = (form: KycFormData) => {
    if (!frontImage && !frontPrev) {
      toast.error("Front page of ID is required.");
      return;
    }
    if (!backImage && !backPrev) {
      toast.error("Back page of ID is required.");
      return;
    }
    if (!utilityImage && !utilityPrev) {
      toast.error("Utility bill is required.");
      return;
    }

    toast.promise(
      mutation.mutateAsync({
        form,
        frontImage,
        backImage,
        utilityImage,
        frontPrev,
        backPrev,
        utilityPrev,
      }),
      {
        loading: "Uploading documents and submitting KYC...",
        success: () => "KYC submitted successfully!",
        error: (err) => extract_message(err) || "Failed to submit KYC.",
      },
    );
  };

  if (isLoading) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <ActivityIndicator color={Colors.brand} size="large" />
        <Text style={tw`mt-3 text-sm text-[${Colors.textMuted}]`}>
          Loading KYC details...
        </Text>
      </View>
    );
  }

  const rejection =
    kycData?.data?.verification?.status === "REJECTED"
      ? kycData.data.verification.RejectionReason
      : null;

  return (
    <ScrollView
      style={tw`flex-1`}
      contentContainerStyle={tw`p-4 gap-5 pb-10`}
      showsVerticalScrollIndicator={false}
    >
      {rejection ? (
        <View style={tw`bg-red-50 border border-red-200 rounded-xl p-4`}>
          <Text style={tw`text-xs font-bold text-red-700 uppercase mb-1`}>
            Rejection Reason
          </Text>
          <Text style={tw`text-sm text-red-600`}>{rejection}</Text>
        </View>
      ) : null}

      <View
        style={tw`bg-white rounded-2xl border border-[${Colors.divider}] p-4 gap-5`}
      >
        <View style={tw`border-b border-[${Colors.divider}] pb-3`}>
          <Text style={tw`text-base font-bold text-[${Colors.textPrimary}]`}>
            Identity Verification
          </Text>
          <Text style={tw`text-xs text-[${Colors.textMuted}] mt-0.5`}>
            Provide a valid government-issued ID and proof of address.
          </Text>
        </View>

        {/* ID Type */}
        <View style={tw`gap-1.5`}>
          <Text style={tw`text-sm font-semibold text-[${Colors.textPrimary}]`}>
            Document Type
          </Text>
          <Controller
            control={control}
            name="idType"
            rules={{ required: "Please select an ID type" }}
            render={({ field: { value, onChange } }) => (
              <View style={tw`gap-2`}>
                {ID_TYPES.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => onChange(opt.value)}
                    activeOpacity={0.7}
                    style={tw`flex-row items-center gap-3 border rounded-xl px-4 py-3 ${
                      value === opt.value
                        ? `border-[${Colors.brand}] bg-orange-50`
                        : `border-[${Colors.inputBorder}] bg-[${Colors.inputBg}]`
                    }`}
                  >
                    <View
                      style={tw`w-4 h-4 rounded-full border-2 items-center justify-center ${
                        value === opt.value
                          ? `border-[${Colors.brand}]`
                          : `border-[${Colors.textMuted}]`
                      }`}
                    >
                      {value === opt.value ? (
                        <View
                          style={tw`w-2 h-2 rounded-full bg-[${Colors.brand}]`}
                        />
                      ) : null}
                    </View>
                    <Text style={tw`text-sm text-[${Colors.textPrimary}]`}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.idType ? (
            <Text style={tw`text-xs text-red-500`}>
              {errors.idType.message}
            </Text>
          ) : null}
        </View>

        {/* ID Images */}
        <View style={tw`flex-row gap-3`}>
          <View style={tw`flex-1`}>
            <SelectImage
              title="Front View"
              value={frontImage}
              prevUrl={frontPrev}
              onChange={(img) => {
                setFrontImage(img);
                if (!img) setFrontPrev(null);
              }}
            />
          </View>
          <View style={tw`flex-1`}>
            <SelectImage
              title="Back View"
              value={backImage}
              prevUrl={backPrev}
              onChange={(img) => {
                setBackImage(img);
                if (!img) setBackPrev(null);
              }}
            />
          </View>
        </View>

        {/* Utility Bill */}
        <SelectImage
          title="Proof of Address (Utility Bill)"
          value={utilityImage}
          prevUrl={utilityPrev}
          onChange={(img) => {
            setUtilityImage(img);
            if (!img) setUtilityPrev(null);
          }}
        />

        {/* Address */}
        <Controller
          control={control}
          name="address"
          rules={{ required: "Residential address is required" }}
          render={({ field: { value, onChange, onBlur } }) => (
            <FormInput
              label="Residential Address"
              placeholder="House Number, Street Name, City, State"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.address?.message}
            />
          )}
        />

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={mutation.isPending}
          activeOpacity={0.8}
          style={tw`bg-[${Colors.brand}] rounded-xl py-4 items-center ${mutation.isPending ? "opacity-60" : ""}`}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={tw`text-white font-bold text-base`}>
              Submit Verification
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
