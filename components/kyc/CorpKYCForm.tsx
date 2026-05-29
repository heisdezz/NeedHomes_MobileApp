import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner-native";
import tw from "@/lib/tw";
import { Colors } from "@/constants/theme";
import FormInput from "@/components/ui/form-input";
import SelectImage, { type SelectedImage } from "@/components/ui/SelectImage";
import { useAuth } from "@/store/auth-store";
import apiClient, { type ApiResponse } from "@/lib/api";
import { uploadImage } from "@/lib/imageApi";
import { extract_message } from "@/helpers/apihelpers";
import type { AxiosError } from "axios";
import AwareScrollview from "../KeyboardAwareScrollview";

interface CorpKycFormData {
  companyName: string;
  companyAddress: string;
  cacDocument: string | null;
  tinDocument: string | null;
  authorizedId: string | null;
}

interface SubmitPayload {
  form: CorpKycFormData;
  cacImage: SelectedImage | null;
  tinImage: SelectedImage | null;
  authIdImage: SelectedImage | null;
  cacPrev: string | null;
  tinPrev: string | null;
  authIdPrev: string | null;
}

async function resolveUpload(
  img: SelectedImage | null,
  prev: string | null,
): Promise<string> {
  if (img) {
    const res = await uploadImage(img.uri, img.fileName, img.mimeType);
    return res.data.url;
  }
  return prev ?? "";
}

export default function CorpKYCForm() {
  const auth = useAuth();
  const accountType = auth?.user?.accountType ?? "CORPORATE";

  const [cacImage, setCacImage] = useState<SelectedImage | null>(null);
  const [tinImage, setTinImage] = useState<SelectedImage | null>(null);
  const [authIdImage, setAuthIdImage] = useState<SelectedImage | null>(null);
  const [cacPrev, setCacPrev] = useState<string | null>(null);
  const [tinPrev, setTinPrev] = useState<string | null>(null);
  const [authIdPrev, setAuthIdPrev] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CorpKycFormData>({
    defaultValues: {
      companyName: "",
      companyAddress: "",
      cacDocument: null,
      tinDocument: null,
      authorizedId: null,
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
    reset({
      companyName: v.companyName ?? "",
      companyAddress: v.companyAddress ?? "",
    });
    if (v.cacDocument) setCacPrev(v.cacDocument);
    if (v.tinDocument) setTinPrev(v.tinDocument);
    if (v.authorizedId) setAuthIdPrev(v.authorizedId);
  }, [kycData]);

  const mutation = useMutation<ApiResponse<any>, AxiosError, SubmitPayload>({
    mutationFn: async ({
      form,
      cacImage,
      tinImage,
      authIdImage,
      cacPrev,
      tinPrev,
      authIdPrev,
    }) => {
      const [cacDocument, tinDocument, authorizedId] = await Promise.all([
        resolveUpload(cacImage, cacPrev),
        resolveUpload(tinImage, tinPrev),
        resolveUpload(authIdImage, authIdPrev),
      ]);
      return apiClient
        .post(`kyc/submit?accountType=${accountType}`, {
          ...form,
          cacDocument,
          tinDocument,
          authorizedId,
        })
        .then((r) => r.data);
    },
    onSuccess: () => refetch(),
    onError: (err: AxiosError) => {
      console.log(JSON.stringify(err));
    },
  });

  const onSubmit = (form: CorpKycFormData) => {
    if (!cacImage && !cacPrev) {
      toast.error("CAC Document is required.");
      return;
    }
    if (!tinImage && !tinPrev) {
      toast.error("TIN Document is required.");
      return;
    }
    if (!authIdImage && !authIdPrev) {
      toast.error("Authorized Signatory ID is required.");
      return;
    }

    toast.promise(
      mutation.mutateAsync({
        form,
        cacImage,
        tinImage,
        authIdImage,
        cacPrev,
        tinPrev,
        authIdPrev,
      }),
      {
        loading: "Uploading documents and submitting KYC...",
        success: () => "Corporate KYC submitted successfully!",
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
    <AwareScrollview
      contentContainerStyle={tw`p-4 gap-5 pb-10`}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={tw`flex-1`}>
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
              Corporate Verification
            </Text>
            <Text style={tw`text-xs text-[${Colors.textMuted}] mt-0.5`}>
              Provide your business registration details and documents.
            </Text>
          </View>

          <Controller
            control={control}
            name="companyName"
            rules={{ required: "Company name is required" }}
            render={({ field: { value, onChange, onBlur } }) => (
              <FormInput
                label="Company Name"
                placeholder="Enter registered company name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.companyName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="companyAddress"
            rules={{ required: "Company address is required" }}
            render={({ field: { value, onChange, onBlur } }) => (
              <FormInput
                label="Company Address"
                placeholder="Enter registered company address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.companyAddress?.message}
              />
            )}
          />

          <View style={tw`flex-row gap-3`}>
            <View style={tw`flex-1`}>
              <SelectImage
                title="CAC Document"
                value={cacImage}
                prevUrl={cacPrev}
                onChange={(img) => {
                  setCacImage(img);
                  if (!img) setCacPrev(null);
                }}
              />
            </View>
            <View style={tw`flex-1`}>
              <SelectImage
                title="TIN Document"
                value={tinImage}
                prevUrl={tinPrev}
                onChange={(img) => {
                  setTinImage(img);
                  if (!img) setTinPrev(null);
                }}
              />
            </View>
          </View>

          <SelectImage
            title="Authorized Signatory ID"
            value={authIdImage}
            prevUrl={authIdPrev}
            onChange={(img) => {
              setAuthIdImage(img);
              if (!img) setAuthIdPrev(null);
            }}
          />

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
                Submit Corporate Verification
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </AwareScrollview>
  );
}
