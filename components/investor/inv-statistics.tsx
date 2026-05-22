import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useInvestmentStats } from "@/lib/queries/investor";
import tw from "@/lib/tw";

type StatItem = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
};

function StatCard({ label, value, icon, iconBg, iconColor }: StatItem) {
  return (
    <View
      style={[
        tw`flex-row items-center gap-3 p-3 rounded-xl`,
        { backgroundColor: "#fff", borderWidth: 1, borderColor: Colors.divider },
      ]}
    >
      <View
        style={[
          tw`w-10 h-10 rounded-xl items-center justify-center`,
          { backgroundColor: iconBg },
        ]}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View>
        <Text style={[tw`text-[10px] font-semibold uppercase tracking-wide`, { color: Colors.textMuted }]}>
          {label}
        </Text>
        <Text style={[tw`text-lg font-bold`, { color: Colors.textPrimary }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function InvStatistics() {
  const { data, isLoading } = useInvestmentStats();
  const stats = data?.data;

  const fmt = (kobo: number) => `₦${(kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

  return (
    <View
      style={[
        tw`mx-4 rounded-2xl overflow-hidden`,
        { borderWidth: 1, borderColor: Colors.divider, backgroundColor: "#fff" },
      ]}
    >
      {/* Header */}
      <View
        style={[
          tw`flex-row items-center gap-2 px-4 py-3 border-b`,
          { borderBottomColor: Colors.divider, backgroundColor: Colors.inputBg },
        ]}
      >
        <Ionicons name="bar-chart-outline" size={16} color={Colors.textPrimary} />
        <Text style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}>
          Investment Statistics
        </Text>
      </View>

      {/* Body */}
      <View style={tw`p-4`}>
        {isLoading ? (
          <ActivityIndicator color={Colors.brand} style={tw`py-4`} />
        ) : (
          <View style={tw`gap-3`}>
            {/* Row 1 */}
            <View style={tw`flex-row gap-3`}>
              <View style={tw`flex-1`}>
                <StatCard
                  label="Total Invested"
                  value={stats ? fmt(stats.totalInvested) : "–"}
                  icon="wallet-outline"
                  iconBg={Colors.brand + "15"}
                  iconColor={Colors.brand}
                />
              </View>
              <View style={tw`flex-1`}>
                <StatCard
                  label="Total Count"
                  value={stats ? String(stats.total) : "–"}
                  icon="layers-outline"
                  iconBg="#DBEAFE"
                  iconColor="#1D4ED8"
                />
              </View>
            </View>
            {/* Row 2 */}
            <View style={tw`flex-row gap-3`}>
              <View style={tw`flex-1`}>
                <StatCard
                  label="Active"
                  value={stats ? String(stats.active) : "–"}
                  icon="trending-up-outline"
                  iconBg="#D1FAE5"
                  iconColor="#059669"
                />
              </View>
              <View style={tw`flex-1`}>
                <StatCard
                  label="Completed"
                  value={stats ? String(stats.completed) : "–"}
                  icon="checkmark-circle-outline"
                  iconBg="#E9D5FF"
                  iconColor="#7C3AED"
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
