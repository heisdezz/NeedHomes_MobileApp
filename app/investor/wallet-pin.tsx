import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { toast } from "sonner-native";
import { Colors } from "@/constants/theme";
import {
  usePinStatus,
  usePinQuestions,
  useSetupPinMutation,
  useVerifyPinAnswerMutation,
  useResetPinMutation,
} from "@/lib/queries/investor";
import { extract_message } from "@/helpers/apihelpers";
import FormInput from "@/components/ui/form-input";
import PasswordInput from "@/components/ui/password-input";
import SelectInput from "@/components/ui/select-input";
import PrimaryButton from "@/components/primary-button";
import tw from "@/lib/tw";

type View = "status" | "setup-1" | "setup-2" | "reset-verify" | "reset-pin";

function useCountdown(lockedUntil?: string) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!lockedUntil) {
      setRemaining("");
      return;
    }
    const tick = () => {
      const diff = new Date(lockedUntil).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining("");
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  return remaining;
}

function Banner({
  variant,
  icon,
  title,
  body,
}: {
  variant: "amber" | "green" | "red" | "gray";
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}) {
  const s = {
    amber: {
      bg: "#FFFBEB",
      border: "#FDE68A",
      icon: "#F59E0B",
      text: "#92400E",
      sub: "#B45309",
    },
    green: {
      bg: "#F0FDF4",
      border: "#BBF7D0",
      icon: "#16A34A",
      text: "#14532D",
      sub: "#15803D",
    },
    red: {
      bg: "#FEF2F2",
      border: "#FECACA",
      icon: "#DC2626",
      text: "#7F1D1D",
      sub: "#B91C1C",
    },
    gray: {
      bg: "#F9FAFB",
      border: "#E5E7EB",
      icon: "#6B7280",
      text: "#374151",
      sub: "#4B5563",
    },
  }[variant];

  return (
    <View
      style={[
        tw`flex-row gap-3 p-4 rounded-xl`,
        { backgroundColor: s.bg, borderWidth: 1, borderColor: s.border },
      ]}
    >
      <Ionicons name={icon} size={20} color={s.icon} style={tw`mt-0.5`} />
      <View style={tw`flex-1`}>
        <Text style={[tw`text-sm font-semibold`, { color: s.text }]}>
          {title}
        </Text>
        <Text style={[tw`text-xs mt-1 leading-4`, { color: s.sub }]}>
          {body}
        </Text>
      </View>
    </View>
  );
}

// ─── Status view ──────────────────────────────────────────────────────────────

function StatusView({
  onSetup,
  onReset,
}: {
  onSetup: () => void;
  onReset: () => void;
}) {
  const { data, isLoading } = usePinStatus();
  const status = data?.data;
  const countdown = useCountdown(status?.lockedUntil);

  if (isLoading) {
    return <ActivityIndicator color={Colors.brand} style={tw`py-8`} />;
  }

  if (!status?.isSetUp) {
    return (
      <View style={tw`gap-4`}>
        <View style={tw`flex-row items-center gap-3`}>
          <View
            style={[
              tw`w-10 h-10 rounded-xl items-center justify-center`,
              { backgroundColor: "#FDE8DC" },
            ]}
          >
            <Ionicons name="key-outline" size={20} color={Colors.brand} />
          </View>
          <View>
            <Text
              style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}
            >
              Withdrawal PIN
            </Text>
            <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
              Secure your withdrawals with a PIN
            </Text>
          </View>
        </View>

        <Banner
          variant="amber"
          icon="warning-outline"
          title="PIN not set up"
          body="You need a withdrawal PIN before making withdrawals."
        />

        <PrimaryButton label="Set Up Withdrawal PIN" onPress={onSetup} />
      </View>
    );
  }

  return (
    <View style={tw`gap-4`}>
      <View style={tw`flex-row items-center gap-3`}>
        <View
          style={[
            tw`w-10 h-10 rounded-xl items-center justify-center`,
            { backgroundColor: "#DCFCE7" },
          ]}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color="#16A34A" />
        </View>
        <View>
          <Text
            style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}
          >
            Withdrawal PIN
          </Text>
          <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
            Your withdrawals are protected with a PIN
          </Text>
        </View>
      </View>

      {status.isLocked ? (
        <Banner
          variant="red"
          icon="lock-closed-outline"
          title="PIN Locked"
          body={`Too many failed attempts.${countdown ? ` Unlocks in ${countdown}.` : ""} Reset your PIN using your security question.`}
        />
      ) : (
        <Banner
          variant="green"
          icon="checkmark-circle-outline"
          title="PIN Active"
          body="Your withdrawal PIN is set up and active."
        />
      )}

      <TouchableOpacity
        onPress={onReset}
        activeOpacity={0.7}
        style={[
          tw`flex-row items-center gap-2 py-3.5 px-4 rounded-xl border`,
          { borderColor: Colors.divider },
        ]}
      >
        <Ionicons name="refresh-outline" size={18} color={Colors.textPrimary} />
        <Text
          style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}
        >
          Reset PIN
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Setup step 1 ─────────────────────────────────────────────────────────────

