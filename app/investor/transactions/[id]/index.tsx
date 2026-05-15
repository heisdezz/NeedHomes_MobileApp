import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Clipboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useTransaction, type Transaction } from "@/lib/queries/investor";
import tw from "@/lib/tw";

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <TouchableOpacity
      onPress={handleCopy}
      activeOpacity={0.7}
      hitSlop={8}
      style={[
        tw`w-7 h-7 rounded-lg items-center justify-center`,
        { backgroundColor: Colors.inputBg },
      ]}
    >
      <Ionicons
        name={copied ? "checkmark" : "copy-outline"}
        size={14}
        color={copied ? Colors.success : Colors.textMuted}
      />
    </TouchableOpacity>
  );
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  Transaction["type"],
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    iconColor: string;
    accent: string;
  }
> = {
  DEPOSIT: {
    label: "Deposit",
    icon: "arrow-down-circle",
    iconBg: "#D1FAE5",
    iconColor: "#16A34A",
    accent: "#22C55E",
  },
  INVESTMENT: {
    label: "Investment",
    icon: "trending-up",
    iconBg: "#DBEAFE",
    iconColor: "#2563EB",
    accent: "#3B82F6",
  },
  WITHDRAWAL: {
    label: "Withdrawal",
    icon: "arrow-up-circle",
    iconBg: "#FEE2E2",
    iconColor: "#DC2626",
    accent: Colors.brand,
  },
};

const STATUS_CONFIG: Record<
  Transaction["status"],
  { bg: string; text: string; dot: string; label: string }
> = {
  SUCCESS: { bg: "#D1FAE5", text: "#065F46", dot: "#22C55E", label: "Success" },
  PENDING: { bg: "#FEF9C3", text: "#78350F", dot: "#F59E0B", label: "Pending" },
  FAILED: { bg: "#FEE2E2", text: "#7F1D1D", dot: "#EF4444", label: "Failed" },
};

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  mono = false,
  copyable = false,
  last = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
  last?: boolean;
}) {
  return (
    <>
      <View style={tw`flex-row items-center justify-between px-4 py-3.5`}>
        <Text
          style={[tw`text-sm flex-shrink-0`, { color: Colors.textSecondary }]}
        >
          {label}
        </Text>
        <View style={tw`flex-row items-center gap-2 flex-1 justify-end ml-4`}>
          <Text
            style={[
              tw`text-sm text-right flex-shrink`,
              {
                color: Colors.textPrimary,
                fontFamily: mono ? "monospace" : undefined,
              },
              mono && { fontSize: 12 },
            ]}
            numberOfLines={1}
          >
            {value}
          </Text>
          {copyable && <CopyButton text={value} />}
        </View>
      </View>
      {!last && <View style={{ height: 1, backgroundColor: Colors.inputBg }} />}
    </>
  );
}

