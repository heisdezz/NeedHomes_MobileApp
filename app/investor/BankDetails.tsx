import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { toast } from "sonner-native";
import { Colors } from "@/constants/theme";
import {
  useBanks,
  useMyBankInfo,
  useResolveBankMutation,
  type Bank,
} from "@/lib/queries/investor";
import FormInput from "@/components/ui/form-input";
import PrimaryButton from "@/components/primary-button";
import tw from "@/lib/tw";

// ─── Searchable bank picker ───────────────────────────────────────────────────

function BankPicker({
  banks,
  value,
  onChange,
  disabled,
  isLoading,
  error,
}: {
  banks: Bank[];
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = banks.find((b) => b.code === value);
  const filtered = banks
    .filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 50);

  return (
    <View style={tw`gap-1.5`}>
      <Text style={tw`text-[#1A1A1A] text-sm font-medium`}>Bank Name</Text>
      <TouchableOpacity
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={disabled ? 1 : 0.7}
        style={[
          tw`flex-row items-center bg-white border rounded-xl px-4 py-3.5`,
          {
            borderColor: error ? "#F87171" : "#E0E0E0",
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.brand} style={tw`mr-2`} />
        ) : null}
        <Text
          style={[
            tw`flex-1 text-sm`,
            { color: selected ? "#1A1A1A" : "#A0A0A0" },
          ]}
        >
          {selected ? selected.name : "Select bank..."}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#A0A0A0" />
      </TouchableOpacity>
      {error ? <Text style={tw`text-red-500 text-xs`}>{error}</Text> : null}

      <Modal visible={open} animationType="slide" transparent>
        <View style={tw`flex-1 bg-black/40 justify-end`}>
          <SafeAreaView
            style={[
              tw`bg-white rounded-t-3xl`,
              { maxHeight: "80%" },
            ]}
            edges={["bottom"]}
          >
            {/* Modal header */}
            <View
              style={[
                tw`flex-row items-center px-4 py-4`,
                { borderBottomWidth: 1, borderColor: "#F0F0F0" },
              ]}
            >
              <Text style={tw`flex-1 text-base font-semibold text-[#1A1A1A] text-center`}>
                Select Bank
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={tw`px-4 py-3`}>
              <View
                style={[
                  tw`flex-row items-center bg-[#F5F5F7] rounded-xl px-3 py-2.5 gap-2`,
                ]}
              >
                <Ionicons name="search" size={16} color="#9CA3AF" />
                <TextInput
                  style={tw`flex-1 text-sm text-[#1A1A1A]`}
                  placeholder="Search bank..."
                  placeholderTextColor="#9CA3AF"
                  value={search}
                  onChangeText={setSearch}
                  autoFocus
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")}>
                    <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item.code);
                    setSearch("");
                    setOpen(false);
                  }}
                  style={[
                    tw`px-6 py-4 flex-row items-center justify-between`,
                    { borderBottomWidth: 1, borderColor: "#F5F5F5" },
                  ]}
                >
                  <Text style={tw`text-sm text-[#1A1A1A] flex-1`}>{item.name}</Text>
                  {item.code === value && (
                    <Ionicons name="checkmark" size={18} color={Colors.brand} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={tw`text-sm text-center text-[#9CA3AF] py-8`}>
                  No banks found
                </Text>
              }
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

// ─── Info / warning banners ───────────────────────────────────────────────────

function InfoBanner({
  message,
  variant = "info",
}: {
  message: React.ReactNode;
  variant?: "info" | "warning";
}) {
  const styles = {
    info: { bg: "#EFF6FF", border: "#BFDBFE", icon: "#3B82F6" as const, text: "#1E40AF" },
    warning: { bg: "#FFFBEB", border: "#FDE68A", icon: "#F59E0B" as const, text: "#92400E" },
  }[variant];

  return (
    <View
      style={[
        tw`flex-row items-start gap-3 p-4 rounded-xl`,
        { backgroundColor: styles.bg, borderWidth: 1, borderColor: styles.border },
      ]}
    >
      <Ionicons name="information-circle" size={18} color={styles.icon} style={tw`mt-0.5`} />
      <Text style={[tw`flex-1 text-sm leading-5`, { color: styles.text }]}>
        {message}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BankDetailsScreen() {
  const { data: banksData, isLoading: banksLoading } = useBanks();
  const { data: myBankData, isLoading: myBankLoading } = useMyBankInfo();
  const resolveMutation = useResolveBankMutation();

  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [errors, setErrors] = useState<{ accountNumber?: string; bankCode?: string }>({});

  const banks = banksData?.data ?? [];
  const bankExists = !!myBankData?.data;
  const existing = myBankData?.data;

  // Pre-fill from existing info once loaded
  if (existing && !accountNumber && !bankCode) {
    setAccountNumber(existing.account_number);
    setBankCode(existing.bank_code);
    setAccountName(existing.account_name);
  }

  function validate() {
    const e: typeof errors = {};
    if (!accountNumber.trim()) e.accountNumber = "Account number is required";
    else if (accountNumber.trim().length !== 10) e.accountNumber = "Must be 10 digits";
    if (!bankCode) e.bankCode = "Please select a bank";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    toast.promise(
      resolveMutation.mutateAsync({ accountNumber: accountNumber.trim(), bankCode }),
      {
        loading: "Resolving bank details...",
        success: (res) => {
          setAccountName(res.data.account_name);
          return `Account resolved: ${res.data.account_name}`;
        },
        error: (err) => err?.response?.data?.message ?? "Failed to resolve account",
      }
    );
  }

  if (myBankLoading) {
    return (
      <SafeAreaView style={tw`flex-1 bg-white`} edges={["top", "bottom"]}>
        <View style={tw`flex-1 items-center justify-center gap-3`}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
            Loading bank information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-white`} edges={["top", "bottom"]}>
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
        <Text style={[tw`text-base font-bold flex-1`, { color: Colors.textPrimary }]}>
          Bank Details
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`px-5 py-6 gap-5`}
        keyboardShouldPersistTaps="handled"
      >
        {/* Existing bank notice */}
        {bankExists && (
          <InfoBanner
            variant="info"
            message={
              <>
                Your bank details are already on file. To update them, please contact{" "}
                <Text style={tw`font-bold`}>customer support</Text>.
              </>
            }
          />
        )}

        {/* Account Number */}
        <FormInput
          label="Account Number"
          placeholder="Enter 10-digit account number"
          value={accountNumber}
          onChangeText={(t) => {
            setAccountNumber(t.replace(/\D/g, "").slice(0, 10));
            if (errors.accountNumber) setErrors((e) => ({ ...e, accountNumber: undefined }));
          }}
          keyboardType="number-pad"
          maxLength={10}
          editable={!bankExists}
          error={errors.accountNumber}
        />

        {/* Bank */}
        <BankPicker
          banks={banks}
          value={bankCode}
          onChange={(code) => {
            setBankCode(code);
            if (errors.bankCode) setErrors((e) => ({ ...e, bankCode: undefined }));
          }}
          disabled={bankExists || banksLoading}
          isLoading={banksLoading}
          error={errors.bankCode}
        />

        {/* Account Name (readonly) */}
        <View style={tw`gap-1.5`}>
          <Text style={tw`text-[#1A1A1A] text-sm font-medium`}>Account Name</Text>
          <View
            style={[
              tw`flex-row items-center bg-[#F5F5F7] border border-[#E0E0E0] rounded-xl px-4 py-3.5`,
            ]}
          >
            <Text
              style={[
                tw`flex-1 text-sm`,
                { color: accountName ? Colors.textPrimary : "#A0A0A0" },
              ]}
            >
              {accountName || "Auto-filled after resolving"}
            </Text>
            {resolveMutation.isPending && (
              <ActivityIndicator size="small" color={Colors.brand} />
            )}
          </View>
        </View>

        {/* Warning banner — only when no existing bank */}
        {!bankExists && (
          <InfoBanner
            variant="warning"
            message={
              <>
                Once saved, bank details{" "}
                <Text style={tw`font-bold`}>cannot be changed</Text> without
                contacting customer support.
              </>
            }
          />
        )}

        {/* Submit */}
        {!bankExists && (
          <PrimaryButton
            label={resolveMutation.isPending ? "Resolving..." : "Save Bank Details"}
            onPress={handleSubmit}
            loading={resolveMutation.isPending}
            disabled={resolveMutation.isPending}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
