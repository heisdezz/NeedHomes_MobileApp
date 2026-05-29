import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { showMessage } from "react-native-flash-message";
import tw from "@/lib/tw";
import PasswordInput from "@/components/ui/password-input";
import apiClient from "@/lib/api";
import { extract_message } from "@/helpers/apihelpers";

const schema = z
  .object({
    newPassword: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const decodedToken = decodeURIComponent(token ?? "");

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      apiClient.post("auth/password/reset", {
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
        token: decodedToken,
      }),
    onSuccess: () => {
      showMessage({ message: "Password reset successfully!", type: "success" });
      router.replace("/auth/login");
    },
    onError: (e: any) =>
      showMessage({ message: extract_message(e), type: "danger" }),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <SafeAreaView style={tw`flex-1 bg-bg`} edges={["top"]}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Logo */}
        <View style={tw`items-center pt-8 pb-10 px-6`}>
          <Image
            source={require("@/assets/need/logo.png")}
            style={tw`w-40 h-14`}
            resizeMode="contain"
          />
        </View>

        {/* Card */}
        <View style={tw`flex-1 bg-card rounded-t-3xl px-6 pt-8 pb-10`}>
          <Text style={tw`text-text-primary text-xl font-bold mb-1`}>
            Create New Password
          </Text>
          <Text style={tw`text-brand text-sm leading-5 mb-8`}>
            Enter your desired password for your account.
          </Text>

          <View style={tw`gap-4`}>
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, value } }) => (
                <PasswordInput
                  label="New Password"
                  placeholder="Enter your desired password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.newPassword?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <PasswordInput
                  label="Re Enter Password"
                  placeholder="Re-enter your password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                />
              )}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit((data) => mutate(data))}
            disabled={isPending}
            activeOpacity={0.85}
            style={tw`bg-brand rounded-xl py-4 items-center mt-8 ${isPending ? "opacity-70" : ""}`}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={tw`text-text-inverse text-base font-semibold`}>
                Reset
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
