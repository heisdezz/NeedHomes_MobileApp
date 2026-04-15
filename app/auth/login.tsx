import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner-native";
import tw from "@/lib/tw";
import { Colors } from "@/constants/theme";
import apiClient, { ApiResponse, new_url } from "@/lib/api";
import { AUTHRECORD, set_kyc_value, set_user_value } from "@/store/auth-store";
import { extract_message } from "@/helpers/apihelpers";
import type { USER_KYC } from "@/types.d";
import { showMessage, hideMessage } from "react-native-flash-message";

type LOGIN_RESPONSE = AUTHRECORD;

export default function LoginScreen() {
  const router = useRouter();
  useEffect(() => {
    toast("init");
  }, []);
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const url = `${new_url}auth/login`;
      const response = await axios.post<ApiResponse<LOGIN_RESPONSE>>(
        url,
        credentials,
      );
      console.log("first_path", response.data);
      const data = response.data;
      const newUser = { ...data.data } satisfies Partial<AUTHRECORD>;
      set_user_value(newUser as AUTHRECORD);
      const profileRes =
        await apiClient.get<ApiResponse<USER_KYC>>("/users/profile");
      set_kyc_value(profileRes.data.data);

      toast.success("Login successful!", { duration: 1500 });

      const prof_data = profileRes.data.data;
      console.log("profile", prof_data);
      if (prof_data.partnerType === "PROPERTY_DEVELOPER") {
        return router.replace("/partner");
      }
      if ((newUser as AUTHRECORD).user.accountType === "PARTNER") {
        return router.replace("/partner");
      }
      if (redirect) {
        return router.replace(redirect as any);
      }
      return router.replace("/investor");
      return response.data;
    },
    onSuccess: async (data) => {},
    onError: (error: AxiosError<ApiResponse>) => {
      if (error.response?.status === 401) {
        showMessage({
          message: "Unauthorized",
          description: extract_message(error),
          type: "danger",
        });
        console.log("error", error.response?.data);
        return toast.error(extract_message(error));
      }
      if (error.response?.status === 403) {
        toast.error(extract_message(error), { duration: 2000 });
        return router.push({ pathname: "/auth/verify", params: { email } });
      }
      toast.error(
        error.response?.data?.message ??
          "Login failed. Please check your credentials.",
        { duration: 2000 },
      );
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      return toast.error("Please enter your email and password.");
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-bg`} edges={["top"]}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={tw`flex-grow`}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={tw`items-center pt-8 pb-10 px-6`}>
            <Image
              source={require("@/assets/need/logo.png")}
              style={tw`w-40 h-14 mb-6`}
              resizeMode="contain"
            />
            <Text style={tw`text-text-inverse text-2xl font-bold`}>
              Sign In
            </Text>
            <Text style={tw`text-text-inverse/60 text-sm mt-1`}>
              Make good return on your investment
            </Text>
          </View>

          {/* ── Form card ── */}
          <View style={tw`flex-1 bg-card rounded-t-3xl px-6 pt-8 pb-10`}>
            <Text style={tw`text-text-primary text-xl font-bold mb-1`}>
              Login
            </Text>
            <Text style={tw`text-brand text-sm mb-8`}>
              Welcome, get back into your account
            </Text>

            {/* Email */}
            <View style={tw`mb-5`}>
              <Text style={tw`text-text-primary text-sm font-medium mb-1.5`}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={Colors.inputPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={tw`bg-input-bg border border-input-border rounded-xl px-4 py-3.5 text-text-primary text-sm`}
              />
            </View>

            {/* Password */}
            <View style={tw`mb-2`}>
              <View style={tw`flex-row justify-between items-center mb-1.5`}>
                <Text style={tw`text-text-primary text-sm font-medium`}>
                  Password
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    router.push("/reset-password");
                  }}
                >
                  <Text style={tw`text-brand text-xs font-medium`}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>
              <View
                style={tw`bg-input-bg border border-input-border rounded-xl flex-row items-center px-4`}
              >
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.inputPlaceholder}
                  secureTextEntry={!showPassword}
                  style={tw`flex-1 py-3.5 text-text-primary text-sm`}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Spacer */}
            <View style={tw`flex-1 min-h-10`} />

            {/* Login button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loginMutation.isPending}
              activeOpacity={0.85}
              style={tw`bg-brand rounded-xl py-4 items-center mb-6 ${loginMutation.isPending ? "opacity-70" : ""}`}
            >
              {loginMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={tw`text-text-inverse text-base font-semibold`}>
                  Login
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <Text style={tw`text-text-secondary text-sm text-center`}>
              Don't have an account?{" "}
              <Text
                style={tw`text-brand font-semibold`}
                onPress={() => router.push("/auth/sign-up")}
              >
                Sign Up
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
