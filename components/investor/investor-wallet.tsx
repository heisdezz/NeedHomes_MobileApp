import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { toast } from "sonner-native";
import { Colors } from "@/constants/theme";
import {
  useWallet,
  useDepositMutation,
  useWithdrawalMutation,
  type WalletTransaction,
} from "@/lib/queries/investor";
import { extract_message } from "@/helpers/apihelpers";
import tw from "@/lib/tw";

// ─── Transaction row ──────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: WalletTransaction }) {
  const isDeposit = tx.type === "DEPOSIT";
  const iconName = isDeposit ? "arrow-down-circle" : "arrow-up-circle";
  const iconColor = isDeposit ? Colors.success : Colors.error;
  const statusColor =
    tx.status === "SUCCESS"
      ? Colors.success
      : tx.status === "PENDING"
        ? Colors.brand
        : Colors.error;

  return (
    <View
      style={[
        tw`flex-row items-center gap-3 p-3 rounded-xl mb-2`,
        { backgroundColor: Colors.inputBg },
      ]}
    >
      <View
        style={[
          tw`w-10 h-10 rounded-full items-center justify-center`,
          { backgroundColor: isDeposit ? "#D1FAE5" : "#FEE2E2" },
        ]}
      >
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>

      <View style={tw`flex-1`}>
        <Text
          style={[tw`text-sm font-semibold`, { color: Colors.textPrimary }]}
        >
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
        <Text style={[tw`text-xs mt-0.5 font-medium`, { color: statusColor }]}>
          {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
        </Text>
      </View>
    </View>
  );
}

// ─── Amount modal ─────────────────────────────────────────────────────────────

type ModalType = "deposit" | "withdraw";

