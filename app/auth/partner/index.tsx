import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
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
import { usePartnerRegisterMutation } from "@/lib/mutations/auth";
import { showMessage } from "react-native-flash-message";
import { extract_message } from "@/helpers/apihelpers";

const PARTNER_TYPE_OPTIONS = [
  { label: "Real Estate Agent", value: "REAL_ESTATE_AGENT" },
  { label: "Property Developer", value: "PROPERTY_DEVELOPER" },
];

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(7, "Invalid phone number"),
    partnerType: z.string().min(1, "Please select a partner type"),
    password: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string(),
    agreed: z.literal(true, { message: "You must agree to the terms" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function PartnerSignUpScreen() {
  const router = useRouter();
  const { mutate, isPending } = usePartnerRegisterMutation();

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
    mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        partnerType: data.partnerType as any,
        password: data.password,
      },
      {
        onSuccess: () =>
          router.push(`/auth/verify?email=${encodeURIComponent(data.email)}`),
        onError: (e: any) => {
          showMessage({ message: extract_message(e), type: "danger" });
        },
      },
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-bg`} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={tw`items-center pt-4 pb-5`}>
        <Image
          source={require("@/assets/need/logo.png")}
          style={tw`w-32 h-12`}
          resizeMode="contain"
        />
      </View>

      <KeyboardAwareScrollView
        style={tw`flex-1 bg-input-bg`}
        contentContainerStyle={tw`px-5 pt-6 pb-10`}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={16}
      >
        {/* Title */}
        <Text style={tw`text-text-primary text-xl font-bold text-center`}>
          Sign Up as a Partner
        </Text>
        <Text style={tw`text-text-muted text-sm text-center mt-1 mb-6`}>
          Fill in your Details
        </Text>

        <View style={tw`gap-4`}>
          {/* First + Last Name */}
          <View style={tw`flex-row gap-3`}>
            <View style={tw`flex-1`}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, value } }) => (
                  <FormInput
                    label="First Name"
                    placeholder="John"
                    value={value}
                    onChangeText={onChange}
                    error={errors.firstName?.message}
                  />
                )}
              />
            </View>
            <View style={tw`flex-1`}>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, value } }) => (
                  <FormInput
                    label="Last Name"
                    placeholder="Doe"
                    value={value}
                    onChangeText={onChange}
                    error={errors.lastName?.message}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <FormInput
                label="Email"
                placeholder="john.doe@example.com"
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
              placeholder="08012345678"
            />
            {errors.phone && (
              <Text style={tw`text-error text-xs`}>{errors.phone.message}</Text>
            )}
          </View>

          <Controller
            control={control}
            name="partnerType"
            render={({ field: { onChange, value } }) => (
              <SelectInput
                label="Partners Type"
                placeholder="Select"
                options={PARTNER_TYPE_OPTIONS}
                value={value}
                onChange={onChange}
                error={errors.partnerType?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <PasswordInput
                label="Password"
                placeholder="••••••••"
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
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
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
                    <Text
                      style={tw`text-brand`}
                      onPress={() => WebBrowser.openBrowserAsync("https://needhomes-new.netlify.app/terms-and-conditions")}
                    >
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
                Submit
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
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
