import { View, Text } from "react-native";
import { Colors } from "@/constants/theme";
import type { AdditionalFee } from "@/lib/queries/investor";
import tw from "@/lib/tw";

function fmt(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(kobo / 100);
}

export default function AdditionalFees({ fees }: { fees: AdditionalFee[] }) {
  if (!fees || fees.length === 0) return null;

  const total = fees.reduce((sum, f) => sum + f.amount, 0);

  return (
    <View
      style={[
        tw`rounded-2xl overflow-hidden`,
        { borderWidth: 1, borderColor: Colors.divider },
      ]}
    >
      {/* Header */}
      <View
        style={[
          tw`px-4 py-3 border-b`,
          { backgroundColor: Colors.inputBg, borderColor: Colors.divider },
        ]}
      >
        <Text style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}>
          Management Fees
        </Text>
      </View>

      {/* Fee rows */}
      <View style={tw`px-4`}>
        {fees.map((fee, i) => (
          <View
            key={fee.id ?? i}
            style={[
              tw`flex-row justify-between items-center py-3`,
              { borderBottomWidth: 1, borderColor: Colors.divider },
            ]}
          >
            <Text style={[tw`text-sm`, { color: Colors.textSecondary }]}>
              {fee.label}
            </Text>
            <Text
              style={[tw`text-sm font-medium`, { color: Colors.textPrimary }]}
            >
              {fmt(fee.amount)}
            </Text>
          </View>
        ))}

        {/* Total row */}
        <View style={tw`flex-row justify-between items-center py-3`}>
          <Text style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}>
            Total Management Fees
          </Text>
          <Text style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}>
            {fmt(total)}
          </Text>
        </View>
      </View>
    </View>
  );
}
