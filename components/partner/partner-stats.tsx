import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { usePartnerStats } from "@/lib/queries/partner";
import tw from "@/lib/tw";

const fmt = (n: number) => `₦${(n / 100).toLocaleString("en-NG")}`;

type StatTile = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
};

function StatTile({ icon, value, label }: StatTile) {
  return (
    <View
      style={[
        tw`flex-1 rounded-xl p-3 gap-1`,
        { backgroundColor: "rgba(255,255,255,0.18)" },
      ]}
    >
      <View style={tw`flex-row items-center gap-1.5`}>
        <Ionicons name={icon} size={14} color="rgba(255,255,255,0.8)" />
        <Text style={tw`text-white text-sm font-bold`} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <Text style={[tw`text-xs`, { color: "rgba(255,255,255,0.7)" }]}>
        {label}
      </Text>
    </View>
  );
}

export default function PartnerStats() {
  const { data, isLoading } = usePartnerStats();
  const stats = data?.data;

  return (
    <View style={[tw`mx-4 rounded-2xl p-4`, { backgroundColor: Colors.brand }]}>
      <Text style={tw`text-white text-sm font-bold mb-3`}>Basic Statistics</Text>

      {isLoading ? (
        <ActivityIndicator color="#fff" style={tw`py-4`} />
      ) : (
        <>
          <View style={tw`flex-row gap-3 mb-3`}>
            <StatTile
              icon="home-outline"
              value={stats ? String(stats.totalProperties) : "–"}
              label="Total Property"
            />
            <StatTile
              icon="cash-outline"
              value={stats ? fmt(stats.totalAmountPaid) : "–"}
              label="Total Amount Paid"
            />
          </View>
          <View style={tw`flex-row gap-3`}>
            <StatTile
              icon="construct-outline"
              value={stats ? String(stats.activeProjects) : "–"}
              label="Active Projects"
            />
            <StatTile
              icon="trending-up-outline"
              value={stats ? fmt(stats.partnershipRevenue) : "–"}
              label="Partnership Revenue"
            />
          </View>
        </>
      )}
    </View>
  );
}
