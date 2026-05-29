import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useTransactions, type Transaction } from "@/lib/queries/investor";
import tw from "@/lib/tw";
import Pagination from "@/components/ui/Pagination";

const TYPE_FILTERS = ["ALL", "DEPOSIT", "INVESTMENT", "WITHDRAWAL"] as const;
const STATUS_FILTERS = ["ALL", "SUCCESS", "PENDING", "FAILED"] as const;

const TYPE_COLORS: Record<Transaction["type"], { bg: string; text: string }> = {
  DEPOSIT:    { bg: "#D1FAE5", text: "#065F46" },
  INVESTMENT: { bg: "#DBEAFE", text: "#1E40AF" },
  WITHDRAWAL: { bg: "#FEE2E2", text: "#7F1D1D" },
  PROMOTION:  { bg: "#F3E8FF", text: "#7C3AED" },
};

const STATUS_COLORS: Record<Transaction["status"], { bg: string; text: string; dot: string }> = {
  SUCCESS: { bg: "#D1FAE5", text: "#065F46", dot: "#22C55E" },
  PENDING: { bg: "#FEF9C3", text: "#78350F", dot: "#F59E0B" },
  FAILED:  { bg: "#FEE2E2", text: "#7F1D1D", dot: "#EF4444" },
};

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        tw`px-3 py-1.5 rounded-full border`,
        active
          ? { backgroundColor: Colors.brand, borderColor: Colors.brand }
          : { backgroundColor: "#fff", borderColor: Colors.divider },
      ]}
    >
      <Text style={[tw`text-xs font-semibold`, { color: active ? "#fff" : Colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function TxCard({ item }: { item: Transaction }) {
  const typeStyle = TYPE_COLORS[item.type] ?? TYPE_COLORS.DEPOSIT;
  const statusStyle = STATUS_COLORS[item.status] ?? STATUS_COLORS.PENDING;
  const isDeposit = item.type === "DEPOSIT";
  const iconName =
    item.type === "DEPOSIT" ? "arrow-down-circle-outline"
    : item.type === "INVESTMENT" ? "trending-up-outline"
    : "arrow-up-circle-outline";
  const iconColor =
    item.type === "DEPOSIT" ? Colors.success
    : item.type === "INVESTMENT" ? "#3B82F6"
    : Colors.error;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/investor/transactions/${item.id}`)}
      activeOpacity={0.7}
      style={[
        tw`flex-row items-center gap-3 p-4 mb-2 rounded-2xl`,
        { backgroundColor: "#fff", borderWidth: 1, borderColor: Colors.divider },
      ]}
    >
      <View style={[tw`w-10 h-10 rounded-full items-center justify-center`, { backgroundColor: Colors.inputBg }]}>
        <Ionicons name={iconName} size={20} color={iconColor} />
      </View>

      <View style={tw`flex-1 gap-1`}>
        <View style={tw`flex-row items-center gap-2`}>
          <View style={[tw`rounded-full px-2 py-0.5`, { backgroundColor: typeStyle.bg }]}>
            <Text style={[tw`text-[10px] font-bold uppercase`, { color: typeStyle.text }]}>{item.type}</Text>
          </View>
          <View style={[tw`flex-row items-center gap-1 rounded-full px-2 py-0.5`, { backgroundColor: statusStyle.bg }]}>
            <View style={[tw`w-1.5 h-1.5 rounded-full`, { backgroundColor: statusStyle.dot }]} />
            <Text style={[tw`text-[10px] font-semibold`, { color: statusStyle.text }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={[tw`text-xs font-mono`, { color: Colors.textMuted }]} numberOfLines={1}>
          {item.reference}
        </Text>
        <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>
          {new Date(item.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
        </Text>
      </View>

      <View style={tw`items-end gap-1`}>
        <Text style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}>
          {item.type === "WITHDRAWAL" ? "−" : "+"} ₦{(item.amount / 100).toLocaleString()}
        </Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

export default function TransactionsScreen() {
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = {
    page,
    ...(type && { type }),
    ...(status && { status }),
    ...(search && { search }),
  };

  const { data, isLoading } = useTransactions(params);
  const transactions: Transaction[] = data?.data?.data ?? [];
  const meta = data?.data?.meta ?? {};
  const total = meta?.total ?? transactions.length;
  const totalPages: number = meta.totalPages ?? 1;
  const hasNext: boolean = meta.hasNext ?? page < totalPages;
  const hasPrev: boolean = meta.hasPrev ?? page > 1;

  const hasFilters = !!(type || status || search);

  return (
    <SafeAreaView style={tw`flex-1 bg-[#F9FAFB]`} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={[tw`flex-row items-center px-4 py-4 gap-3 bg-white`, { borderBottomWidth: 1, borderColor: "#F0F0F0" }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={tw`flex-1`}>
          <Text style={[tw`text-base font-bold`, { color: Colors.textPrimary }]}>Transactions</Text>
          <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>Your full transaction history</Text>
        </View>
      </View>

      {/* Search */}
      <View style={tw`px-4 pt-4 pb-2`}>
        <View style={[tw`flex-row items-center gap-2 rounded-xl px-3 py-2.5`, { backgroundColor: "#fff", borderWidth: 1, borderColor: Colors.divider }]}>
          <Ionicons name="search" size={16} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={(t) => { setSearch(t); setPage(1); }}
            placeholder="Search by reference..."
            placeholderTextColor="#9CA3AF"
            style={[tw`flex-1 text-sm`, { color: Colors.textPrimary }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(""); setPage(1); }}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Type filters */}
      <View style={tw`px-4 pb-2`}>
        <View style={tw`flex-row gap-2`}>
          {TYPE_FILTERS.map((t) => (
            <FilterChip
              key={t}
              label={t === "ALL" ? "All Types" : t.charAt(0) + t.slice(1).toLowerCase()}
              active={t === "ALL" ? !type : type === t}
              onPress={() => { setType(t === "ALL" ? "" : t); setPage(1); }}
            />
          ))}
        </View>
      </View>

      {/* Status filters */}
      <View style={tw`px-4 pb-3`}>
        <View style={tw`flex-row gap-2`}>
          {STATUS_FILTERS.map((s) => (
            <FilterChip
              key={s}
              label={s === "ALL" ? "All Statuses" : s.charAt(0) + s.slice(1).toLowerCase()}
              active={s === "ALL" ? !status : status === s}
              onPress={() => { setStatus(s === "ALL" ? "" : s); setPage(1); }}
            />
          ))}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TxCard item={item} />}
        contentContainerStyle={tw`px-4 pb-8`}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          total > 0 ? (
            <Text style={[tw`text-xs mb-3`, { color: Colors.textMuted }]}>
              {total} transaction{total !== 1 ? "s" : ""}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={Colors.brand} style={tw`py-12`} />
          ) : (
            <View style={tw`items-center py-16 gap-3`}>
              <Ionicons name="receipt-outline" size={40} color={Colors.textMuted} />
              <Text style={[tw`text-sm font-medium`, { color: Colors.textSecondary }]}>No transactions found</Text>
              {hasFilters && (
                <TouchableOpacity onPress={() => { setType(""); setStatus(""); setSearch(""); setPage(1); }}>
                  <Text style={[tw`text-sm font-bold`, { color: Colors.brand }]}>Clear filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
        ListFooterComponent={
          totalPages > 1 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              hasNext={hasNext}
              hasPrev={hasPrev}
              onNext={() => setPage((p) => p + 1)}
              onPrev={() => setPage((p) => p - 1)}
              onGoTo={setPage}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}
