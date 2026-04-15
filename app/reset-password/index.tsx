import {
  View,
  Text,
  Image,
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
import { useMutation } from "@tanstack/react-query";
import tw from "@/lib/tw";
import FormInput from "@/components/ui/form-input";
import apiClient from "@/lib/api";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (email: string) =>
      apiClient.post("auth/password/forgot", { email }),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = ({ email }: FormData) => {
    const goToOtp = () =>
      router.push(
        `/reset-password/password-otp?email=${encodeURIComponent(email)}`,
      );

    mutate(email, {
      onSuccess: goToOtp,
      // Always navigate — endpoint is designed to not reveal whether email exists
      onError: goToOtp,
    });
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-bg`} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Logo */}
        <View style={tw`items-center pt-6 pb-8`}>
          <Image
            source={require("@/assets/need/logo.png")}
            style={tw`w-36 h-14`}
            resizeMode="contain"
          />
        </View>

        {/* Card */}
        <View style={tw`mx-5 bg-input-bg rounded-2xl px-5 py-8 gap-5`}>
          <View style={tw`gap-1`}>
            <Text style={tw`text-text-primary text-xl font-bold`}>
              Reset your password
            </Text>
            <Text style={tw`text-text-muted text-sm leading-5`}>
              Enter your email address and we'll send a link to reset your
              password
            </Text>
          </View>

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

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            activeOpacity={0.85}
            style={tw`bg-brand rounded-xl py-4 items-center ${isPending ? "opacity-60" : ""}`}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={tw`text-text-inverse text-base font-semibold`}>
                Send Reset Link
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={tw`items-center`}
          >
            <Text style={tw`text-brand text-sm font-medium`}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
