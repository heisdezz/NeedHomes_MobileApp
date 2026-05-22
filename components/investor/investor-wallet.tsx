import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { toast } from "sonner-native";
import * as WebBrowser from "expo-web-browser";
import { Colors } from "@/constants/theme";
import {
  useWallet,
  useDepositMutation,
  useWithdrawalMutation,
  usePinStatus,
  type WalletTransaction,
} from "@/lib/queries/investor";
import { extract_message } from "@/helpers/apihelpers";
import { useKyc } from "@/store";
import tw from "@/lib/tw";

// ─── Transaction row ──────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: WalletTransaction }) {
  const isWithdrawal = tx.type === "WITHDRAWAL";
  const isPromotion = tx.type === "PROMOTION";
  const iconName = isWithdrawal ? "arrow-up-circle" : "arrow-down-circle";
  const iconColor = isWithdrawal ? Colors.error : isPromotion ? "#9333EA" : Colors.success;
  const iconBg = isWithdrawal ? "#FEE2E2" : isPromotion ? "#F3E8FF" : "#D1FAE5";
  const label = isWithdrawal ? "Withdrawal" : isPromotion ? "Promotion Reward" : "Deposit";
  const statusColor =
    tx.status === "SUCCESS"
      ? Colors.success
      : tx.status === "PENDING"
        ? Colors.brand
        : Colors.error;

  return (
    <View style={[tw`flex-row items-center gap-3 p-3 rounded-xl mb-2`, { backgroundColor: Colors.inputBg }]}>
      <View style={[tw`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>
      <View style={tw`flex-1`}>
        <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>{label}</Text>
        <Text style={[tw`text-xs mt-0.5`, { color: Colors.textMuted }]}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={tw`items-end`}>
        <Text style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}>
          {isWithdrawal ? "−" : "+"} ₦{(tx.amount / 100).toLocaleString()}
        </Text>
        <Text style={[tw`text-xs mt-0.5 font-medium`, { color: statusColor }]}>
          {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
        </Text>
      </View>
    </View>
  );
}

// ─── Amount / PIN modal ───────────────────────────────────────────────────────

type ModalType = "deposit" | "withdraw";

function useLockedCountdown(lockedUntil?: string) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    if (!lockedUntil) { setRemaining(""); return; }
    const tick = () => {
      const diff = new Date(lockedUntil).getTime() - Date.now();
      if (diff <= 0) { setRemaining(""); return; }
      setRemaining(`${Math.floor(diff / 60000)}m ${Math.floor((diff % 60000) / 1000)}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);
  return remaining;
}

function AmountModal({
  visible,
  type,
  isPending,
  pinStatus,
  pinStatusLoading,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  type: ModalType;
  isPending: boolean;
  pinStatus: { isSetUp: boolean; isLocked?: boolean; lockedUntil?: string } | undefined;
  pinStatusLoading: boolean;
  onConfirm: (amount: number, pin: string) => void;
  onClose: () => void;
}) {
  const [raw, setRaw] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const countdown = useLockedCountdown(pinStatus?.lockedUntil);

  const pinNotSetUp = type === "withdraw" && !pinStatus?.isSetUp;
  const pinLocked = type === "withdraw" && pinStatus?.isLocked;
  const canConfirm = type === "deposit" || (pinStatus?.isSetUp && !pinStatus?.isLocked);

  function handleConfirm() {
    const n = Number(raw);
    if (!raw || isNaN(n) || n <= 0) { toast.error("Enter a valid amount"); return; }
    if (type === "withdraw" && !pin) { setPinError("Enter your withdrawal PIN"); return; }
    onConfirm(n, pin);
  }

  function handleClose() {
    setRaw("");
    setPin("");
    setPinError("");
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={tw`flex-1`} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableOpacity style={[tw`flex-1`, { backgroundColor: "rgba(0,0,0,0.5)" }]} activeOpacity={1} onPress={handleClose} />
        <View style={[tw`rounded-t-3xl px-5 pt-6 pb-10`, { backgroundColor: "#fff" }]}>
          <View style={[tw`w-10 h-1 rounded-full self-center mb-5`, { backgroundColor: Colors.divider }]} />

          <Text style={[tw`text-lg font-bold mb-1`, { color: Colors.textPrimary }]}>
            {type === "deposit" ? "Deposit" : "Withdraw"} Funds
          </Text>
          <Text style={[tw`text-sm mb-5`, { color: Colors.textSecondary }]}>
            Enter the amount you wish to {type}.
          </Text>

          {/* Amount input */}
          <View style={[tw`flex-row items-center rounded-xl px-4 border mb-4`, { borderColor: Colors.inputBorder, backgroundColor: Colors.inputBg }]}>
            <Text style={[tw`text-base font-bold mr-2`, { color: Colors.textPrimary }]}>₦</Text>
            <TextInput
              value={raw}
              onChangeText={setRaw}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor={Colors.inputPlaceholder}
              style={[tw`flex-1 py-4 text-base`, { color: Colors.textPrimary }]}
            />
          </View>

          {/* Withdraw: PIN section */}
          {type === "withdraw" && (
            pinStatusLoading ? (
              <ActivityIndicator color={Colors.brand} style={tw`py-2 mb-4`} />
            ) : pinNotSetUp ? (
              <View style={[tw`p-4 rounded-xl mb-4`, { backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FDE68A" }]}>
                <Text style={[tw`text-sm font-semibold mb-1`, { color: "#92400E" }]}>Withdrawal PIN not set up</Text>
                <Text style={[tw`text-xs`, { color: "#B45309" }]}>Set up a withdrawal PIN before making withdrawals.</Text>
                <TouchableOpacity onPress={() => { handleClose(); router.push("/investor/wallet-pin"); }} style={tw`mt-2`}>
                  <Text style={[tw`text-xs font-bold`, { color: Colors.brand }]}>Set Up PIN →</Text>
                </TouchableOpacity>
              </View>
            ) : pinLocked ? (
              <View style={[tw`p-4 rounded-xl mb-4`, { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA" }]}>
                <Text style={[tw`text-sm font-semibold mb-1`, { color: "#7F1D1D" }]}>PIN Locked</Text>
                <Text style={[tw`text-xs`, { color: "#B91C1C" }]}>
                  Too many failed attempts.{countdown ? ` Unlocks in ${countdown}.` : ""} Reset your PIN in settings.
                </Text>
                <TouchableOpacity onPress={() => { handleClose(); router.push("/investor/wallet-pin"); }} style={tw`mt-2`}>
                  <Text style={[tw`text-xs font-bold`, { color: Colors.brand }]}>Reset PIN →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={tw`mb-4 gap-1`}>
                <Text style={[tw`text-sm font-medium`, { color: Colors.textPrimary }]}>Withdrawal PIN</Text>
                <View style={[tw`flex-row items-center rounded-xl px-4 border`, { borderColor: pinError ? "#F87171" : Colors.inputBorder, backgroundColor: "#fff" }]}>
                  <TextInput
                    value={pin}
                    onChangeText={(t) => { setPin(t.replace(/\D/g, "").slice(0, 6)); setPinError(""); }}
                    placeholder="••••"
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={6}
                    placeholderTextColor={Colors.inputPlaceholder}
                    style={[tw`flex-1 py-4 text-base`, { color: Colors.textPrimary }]}
                  />
                </View>
                {pinError ? <Text style={tw`text-xs text-red-500`}>{pinError}</Text> : null}
                <TouchableOpacity onPress={() => { handleClose(); router.push("/investor/wallet-pin"); }}>
                  <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>Forgot PIN? Reset in Wallet PIN settings</Text>
                </TouchableOpacity>
              </View>
            )
          )}

          {/* Actions */}
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}
              style={[tw`flex-1 py-4 rounded-xl items-center border`, { borderColor: Colors.divider }]}>
              <Text style={[tw`text-sm font-semibold`, { color: Colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            {canConfirm ? (
              <TouchableOpacity onPress={handleConfirm} disabled={isPending} activeOpacity={0.8}
                style={[tw`flex-1 py-4 rounded-xl items-center`, { backgroundColor: Colors.brand, opacity: isPending ? 0.6 : 1 }]}>
                {isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={tw`text-white text-sm font-bold`}>Confirm</Text>}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => { handleClose(); router.push("/investor/wallet-pin"); }} activeOpacity={0.8}
                style={[tw`flex-1 py-4 rounded-xl items-center`, { backgroundColor: Colors.brand }]}>
                <Text style={tw`text-white text-sm font-bold`}>Manage PIN</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main wallet component ────────────────────────────────────────────────────

export default function InvestorWallet() {
  const [modalType, setModalType] = useState<ModalType>("deposit");
  const [modalVisible, setModalVisible] = useState(false);

  const kyc = useKyc();
  const kycApproved = kyc?.account_verification_status === "VERIFIED";

  const { data, isLoading, refetch } = useWallet();
  const { data: pinStatusData, isLoading: pinStatusLoading, refetch: refetchPinStatus } = usePinStatus();
  const deposit = useDepositMutation();
  const withdraw = useWithdrawalMutation();

  const walletData = data?.data;
  const balance = walletData ? walletData.balance / 100 : 0;
  const isPending = deposit.isPending || withdraw.isPending;
  const pinStatus = pinStatusData?.data;

  function handleOpenModal(type: ModalType) {
    if (!kycApproved) {
      toast.error("Complete KYC verification to use wallet features.");
      return;
    }
    setModalType(type);
    setModalVisible(true);
  }

  const income =
    walletData?.walletTransactions
      .filter((t) => (t.type === "DEPOSIT" || t.type === "PROMOTION") && t.status === "SUCCESS")
      .reduce((acc, t) => acc + t.amount, 0) ?? 0;

  const withdrawals =
    walletData?.walletTransactions
      .filter((t) => t.type === "WITHDRAWAL" && t.status === "SUCCESS")
      .reduce((acc, t) => acc + t.amount, 0) ?? 0;

  async function handleConfirm(amount: number, pin: string) {
    if (modalType === "deposit") {
      setModalVisible(false);
      try {
        const result = await deposit.mutateAsync(amount);
        const { authorization_url } = result.data;
        await WebBrowser.openBrowserAsync(authorization_url);
        refetch();
      } catch (e) {
        toast.error(extract_message(e as any) ?? "Deposit failed");
      }
    } else {
      setModalVisible(false);
      try {
        await withdraw.mutateAsync({ amount, pin });
        toast.success("Withdrawal successful");
        refetch();
      } catch (e) {
        refetchPinStatus();
        toast.error(extract_message(e as any) ?? "Withdrawal failed");
      }
    }
  }

  return (
    <>
      <View style={[tw`mx-4 rounded-2xl overflow-hidden`, { backgroundColor: "#fff", borderWidth: 1, borderColor: Colors.divider, elevation: 3 }]}>

        {/* Card header */}
        <View style={[tw`flex-row items-center justify-between px-4 py-3 border-b`, { borderColor: Colors.divider }]}>
          <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>Wallet</Text>
          <TouchableOpacity
            onPress={() => router.push("/investor/wallet-pin")}
            activeOpacity={0.7}
            style={[
              tw`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full`,
              { backgroundColor: Colors.surface },
            ]}
          >
            <Ionicons name="key-outline" size={13} color="#fff" />
            <Text style={tw`text-xs font-semibold text-white`}>Manage PIN</Text>
          </TouchableOpacity>
        </View>

        {/* Balance band */}
        <View style={[tw`px-5 py-5`, { backgroundColor: Colors.surface }]}>
          <Text style={[tw`text-xs font-semibold tracking-widest mb-2`, { color: "rgba(255,255,255,0.5)" }]}>TOTAL BALANCE</Text>
          <View style={tw`flex-row items-center justify-between`}>
            {isLoading ? (
              <ActivityIndicator color={Colors.brand} />
            ) : (
              <Text style={tw`text-white text-2xl font-bold`}>₦{balance.toLocaleString()}</Text>
            )}
            <TouchableOpacity onPress={() => handleOpenModal("deposit")} activeOpacity={0.8}
              style={[tw`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: "rgba(255,255,255,0.15)", opacity: kycApproved ? 1 : 0.4 }]}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Income / Withdrawal row */}
        <View style={tw`flex-row gap-3 px-4 py-4`}>
          <View style={[tw`flex-1 rounded-xl p-3`, { backgroundColor: "#D1FAE5", borderWidth: 1, borderColor: "#A7F3D0" }]}>
            <Text style={[tw`text-xs font-semibold uppercase mb-1`, { color: Colors.textSecondary }]}>Income</Text>
            <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>₦{(income / 100).toLocaleString()}</Text>
          </View>
          <View style={[tw`flex-1 rounded-xl p-3`, { backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FECACA" }]}>
            <Text style={[tw`text-xs font-semibold uppercase mb-1`, { color: Colors.textSecondary }]}>Withdrawn</Text>
            <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>₦{(withdrawals / 100).toLocaleString()}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={tw`flex-row gap-3 px-4 pb-4`}>
          <TouchableOpacity onPress={() => handleOpenModal("deposit")} activeOpacity={0.8}
            style={[tw`flex-1 py-3.5 rounded-xl items-center border`, { borderColor: Colors.brand, opacity: kycApproved ? 1 : 0.4 }]}>
            <Text style={[tw`text-sm font-bold`, { color: Colors.brand }]}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleOpenModal("withdraw")} activeOpacity={0.8}
            style={[tw`flex-1 py-3.5 rounded-xl items-center`, { backgroundColor: Colors.brand, opacity: kycApproved ? 1 : 0.4 }]}>
            <Text style={tw`text-white text-sm font-bold`}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Recent transactions */}
        <View style={[tw`px-4 pt-3 pb-4 border-t`, { borderColor: Colors.divider, backgroundColor: Colors.inputBg }]}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <View style={tw`flex-row items-center gap-2`}>
              <Text style={[tw`text-xs font-semibold uppercase`, { color: Colors.textSecondary, letterSpacing: 0.8 }]}>Recent</Text>
              <TouchableOpacity
                onPress={() => refetch()}
                activeOpacity={0.7}
                disabled={isLoading}
                style={[
                  tw`flex-row items-center gap-1 px-2 py-1 rounded-full`,
                  { backgroundColor: isLoading ? Colors.divider : Colors.brand + "15" },
                ]}
              >
                <Ionicons
                  name="refresh-outline"
                  size={11}
                  color={isLoading ? Colors.textMuted : Colors.brand}
                />
                <Text style={[tw`text-[10px] font-semibold`, { color: isLoading ? Colors.textMuted : Colors.brand }]}>
                  Refresh
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => router.push("/investor/transactions")} activeOpacity={0.7} style={tw`flex-row items-center gap-1`}>
              <Text style={[tw`text-xs font-semibold`, { color: Colors.brand }]}>View All</Text>
              <Ionicons name="chevron-forward" size={12} color={Colors.brand} />
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <ActivityIndicator color={Colors.brand} style={tw`py-4`} />
          ) : walletData && walletData.walletTransactions.length > 0 ? (
            walletData.walletTransactions.slice(0, 5).map((tx) => <TxRow key={tx.id} tx={tx} />)
          ) : (
            <Text style={[tw`text-xs text-center py-4`, { color: Colors.textMuted }]}>No recent activity</Text>
          )}
        </View>
      </View>

      <AmountModal
        visible={modalVisible}
        type={modalType}
        isPending={isPending}
        pinStatus={pinStatus}
        pinStatusLoading={pinStatusLoading}
        onConfirm={handleConfirm}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}