function fmt(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError } = useTransaction(id);

  return (
    <SafeAreaView style={tw`flex-1 bg-[#F9FAFB]`} edges={["top", "bottom"]}>
      {/* Header */}
      <View
        style={[
          tw`flex-row items-center px-4 py-4 gap-3 bg-white`,
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
          Transaction Details
        </Text>
      </View>

      {isLoading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator color={Colors.brand} size="large" />
        </View>
      ) : isError || !data?.data ? (
        <View style={tw`flex-1 items-center justify-center gap-3 px-8`}>
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color={Colors.error}
          />
          <Text
            style={[tw`text-sm text-center`, { color: Colors.textSecondary }]}
          >
            Failed to load transaction.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={[
              tw`px-5 py-2.5 rounded-xl`,
              { backgroundColor: Colors.brand },
            ]}
          >
            <Text style={tw`text-white text-sm font-bold`}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        (() => {
          const trx = data.data;
          const typeStyle = TYPE_CONFIG[trx.type] ?? TYPE_CONFIG.DEPOSIT;
          const statusStyle =
            STATUS_CONFIG[trx.status] ?? STATUS_CONFIG.PENDING;

          return (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={tw`p-4 gap-4 pb-10`}
            >
              {/* Hero card */}
              <View
                style={[
                  tw`rounded-2xl overflow-hidden`,
                  {
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: Colors.divider,
                  },
                ]}
              >
                {/* Accent strip */}
                <View
                  style={{ height: 4, backgroundColor: typeStyle.accent }}
                />

                <View style={tw`p-5 gap-4`}>
                  {/* Type + status row */}
                  <View style={tw`flex-row items-start justify-between gap-3`}>
                    <View style={tw`flex-row items-center gap-3 flex-1`}>
                      <View
                        style={[
                          tw`w-12 h-12 rounded-2xl items-center justify-center`,
                          { backgroundColor: typeStyle.iconBg },
                        ]}
                      >
                        <Ionicons
                          name={typeStyle.icon}
                          size={24}
                          color={typeStyle.iconColor}
                        />
                      </View>
                      <View style={tw`flex-1`}>
                        <Text
                          style={[
                            tw`text-base font-bold`,
                            { color: Colors.textPrimary },
                          ]}
                        >
                          {typeStyle.label} Transaction
                        </Text>
                        <View style={tw`flex-row items-center gap-1.5 mt-1`}>
                          <View
                            style={[
                              tw`w-1.5 h-1.5 rounded-full`,
                              { backgroundColor: statusStyle.dot },
                            ]}
                          />
                          <Text
                            style={[
                              tw`text-xs font-semibold`,
                              { color: statusStyle.text },
                            ]}
                          >
                            {statusStyle.label}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Amount */}
                    <View
                      style={[
                        tw`rounded-xl px-4 py-2 items-end`,
                        {
                          backgroundColor: "#FFF7ED",
                          borderWidth: 1,
                          borderColor: "#FED7AA",
                        },
                      ]}
                    >
                      <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>
                        Amount
                      </Text>
                      <Text
                        style={[tw`text-lg font-bold`, { color: Colors.brand }]}
                      >
                        {fmt(trx.amount)}
                      </Text>
                    </View>
                  </View>

                  {/* Reference */}
                  <View
                    style={[
                      tw`flex-row items-center gap-3 p-3 rounded-xl`,
                      { backgroundColor: Colors.inputBg },
                    ]}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color={Colors.textMuted}
                    />
                    <View style={tw`flex-1`}>
                      <Text
                        style={[
                          tw`text-[10px] uppercase font-semibold mb-0.5`,
                          { color: Colors.textMuted, letterSpacing: 0.6 },
                        ]}
                      >
                        Reference
                      </Text>
                      <Text
                        style={[
                          tw`text-xs font-mono`,
                          { color: Colors.textPrimary },
                        ]}
                        numberOfLines={1}
                      >
                        {trx.reference}
                      </Text>
                    </View>
                    <CopyButton text={trx.reference} />
                  </View>
                </View>
              </View>

              {/* Details card */}
              <View
                style={[
                  tw`rounded-2xl overflow-hidden`,
                  {
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: Colors.divider,
                  },
                ]}
              >
                <View
                  style={[
                    tw`flex-row items-center gap-2 px-4 py-3`,
                    {
                      backgroundColor: Colors.inputBg,
                      borderBottomWidth: 1,
                      borderColor: Colors.divider,
                    },
                  ]}
                >
                  <Ionicons
                    name="wallet-outline"
                    size={15}
                    color={Colors.textSecondary}
                  />
                  <Text
                    style={[
                      tw`text-xs font-bold uppercase tracking-wider`,
                      { color: Colors.textSecondary },
                    ]}
                  >
                    Transaction Details
                  </Text>
                </View>

                <DetailRow
                  label="Transaction ID"
                  value={trx.id}
                  mono
                  copyable
                />
                <DetailRow
                  label="Wallet ID"
                  value={trx.walletId}
                  mono
                  copyable
                />
                <DetailRow label="Type" value={typeStyle.label} />
                <DetailRow label="Status" value={statusStyle.label} />
                <DetailRow label="Amount" value={fmt(trx.amount)} />
                <DetailRow label="Created" value={fmtDate(trx.createdAt)} />
                <DetailRow
                  label="Last Updated"
                  value={fmtDate(trx.updatedAt)}
                  last
                />
              </View>
            </ScrollView>
          );
        })()
      )}
    </SafeAreaView>
  );
}
