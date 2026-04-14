import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PhoneInput from "react-native-phone-number-input";
import { Ionicons } from "@expo/vector-icons";
import tw from "@/lib/tw";
import FormInput from "@/components/ui/form-input";
import PasswordInput from "@/components/ui/password-input";
import SelectInput from "@/components/ui/select-input";
import { useRegisterMutation } from "@/lib/mutations/auth";
import { showMessage } from "react-native-flash-message";
import { extract_message } from "@/helpers/apihelpers";

const HEAR_OPTIONS = [
  { label: "Social Media", value: "social_media" },
  { label: "Friend / Family", value: "friend_family" },
  { label: "Google", value: "google" },
  { label: "TV / Radio", value: "tv_radio" },
  { label: "Other", value: "other" },
];

const schema = z
  .object({
    companyName: z.string().min(1, "Company name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(7, "Invalid phone number"),
    password: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string(),
    hearAboutUs: z.string().min(1, "Please select an option"),
    agreed: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the terms" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function CorporateScreen() {
  const router = useRouter();
  const { mutate, isPending } = useRegisterMutation("CORPORATE");

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agreed: undefined as any },
  });

  const onSubmit = (data: FormData) => {
    // nextOfKin must NOT be sent for CORPORATE accounts
    mutate(
      {
        email: data.email,
        password: data.password,
        // firstName: data.companyName,
        companyName: data.companyName,
        phone: data.phone,
      },
      {
        onSuccess: () => router.push(`/auth/verify?email=${encodeURIComponent(data.email)}`),
        onError: (e: any) => {
          showMessage({ message: extract_message(e as any), type: "danger" });
          console.log(e?.response?.data);
        },
      },
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-bg`} edges={["top"]}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={tw`items-center pt-4 pb-5`}>
          <Image
            source={require("@/assets/need/logo.png")}
            style={tw`w-32 h-12`}
            resizeMode="contain"
          />
        </View>

        <ScrollView
          style={tw`flex-1 bg-input-bg`}
          contentContainerStyle={tw`px-5 pt-6 pb-10`}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Text style={tw`text-text-primary text-xl font-bold text-center`}>
            Sign Up as Corporate
          </Text>
          <Text style={tw`text-text-muted text-sm text-center mt-1 mb-5`}>
            Make good return on your Investment
          </Text>

          {/* Tab switcher */}
          <View
            style={tw`flex-row bg-card rounded-xl p-1 mb-6 self-center border border-input-border`}
          >
            <TouchableOpacity
              onPress={() => router.replace("/auth/investor/individual")}
              style={tw`px-6 py-2`}
            >
              <Text style={tw`text-text-muted text-sm font-semibold`}>
                Individual
              </Text>
            </TouchableOpacity>
            <View style={tw`bg-brand rounded-lg px-6 py-2`}>
              <Text style={tw`text-text-inverse text-sm font-semibold`}>
                Corporate
              </Text>
            </View>
          </View>

          <View style={tw`gap-4`}>
            <Controller
              control={control}
              name="companyName"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Company Name"
                  placeholder="Enter your company name"
                  value={value}
                  onChangeText={onChange}
                  error={errors.companyName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <FormInput
                  label="Email"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                />
              )}
            />

            {/* Phone */}
            <View style={tw`gap-1.5`}>
              <Text style={tw`text-text-primary text-sm font-medium`}>
                Phone Number
              </Text>
              <PhoneInput
                defaultCode="NG"
                layout="first"
                onChangeFormattedText={(text) =>
                  setValue("phone", text, { shouldValidate: true })
                }
                containerStyle={tw`w-full bg-card border border-input-border rounded-xl`}
                textContainerStyle={tw`bg-card rounded-r-xl py-0`}
                textInputStyle={tw`text-sm text-text-primary`}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <Text style={tw`text-error text-xs`}>
                  {errors.phone.message}
                </Text>
              )}
            </View>

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <PasswordInput
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="hearAboutUs"
              render={({ field: { onChange, value } }) => (
                <SelectInput
                  label="Where did you hear about us?"
                  placeholder="Select an option"
                  options={HEAR_OPTIONS}
                  value={value}
                  onChange={onChange}
                  error={errors.hearAboutUs?.message}
                />
              )}
            />

            {/* Terms */}
            <Controller
              control={control}
              name="agreed"
              render={({ field: { onChange, value } }) => (
                <View>
                  <TouchableOpacity
                    onPress={() => onChange(value ? (undefined as any) : true)}
                    style={tw`flex-row items-start gap-2.5`}
                    activeOpacity={0.8}
                  >
                    <View
                      style={tw`w-4 h-4 mt-0.5 rounded border-2 items-center justify-center ${
                        value
                          ? "bg-brand border-brand"
                          : "bg-card border-input-border"
                      }`}
                    >
                      {value && (
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      )}
                    </View>
                    <Text
                      style={tw`flex-1 text-xs text-text-secondary leading-5`}
                    >
                      By creating an account, you agree to Needhomes{" "}
                      <Text style={tw`text-brand`}>
                        Privacy Policy, Terms and Conditions
                      </Text>
                    </Text>
                  </TouchableOpacity>
                  {errors.agreed && (
                    <Text style={tw`text-error text-xs mt-1`}>
                      {errors.agreed.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
              activeOpacity={0.85}
              style={tw`bg-brand rounded-xl py-4 items-center mt-2 ${isPending ? "opacity-60" : ""}`}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={tw`text-text-inverse text-base font-semibold`}>
                  Done
                </Text>
              )}
            </TouchableOpacity>

            <Text style={tw`text-text-secondary text-sm text-center`}>
              Already have an account?{" "}
              <Text
                style={tw`text-brand font-semibold`}
                onPress={() => router.push("/auth/login")}
              >
                Log In
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
