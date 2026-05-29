import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { toast } from "sonner-native";
import { extract_message } from "@/helpers/apihelpers";
import { Colors } from "@/constants/theme";
import {
  useWallet,
  useWithdrawalMutation,
  usePinStatus,
  type WalletTransaction,
} from "@/lib/queries/investor";
import tw from "@/lib/tw";

function TxRow({ tx }: { tx: WalletTransaction }) {
  const isDeposit = tx.type === "DEPOSIT";
  const statusColor =
    tx.status === "SUCCESS" ? Colors.success : tx.status === "PENDING" ? Colors.brand : Colors.error;

  return (
    <View style={[tw`flex-row items-center gap-3 p-3 rounded-xl mb-2`, { backgroundColor: Colors.inputBg }]}>
      <View
        style={[
          tw`w-9 h-9 rounded-full items-center justify-center`,
          { backgroundColor: isDeposit ? "#D1FAE5" : "#FEE2E2" },
        ]}
      >
        <Ionicons
          name={isDeposit ? "arrow-down-circle" : "arrow-up-circle"}
          size={20}
          color={isDeposit ? Colors.success : Colors.error}
        />
      </View>
      <View style={tw`flex-1`}>
        <Text style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}>
          {isDeposit ? "Deposit" : "Withdrawal"}
        </Text>
        <Text style={[tw`text-xs mt-0.5`, { color: Colors.textMuted }]}>
          {new Date(tx.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={tw`items-end`}>
        <Text style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}>
          {isDeposit ? "+" : "−"} ₦{(tx.amount / 100).toLocaleString()}
        </Text>
        <Text style={[tw`text-xs font-medium`, { color: statusColor }]}>
          {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
        </Text>
      </View>
    </View>
  );
}

function WithdrawModal({
  visible,
  isPending,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  isPending: boolean;
  onConfirm: (amount: number, pin: string) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const { data: pinStatusData } = usePinStatus();
  const pinStatus = pinStatusData?.data;

  const handleConfirm = () => {
    const n = Number(amount);
    if (!amount || isNaN(n) || n <= 0) { toast.error("Enter a valid amount"); return; }
    if (!pin) { toast.error("Enter your withdrawal PIN"); return; }
    onConfirm(n, pin);
  };

  const handleClose = () => { setAmount(""); setPin(""); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={tw`flex-1`} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <TouchableOpacity style={[tw`flex-1`, { backgroundColor: "rgba(0,0,0,0.5)" }]} activeOpacity={1} onPress={handleClose} />
        <View style={[tw`rounded-t-3xl px-5 pt-6 pb-10`, { backgroundColor: "#fff" }]}>
          <View style={[tw`w-10 h-1 rounded-full self-center mb-5`, { backgroundColor: Colors.divider }]} />
          <Text style={[tw`text-lg font-bold mb-1`, { color: Colors.textPrimary }]}>Withdraw Funds</Text>
          <Text style={[tw`text-sm mb-5`, { color: Colors.textSecondary }]}>Enter amount and your PIN.</Text>

          <View style={[tw`flex-row items-center rounded-xl px-4 border mb-4`, { borderColor: Colors.inputBorder, backgroundColor: Colors.inputBg }]}>
            <Text style={[tw`text-base font-bold mr-2`, { color: Colors.textPrimary }]}>₦</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor={Colors.inputPlaceholder}
              style={[tw`flex-1 py-4 text-base`, { color: Colors.textPrimary }]}
            />
          </View>

          {pinStatus?.isSetUp ? (
            <View style={[tw`flex-row items-center rounded-xl px-4 border mb-6`, { borderColor: Colors.inputBorder, backgroundColor: Colors.inputBg }]}>
              <TextInput
                value={pin}
                onChangeText={(t) => setPin(t.replace(/\D/g, "").slice(0, 6))}
                placeholder="Withdrawal PIN"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
                placeholderTextColor={Colors.inputPlaceholder}
                style={[tw`flex-1 py-4 text-base`, { color: Colors.textPrimary }]}
              />
            </View>
          ) : (
            <View style={[tw`p-4 rounded-xl mb-6`, { backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FDE68A" }]}>
              <Text style={[tw`text-sm font-semibold mb-1`, { color: "#92400E" }]}>Withdrawal PIN not set up</Text>
              <TouchableOpacity onPress={() => { handleClose(); router.push("/investor/wallet-pin"); }}>
                <Text style={[tw`text-xs font-bold`, { color: Colors.brand }]}>Set Up PIN →</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity onPress={handleClose} style={[tw`flex-1 py-4 rounded-xl items-center border`, { borderColor: Colors.divider }]}>
              <Text style={[tw`text-sm font-semibold`, { color: Colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            {pinStatus?.isSetUp && (
              <TouchableOpacity onPress={handleConfirm} disabled={isPending} style={[tw`flex-1 py-4 rounded-xl items-center`, { backgroundColor: Colors.brand, opacity: isPending ? 0.6 : 1 }]}>
                {isPending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={tw`text-white text-sm font-bold`}>Confirm</Text>}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function PartnerWallet() {
  const [modalVisible, setModalVisible] = useState(false);
  const { data, isLoading, refetch } = useWallet();
  const withdraw = useWithdrawalMutation();

  const walletData = data?.data;
  const balance = walletData ? walletData.balance / 100 : 0;

  const income = walletData?.walletTransactions
    .filter((t) => t.type === "DEPOSIT" && t.status === "SUCCESS")
    .reduce((acc, t) => acc + t.amount, 0) ?? 0;

  const withdrawn = walletData?.walletTransactions
    .filter((t) => t.type === "WITHDRAWAL" && t.status === "SUCCESS")
    .reduce((acc, t) => acc + t.amount, 0) ?? 0;

  const handleWithdraw = (amount: number, pin: string) => {
    toast.promise(withdraw.mutateAsync({ amount, pin }), {
      loading: "Processing…",
      success: () => "Withdrawal successful",
      error: (e) => extract_message(e) || "Withdrawal failed",
    });
    setModalVisible(false);
  };

  return (
    <>
      <View style={[tw`mx-4 rounded-2xl overflow-hidden`, { backgroundColor: "#fff", borderWidth: 1, borderColor: Colors.divider }]}>
        {/* Card header */}
        <View style={[tw`flex-row items-center justify-between px-4 py-3 border-b`, { borderColor: Colors.divider }]}>
          <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>Wallet</Text>
          <TouchableOpacity onPress={() => router.push("/investor/wallet-pin")} activeOpacity={0.7}
            style={[tw`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full`, { backgroundColor: Colors.surface }]}>
            <Ionicons name="key-outline" size={13} color="#fff" />
            <Text style={tw`text-xs font-semibold text-white`}>Manage PIN</Text>
          </TouchableOpacity>
        </View>

        {/* Balance band */}
        <View style={[tw`px-5 py-5`, { backgroundColor: Colors.surface }]}>
          <Text style={[tw`text-xs font-semibold tracking-widest mb-2`, { color: "rgba(255,255,255,0.5)" }]}>
            TOTAL BALANCE
          </Text>
          <View style={tw`flex-row items-center justify-between`}>
            {isLoading ? (
              <ActivityIndicator color={Colors.brand} />
            ) : (
              <Text style={tw`text-white text-2xl font-bold`}>₦{balance.toLocaleString()}</Text>
            )}
            <TouchableOpacity onPress={() => refetch()} activeOpacity={0.7}
              style={[tw`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Income / Withdrawn */}
        <View style={tw`flex-row gap-3 px-4 py-4`}>
          <View style={[tw`flex-1 rounded-xl p-3`, { backgroundColor: "#D1FAE5", borderWidth: 1, borderColor: "#A7F3D0" }]}>
            <Text style={[tw`text-xs font-semibold uppercase mb-1`, { color: Colors.textSecondary }]}>Income</Text>
            <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>₦{(income / 100).toLocaleString()}</Text>
          </View>
          <View style={[tw`flex-1 rounded-xl p-3`, { backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FECACA" }]}>
            <Text style={[tw`text-xs font-semibold uppercase mb-1`, { color: Colors.textSecondary }]}>Withdraw</Text>
            <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>₦{(withdrawn / 100).toLocaleString()}</Text>
          </View>
        </View>

        {/* Withdraw button */}
        <View style={tw`px-4 pb-4`}>
          <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.85}
            style={[tw`w-full py-3.5 rounded-xl items-center`, { backgroundColor: Colors.brand }]}>
            <Text style={tw`text-white text-sm font-bold`}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Recent transactions */}
        <View style={[tw`px-4 pt-3 pb-4 border-t`, { borderColor: Colors.divider, backgroundColor: Colors.inputBg }]}>
          <View style={tw`flex-row items-center justify-between mb-3`}>
            <View style={tw`flex-row items-center gap-2`}>
              <Text style={[tw`text-xs font-semibold uppercase`, { color: Colors.textSecondary, letterSpacing: 0.8 }]}>Recents</Text>
              <TouchableOpacity onPress={() => refetch()} activeOpacity={0.7} disabled={isLoading}
                style={[tw`flex-row items-center gap-1 px-2 py-1 rounded-full`, { backgroundColor: isLoading ? Colors.divider : Colors.brand + "15" }]}>
                <Ionicons name="refresh-outline" size={11} color={isLoading ? Colors.textMuted : Colors.brand} />
                <Text style={[tw`text-[10px] font-semibold`, { color: isLoading ? Colors.textMuted : Colors.brand }]}>Refresh</Text>
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
            walletData.walletTransactions.slice(0, 3).map((tx) => <TxRow key={tx.id} tx={tx} />)
          ) : (
            <Text style={[tw`text-xs text-center py-4`, { color: Colors.textMuted }]}>No recent activity</Text>
          )}
        </View>
      </View>

      <WithdrawModal
        visible={modalVisible}
        isPending={withdraw.isPending}
        onConfirm={handleWithdraw}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}
