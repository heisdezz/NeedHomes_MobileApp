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
const RESEND_SECONDS = 40;

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const decodedEmail = decodeURIComponent(email ?? "");

  const [pendingEmail, setPendingEmail] = useState(decodedEmail);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputs = useRef<(TextInput | null)[]>([]);

  // ── Change-email state ────────────────────────────────────────────────────
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [changeEmailError, setChangeEmailError] = useState("");

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
        email: pendingEmail,
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
      apiClient.post("auth/resend-otp", {
        email: pendingEmail,
        purpose: "email_verification",
      }),
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

  // ── Change email mutation ─────────────────────────────────────────────────
  const { mutate: changeEmail, isPending: isChangingEmail } = useMutation({
    mutationFn: (newEmail: string) =>
      apiClient.post("auth/change-pending-email", {
        currentEmail: pendingEmail,
        newEmail,
      }),
    onSuccess: (_, newEmail) => {
      setPendingEmail(newEmail);
      setOtp(Array(OTP_LENGTH).fill(""));
      setCountdown(RESEND_SECONDS);
      setShowChangeEmail(false);
      setNewEmailInput("");
      setChangeEmailError("");
      showMessage({
        message: `Verification code sent to ${newEmail}`,
        type: "success",
      });
    },
    onError: (e: any) => {
      setChangeEmailError(
        e?.response?.data?.message ?? "Failed to update email"
      );
    },
  });

  const handleChangeEmailSubmit = () => {
    const trimmed = newEmailInput.trim();
    if (!trimmed) {
      setChangeEmailError("Please enter a new email address");
      return;
    }
    setChangeEmailError("");
    changeEmail(trimmed);
  };

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

          {/* ── Email line with Change Email button ── */}
          <View style={tw`flex-row items-center flex-wrap gap-x-2 mb-6`}>
            <Text style={tw`text-text-secondary text-sm leading-5`}>
              Enter the code sent to{" "}
              <Text style={tw`text-text-primary font-semibold`}>
                {pendingEmail}
              </Text>
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowChangeEmail((v) => !v);
                setChangeEmailError("");
                setNewEmailInput("");
              }}
              activeOpacity={0.7}
            >
              <Text style={[tw`text-xs font-bold`, { color: Colors.brand }]}>
                {showChangeEmail ? "Cancel" : "Change Email"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Inline change-email panel ── */}
          {showChangeEmail && (
            <View
              style={[
                tw`rounded-2xl p-4 mb-6`,
                {
                  backgroundColor: Colors.inputBg,
                  borderWidth: 1,
                  borderColor: Colors.inputBorder,
                },
              ]}
            >
              <Text
                style={[
                  tw`text-sm font-semibold mb-3`,
                  { color: Colors.textPrimary },
                ]}
              >
                Update your email address
              </Text>
              <View
                style={[
                  tw`flex-row items-center rounded-xl px-4 border mb-1`,
                  {
                    borderColor: changeEmailError
                      ? "#F87171"
                      : Colors.inputBorder,
                    backgroundColor: Colors.card,
                  },
                ]}
              >
                <TextInput
                  value={newEmailInput}
                  onChangeText={(t) => {
                    setNewEmailInput(t);
                    setChangeEmailError("");
                  }}
                  placeholder="New email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={Colors.inputPlaceholder}
                  style={[
                    tw`flex-1 py-3.5 text-sm`,
                    { color: Colors.textPrimary },
                  ]}
                />
              </View>
              {changeEmailError ? (
                <Text style={tw`text-xs text-red-500 mb-3`}>
                  {changeEmailError}
                </Text>
              ) : (
                <View style={tw`mb-3`} />
              )}
              <View style={tw`flex-row gap-3`}>
                <TouchableOpacity
                  onPress={() => {
                    setShowChangeEmail(false);
                    setNewEmailInput("");
                    setChangeEmailError("");
                  }}
                  activeOpacity={0.7}
                  style={[
                    tw`flex-1 py-3 rounded-xl items-center border`,
                    { borderColor: Colors.divider },
                  ]}
                >
                  <Text
                    style={[
                      tw`text-sm font-semibold`,
                      { color: Colors.textSecondary },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleChangeEmailSubmit}
                  disabled={isChangingEmail}
                  activeOpacity={0.85}
                  style={[
                    tw`flex-1 py-3 rounded-xl items-center`,
                    {
                      backgroundColor: Colors.brand,
                      opacity: isChangingEmail ? 0.6 : 1,
                    },
                  ]}
                >
                  {isChangingEmail ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={tw`text-white text-sm font-bold`}>
                      Update & Resend
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

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