function AmountModal({
  visible,
  type,
  isPending,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  type: ModalType;
  isPending: boolean;
  onConfirm: (amount: number) => void;
  onClose: () => void;
}) {
  const [raw, setRaw] = useState("");
  const label = type === "deposit" ? "Deposit" : "Withdraw";

  function handleConfirm() {
    const n = Number(raw);
    if (!raw || isNaN(n) || n <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    onConfirm(n);
  }

  function handleClose() {
    setRaw("");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity
          style={[tw`flex-1`, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View
          style={[
            tw`rounded-t-3xl px-5 pt-6 pb-10`,
            { backgroundColor: "#fff" },
          ]}
        >
          {/* Handle */}
          <View
            style={[
              tw`w-10 h-1 rounded-full self-center mb-5`,
              { backgroundColor: Colors.divider },
            ]}
          />

          <Text
            style={[tw`text-lg font-bold mb-1`, { color: Colors.textPrimary }]}
          >
            {label} Funds
          </Text>
          <Text style={[tw`text-sm mb-5`, { color: Colors.textSecondary }]}>
            Enter the amount you wish to {type.toLowerCase()}.
          </Text>

          {/* Input */}
          <View
            style={[
              tw`flex-row items-center rounded-xl px-4 border mb-5`,
              {
                borderColor: Colors.inputBorder,
                backgroundColor: Colors.inputBg,
              },
            ]}
          >
            <Text
              style={[
                tw`text-base font-bold mr-2`,
                { color: Colors.textPrimary },
              ]}
            >
              ₦
            </Text>
            <TextInput
              value={raw}
              onChangeText={setRaw}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor={Colors.inputPlaceholder}
              style={[tw`flex-1 py-4 text-base`, { color: Colors.textPrimary }]}
            />
          </View>

          {/* Actions */}
          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.7}
              style={[
                tw`flex-1 py-4 rounded-xl items-center border`,
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
              onPress={handleConfirm}
              disabled={isPending}
              activeOpacity={0.8}
              style={[
                tw`flex-1 py-4 rounded-xl items-center`,
                { backgroundColor: Colors.brand, opacity: isPending ? 0.6 : 1 },
              ]}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={tw`text-white text-sm font-bold`}>Confirm</Text>
              )}
            </TouchableOpacity>
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

  const { data, isLoading, refetch } = useWallet();
  const deposit = useDepositMutation();
  const withdraw = useWithdrawalMutation();

  const walletData = data?.data;
  const balance = walletData ? walletData.balance / 100 : 0;
  const isPending = deposit.isPending || withdraw.isPending;

  const income =
    walletData?.walletTransactions
      .filter((t) => t.type === "DEPOSIT" && t.status === "SUCCESS")
      .reduce((acc, t) => acc + t.amount, 0) ?? 0;

  const withdrawals =
    walletData?.walletTransactions
      .filter((t) => t.type === "WITHDRAWAL" && t.status === "SUCCESS")
      .reduce((acc, t) => acc + t.amount, 0) ?? 0;

  function openModal(type: ModalType) {
    setModalType(type);
    setModalVisible(true);
  }

  async function handleConfirm(amount: number) {
    const mutation = modalType === "deposit" ? deposit : withdraw;
    try {
      const label = modalType === "deposit" ? "Deposit" : "Withdrawal";
      toast.promise(mutation.mutateAsync(amount), {
        loading: "Processing…",
        success: () => `${label} successful`,
        error: extract_message as any,
      });
      setModalVisible(false);
      refetch();
    } catch {
      // toast.promise handles the error display
    }
  }

  return (
    <>
      <View
        style={[
          tw`mx-4 rounded-2xl overflow-hidden`,
          {
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: Colors.divider,
            elevation: 3,
          },
        ]}
      >
          {/* Card header */}
          <View
            style={[
              tw`flex-row items-center justify-between px-4 py-3 border-b`,
              { borderColor: Colors.divider },
            ]}
          >
            <Text
              style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}
            >
              Wallet
            </Text>
          </View>

          {/* Balance band */}
          <View style={[tw`px-5 py-5`, { backgroundColor: Colors.surface }]}>
            <Text
              style={[
                tw`text-xs font-semibold tracking-widest mb-2`,
                { color: "rgba(255,255,255,0.5)" },
              ]}
            >
              TOTAL BALANCE
            </Text>
            <View style={tw`flex-row items-center justify-between`}>
              {isLoading ? (
                <ActivityIndicator color={Colors.brand} />
              ) : (
                <Text style={tw`text-white text-2xl font-bold`}>
                  ₦{balance.toLocaleString()}
                </Text>
              )}
              <TouchableOpacity
                onPress={() => openModal("deposit")}
                activeOpacity={0.8}
                style={[
                  tw`w-10 h-10 rounded-full items-center justify-center`,
                  { backgroundColor: "rgba(255,255,255,0.15)" },
                ]}
              >
                <Ionicons name="add" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Income / Withdrawal row */}
          <View style={tw`flex-row gap-3 px-4 py-4`}>
            <View
              style={[
                tw`flex-1 rounded-xl p-3`,
                {
                  backgroundColor: "#D1FAE5",
                  borderWidth: 1,
                  borderColor: "#A7F3D0",
                },
              ]}
            >
              <Text
                style={[
                  tw`text-xs font-semibold uppercase mb-1`,
                  { color: Colors.textSecondary },
                ]}
              >
                Income
              </Text>
              <Text
                style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}
              >
                ₦{(income / 100).toLocaleString()}
              </Text>
            </View>
            <View
              style={[
                tw`flex-1 rounded-xl p-3`,
                {
                  backgroundColor: "#FEE2E2",
                  borderWidth: 1,
                  borderColor: "#FECACA",
                },
              ]}
            >
              <Text
                style={[
                  tw`text-xs font-semibold uppercase mb-1`,
                  { color: Colors.textSecondary },
                ]}
              >
                Withdrawn
              </Text>
              <Text
                style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}
              >
                ₦{(withdrawals / 100).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={tw`flex-row gap-3 px-4 pb-4`}>
            <TouchableOpacity
              onPress={() => openModal("deposit")}
              activeOpacity={0.8}
              style={[
                tw`flex-1 py-3.5 rounded-xl items-center border`,
                { borderColor: Colors.brand },
              ]}
            >
              <Text style={[tw`text-sm font-bold`, { color: Colors.brand }]}>
                Deposit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openModal("withdraw")}
              activeOpacity={0.8}
              style={[
                tw`flex-1 py-3.5 rounded-xl items-center`,
                { backgroundColor: Colors.brand },
              ]}
            >
              <Text style={tw`text-white text-sm font-bold`}>Withdraw</Text>
            </TouchableOpacity>
          </View>

          {/* Recent transactions */}
          <View
            style={[
              tw`px-4 pt-3 pb-4 border-t`,
              { borderColor: Colors.divider, backgroundColor: Colors.inputBg },
            ]}
          >
            <Text
              style={[
                tw`text-xs font-semibold uppercase mb-3`,
                { color: Colors.textSecondary, letterSpacing: 0.8 },
              ]}
            >
              Recent
            </Text>
            {isLoading ? (
              <ActivityIndicator color={Colors.brand} style={tw`py-4`} />
            ) : walletData && walletData.walletTransactions.length > 0 ? (
              walletData.walletTransactions
                .slice(0, 3)
                .map((tx) => <TxRow key={tx.id} tx={tx} />)
            ) : (
              <Text
                style={[
                  tw`text-xs text-center py-4`,
                  { color: Colors.textMuted },
                ]}
              >
                No recent activity
              </Text>
            )}
          </View>
        </View>

      <AmountModal
        visible={modalVisible}
        type={modalType}
        isPending={isPending}
        onConfirm={handleConfirm}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}
