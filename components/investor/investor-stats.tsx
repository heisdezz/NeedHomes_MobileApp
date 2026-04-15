import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useInvestmentStats } from "@/lib/queries/investor";
import tw from "@/lib/tw";

type StatCardProps = {
  title: string;
  value: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant: "brand" | "dark";
};

function StatCard({ title, value, label, icon, variant }: StatCardProps) {
  const headerBg = variant === "brand" ? Colors.brand : Colors.surface;

  return (
    <View
      style={[
        tw`flex-1 rounded-2xl overflow-hidden`,
        { backgroundColor: "#fff" },
      ]}
    >
      {/* Header strip */}
      <View
        style={[
          tw`flex-row items-center gap-2 px-3 py-2`,
          { backgroundColor: headerBg },
        ]}
      >
        <View
          style={[
            tw`w-7 h-7 rounded-full items-center justify-center`,
            { backgroundColor: "rgba(255,255,255,0.2)" },
          ]}
        >
          <Ionicons name={icon} size={14} color="#fff" />
        </View>
        <Text
          style={tw`text-white text-xs font-semibold flex-shrink`}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {/* Body */}
      <View style={tw`px-3 pt-3 pb-4`}>
        <Text style={[tw`text-lg font-bold`, { color: Colors.textPrimary }]}>
          {value}
        </Text>
        <Text style={[tw`text-xs mt-0.5`, { color: Colors.textSecondary }]}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function SkeletonCard() {
  return (
    <View
      style={[
        tw`flex-1 rounded-2xl overflow-hidden`,
        { backgroundColor: Colors.surface },
      ]}
    >
      <View style={[tw`h-10`, { backgroundColor: "rgba(255,255,255,0.07)" }]} />
      <View style={tw`px-3 pt-3 pb-4 items-center`}>
        <ActivityIndicator size="small" color={Colors.brand} />
      </View>
    </View>
  );
}

function fmt(n: number) {
  return `₦${n.toLocaleString()}`;
}

export default function InvestorStats() {
  const { data, isLoading } = useInvestmentStats();
  const stats = data?.data;

  const cards: StatCardProps[] = [
    {
      title: "Total Investments",
      value: stats ? fmt(stats.totalInvested) : "–",
      label: "Total Amount Invested",
      icon: "stats-chart-outline",
      variant: "brand",
    },
    {
      title: "Active",
      value: stats ? String(stats.active) : "–",
      label: "Active Investments",
      icon: "trending-up-outline",
      variant: "dark",
    },
    {
      title: "Available Properties",
      value: "100",
      label: "Total Available Property",
      icon: "home-outline",
      variant: "dark",
    },
    {
      title: "Invested Properties",
      value: stats ? String(stats.total) : "–",
      label: "Total Properties Invested In",
      icon: "stats-chart-outline",
      variant: "brand",
    },
  ];

  return (
    <View style={tw`px-4`}>
      <Text style={tw`text-white text-base font-bold mb-3`}>
        Key Activities
      </Text>
      <View style={tw`flex-row gap-3 mb-3`}>
        {isLoading ? <SkeletonCard /> : <StatCard {...cards[0]} />}
        {isLoading ? <SkeletonCard /> : <StatCard {...cards[1]} />}
      </View>
      <View style={tw`flex-row gap-3`}>
        <StatCard {...cards[2]} />
        {isLoading ? <SkeletonCard /> : <StatCard {...cards[3]} />}
      </View>
    </View>
  );
}