function SetupStep1({
  onNext,
  onCancel,
}: {
  onNext: (pin: string) => void;
  onCancel: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function handleNext() {
    if (!pin) {
      setError("PIN is required");
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      setError("PIN must be 4–6 digits");
      return;
    }
    onNext(pin);
  }

  return (
    <View style={tw`gap-5`}>
      <View style={tw`flex-row items-center justify-between`}>
        <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>
          Create Withdrawal PIN
        </Text>
        <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>
          Step 1 of 2
        </Text>
      </View>
      <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
        Enter a 4–6 digit PIN to secure your withdrawals.
      </Text>

      <PasswordInput
        label="Withdrawal PIN"
        placeholder="••••"
        value={pin}
        onChangeText={(t) => {
          setPin(t.replace(/\D/g, "").slice(0, 6));
          setError("");
        }}
        keyboardType="number-pad"
        maxLength={6}
        error={error}
      />

      <View style={tw`flex-row gap-3`}>
        <TouchableOpacity
          onPress={onCancel}
          activeOpacity={0.7}
          style={[
            tw`flex-1 py-3.5 rounded-xl items-center border`,
            { borderColor: Colors.divider },
          ]}
        >
          <Text
            style={[tw`text-sm font-semibold`, { color: Colors.textSecondary }]}
          >
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.8}
          style={[
            tw`flex-1 py-3.5 rounded-xl items-center`,
            { backgroundColor: Colors.brand },
          ]}
        >
          <Text style={tw`text-white text-sm font-bold`}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Setup step 2 ─────────────────────────────────────────────────────────────

function SetupStep2({
  setupPin,
  onBack,
}: {
  setupPin: string;
  onBack: () => void;
}) {
  const { data: questionsData, isLoading } = usePinQuestions(true);
  const setupMutation = useSetupPinMutation();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [errors, setErrors] = useState<{ question?: string; answer?: string }>(
    {},
  );

  const questions = (questionsData?.data ?? []).map((q) => ({
    label: q.question,
    value: q.question,
  }));

  function handleSubmit() {
    const e: typeof errors = {};
    if (!question) e.question = "Please select a question";
    if (!answer.trim()) e.answer = "Answer is required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    toast.promise(
      setupMutation.mutateAsync({
        pin: setupPin,
        securityQuestion: question,
        securityAnswer: answer,
      }),
      {
        loading: "Saving PIN...",
        success: "Withdrawal PIN set up successfully.",
        error: extract_message as any,
      },
    );
  }

  return (
    <View style={tw`gap-5`}>
      <View style={tw`flex-row items-center justify-between`}>
        <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>
          Security Question
        </Text>
        <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>
          Step 2 of 2
        </Text>
      </View>
      <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
        Choose a question you can answer if you forget your PIN.
      </Text>

      {isLoading ? (
        <ActivityIndicator color={Colors.brand} />
      ) : (
        <SelectInput
          label="Security Question"
          placeholder="Select a question..."
          options={questions}
          value={question}
          onChange={(v) => {
            setQuestion(v);
            setErrors((e) => ({ ...e, question: undefined }));
          }}
          error={errors.question}
        />
      )}

      <View style={tw`gap-1`}>
        <FormInput
          label="Your Answer"
          placeholder="Your answer"
          value={answer}
          onChangeText={(t) => {
            setAnswer(t);
            setErrors((e) => ({ ...e, answer: undefined }));
          }}
          error={errors.answer}
        />
        <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>
          Remember this — you'll need it to reset your PIN.
        </Text>
      </View>

      {setupMutation.isError && (
        <Banner
          variant="red"
          icon="alert-circle-outline"
          title="Error"
          body={
            extract_message(setupMutation.error as any) || "An error occurred."
          }
        />
      )}

      <View style={tw`flex-row gap-3`}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={[
            tw`flex-1 py-3.5 rounded-xl items-center border`,
            { borderColor: Colors.divider },
          ]}
        >
          <Text
            style={[tw`text-sm font-semibold`, { color: Colors.textSecondary }]}
          >
            Back
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={setupMutation.isPending}
          activeOpacity={0.8}
          style={[
            tw`flex-1 py-3.5 rounded-xl items-center`,
            {
              backgroundColor: Colors.brand,
              opacity: setupMutation.isPending ? 0.6 : 1,
            },
          ]}
        >
          {setupMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={tw`text-white text-sm font-bold`}>Save PIN</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Reset — verify answer ────────────────────────────────────────────────────

function ResetVerifyView({
  securityQuestion,
  onVerified,
  onCancel,
}: {
  securityQuestion?: string;
  onVerified: (token: string) => void;
  onCancel: () => void;
}) {
  const verifyMutation = useVerifyPinAnswerMutation();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!answer.trim()) {
      setError("Answer is required");
      return;
    }
    toast.promise(
      verifyMutation.mutateAsync({ securityAnswer: answer }).then((res) => {
        onVerified(res.data.resetToken);
        return res;
      }),
      {
        loading: "Verifying...",
        success: () => "Identity verified. Set your new PIN.",
        error: extract_message as any,
      },
    );
  }

  return (
    <View style={tw`gap-5`}>
      <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>
        Reset Withdrawal PIN
      </Text>
      <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
        Answer your security question to verify your identity.
      </Text>

      {securityQuestion && (
        <View
          style={[
            tw`p-3 rounded-xl`,
            {
              backgroundColor: Colors.inputBg,
              borderWidth: 1,
              borderColor: Colors.divider,
            },
          ]}
        >
          <Text style={[tw`text-xs mb-1`, { color: Colors.textMuted }]}>
            Security Question
          </Text>
          <Text
            style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}
          >
            {securityQuestion}
          </Text>
        </View>
      )}

      <FormInput
        label="Your Answer"
        placeholder="Your answer"
        value={answer}
        onChangeText={(t) => {
          setAnswer(t);
          setError("");
        }}
        error={error}
      />

      {verifyMutation.isError && (
        <Banner
          variant="red"
          icon="alert-circle-outline"
          title="Error"
          body={
            extract_message(verifyMutation.error as any) || "An error occurred."
          }
        />
      )}

      <Banner
        variant="gray"
        icon="information-circle-outline"
        title="Forgotten your answer?"
        body="Contact customer support — we'll verify your identity and send a recovery link to your registered email."
      />

      <View style={tw`flex-row gap-3`}>
        <TouchableOpacity
          onPress={onCancel}
          activeOpacity={0.7}
          style={[
            tw`flex-1 py-3.5 rounded-xl items-center border`,
            { borderColor: Colors.divider },
          ]}
        >
          <Text
            style={[tw`text-sm font-semibold`, { color: Colors.textSecondary }]}
          >
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={verifyMutation.isPending}
          activeOpacity={0.8}
          style={[
            tw`flex-1 py-3.5 rounded-xl items-center`,
            {
              backgroundColor: Colors.brand,
              opacity: verifyMutation.isPending ? 0.6 : 1,
            },
          ]}
        >
          {verifyMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={tw`text-white text-sm font-bold`}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Reset — new PIN ──────────────────────────────────────────────────────────

function ResetPinView({
  resetToken,
  onBack,
}: {
  resetToken: string;
  onBack: () => void;
}) {
  const resetMutation = useResetPinMutation();
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [errors, setErrors] = useState<{
    newPin?: string;
    confirmPin?: string;
  }>({});

  function handleSubmit() {
    const e: typeof errors = {};
    if (!newPin) e.newPin = "PIN is required";
    else if (!/^\d{4,6}$/.test(newPin)) e.newPin = "PIN must be 4–6 digits";
    if (!confirmPin) e.confirmPin = "Please confirm your PIN";
    else if (newPin && newPin !== confirmPin)
      e.confirmPin = "PINs do not match";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    toast.promise(resetMutation.mutateAsync({ resetToken, newPin }), {
      loading: "Saving new PIN...",
      success: "Withdrawal PIN reset successfully.",
      error: extract_message as any,
    });
  }

  return (
    <View style={tw`gap-5`}>
      <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>
        Set New PIN
      </Text>
      <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
        Enter and confirm your new 4–6 digit withdrawal PIN.
      </Text>

      <PasswordInput
        label="New PIN"
        placeholder="••••"
        value={newPin}
        onChangeText={(t) => {
          setNewPin(t.replace(/\D/g, "").slice(0, 6));
          setErrors((e) => ({ ...e, newPin: undefined }));
        }}
        keyboardType="number-pad"
        maxLength={6}
        error={errors.newPin}
      />

      <PasswordInput
        label="Confirm New PIN"
        placeholder="••••"
        value={confirmPin}
        onChangeText={(t) => {
          setConfirmPin(t.replace(/\D/g, "").slice(0, 6));
          setErrors((e) => ({ ...e, confirmPin: undefined }));
        }}
        keyboardType="number-pad"
        maxLength={6}
        error={errors.confirmPin}
      />

      {resetMutation.isError && (
        <Banner
          variant="red"
          icon="alert-circle-outline"
          title="Error"
          body={
            extract_message(resetMutation.error as any) || "An error occurred."
          }
        />
      )}

      <View style={tw`flex-row gap-3`}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={[
            tw`flex-1 py-3.5 rounded-xl items-center border`,
            { borderColor: Colors.divider },
          ]}
        >
          <Text
            style={[tw`text-sm font-semibold`, { color: Colors.textSecondary }]}
          >
            Back
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={resetMutation.isPending}
          activeOpacity={0.8}
          style={[
            tw`flex-1 py-3.5 rounded-xl items-center`,
            {
              backgroundColor: Colors.brand,
              opacity: resetMutation.isPending ? 0.6 : 1,
            },
          ]}
        >
          {resetMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={tw`text-white text-sm font-bold`}>Save New PIN</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WalletPinScreen() {
  const [view, setView] = useState<View>("status");
  const [setupPin, setSetupPin] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const { data: statusData } = usePinStatus();
  const securityQuestion = statusData?.data?.securityQuestion;

  const goStatus = useCallback(() => {
    setView("status");
    setSetupPin("");
    setResetToken(null);
  }, []);

  function renderView() {
    switch (view) {
      case "status":
        return (
          <StatusView
            onSetup={() => setView("setup-1")}
            onReset={() => setView("reset-verify")}
          />
        );
      case "setup-1":
        return (
          <SetupStep1
            onNext={(pin) => {
              setSetupPin(pin);
              setView("setup-2");
            }}
            onCancel={goStatus}
          />
        );
      case "setup-2":
        return (
          <SetupStep2 setupPin={setupPin} onBack={() => setView("setup-1")} />
        );
      case "reset-verify":
        return (
          <ResetVerifyView
            securityQuestion={securityQuestion}
            onVerified={(token) => {
              setResetToken(token);
              setView("reset-pin");
            }}
            onCancel={goStatus}
          />
        );
      case "reset-pin":
        return (
          <ResetPinView
            resetToken={resetToken!}
            onBack={() => setView("reset-verify")}
          />
        );
    }
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View
          style={[
            tw`flex-row items-center px-4 py-4 gap-3`,
            { borderBottomWidth: 1, borderColor: "#F0F0F0" },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text
            style={[
              tw`text-base font-bold flex-1`,
              { color: Colors.textPrimary },
            ]}
          >
            Wallet PIN
          </Text>
        </View>

        <ScrollView
          style={tw`flex-1`}
          contentContainerStyle={tw`px-5 py-6`}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderView()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
