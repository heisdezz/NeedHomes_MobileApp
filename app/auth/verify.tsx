import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { showMessage } from "react-native-flash-message";
import tw from "@/lib/tw";
import { Colors } from "@/constants/theme";
import apiClient from "@/lib/api";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 120;

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const decodedEmail = decodeURIComponent(email ?? "");

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputs = useRef<(TextInput | null)[]>([]);

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const mm = String(Math.floor(countdown / 60)).padStart(2, "0");
  const ss = String(countdown % 60).padStart(2, "0");

  // ── OTP input handlers ────────────────────────────────────────────────────
  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  // ── Verify mutation ───────────────────────────────────────────────────────
  const { mutate: verify, isPending } = useMutation({
    mutationFn: () =>
      apiClient.post("auth/verify-email", {
        email: decodedEmail,
        otp: otp.join(""),
      }),
    onSuccess: () => {
      showMessage({ message: "Email verified successfully!", type: "success" });
      router.replace("/auth/login");
    },
    onError: (e: any) => {
      showMessage({
        message: e?.response?.data?.message ?? "Verification failed",
        type: "danger",
      });
    },
  });

  // ── Resend mutation ───────────────────────────────────────────────────────
  const { mutate: resend, isPending: isResending } = useMutation({
    mutationFn: () =>
      apiClient.post("auth/resend-otp", { email: decodedEmail }),
    onSuccess: () => {
      setCountdown(RESEND_SECONDS);
      showMessage({
        message: "OTP resent! Check your email.",
        type: "success",
      });
    },
    onError: (e: any) => {
      showMessage({
        message: e?.response?.data?.message ?? "Failed to resend OTP",
        type: "danger",
      });
    },
  });

  const handleSubmit = () => {
    if (otp.join("").length < OTP_LENGTH) {
      return showMessage({
        message: "Please enter the full OTP",
        type: "warning",
      });
    }
    verify();
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-bg`} edges={["top"]}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ── Dark header ── */}
        <View style={tw`items-center pt-8 pb-10 px-6`}>
          <Image
            source={require("@/assets/need/logo.png")}
            style={tw`w-40 h-14`}
            resizeMode="contain"
          />
        </View>

        {/* ── White card ── */}
        <View style={tw`flex-1 bg-card rounded-t-3xl px-6 pt-8 pb-10`}>
          <Text style={tw`text-text-primary text-xl font-bold mb-2`}>
            OTP Verification
          </Text>
          <Text style={tw`text-text-secondary text-sm leading-5 mb-8`}>
            An OTP has been sent to your email to be able to verify your
            account. {decodedEmail} ss
          </Text>

          {/* ── OTP boxes ── */}
          <View style={tw`flex-row justify-between mb-8`}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(r) => {
                  inputs.current[i] = r;
                }}
                value={digit}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, i)
                }
                keyboardType="number-pad"
                maxLength={1}
                style={[
                  tw`w-12 h-14 rounded-xl text-center text-text-primary text-xl font-bold border`,
                  {
                    borderColor: digit ? Colors.brand : Colors.inputBorder,
                    backgroundColor: digit ? Colors.inputBg : Colors.card,
                  },
                ]}
                selectionColor={Colors.brand}
              />
            ))}
          </View>

          {/* ── Submit ── */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            activeOpacity={0.85}
            style={tw`bg-brand rounded-xl py-4 items-center mb-5 ${isPending ? "opacity-70" : ""}`}
          >
            {isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={tw`text-text-inverse text-base font-semibold`}>
                Submit
              </Text>
            )}
          </TouchableOpacity>

          {/* ── Resend ── */}
          <View style={tw`items-center`}>
            {countdown > 0 ? (
              <Text style={tw`text-text-secondary text-sm`}>
                Resend Link in{" "}
                <Text style={tw`text-brand font-semibold`}>
                  {mm}:{ss} min
                </Text>
              </Text>
            ) : (
              <TouchableOpacity
                onPress={() => resend()}
                disabled={isResending}
                activeOpacity={0.7}
              >
                {isResending ? (
                  <ActivityIndicator color={Colors.brand} size="small" />
                ) : (
                  <Text style={tw`text-brand font-semibold text-sm`}>
                    Resend OTP
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
