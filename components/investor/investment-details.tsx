import { View, Text } from "react-native";
import { Colors } from "@/constants/theme";
import type { PropertyDetail } from "@/lib/queries/investor";
import tw from "@/lib/tw";

type InvestmentModel = PropertyDetail["investmentModel"];

function fmt(kobo: number | null | undefined): string {
  if (kobo == null) return "N/A";
  return `₦${(kobo / 100).toLocaleString()}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={tw`flex-row justify-between items-center py-2`}>
      <Text style={[tw`text-sm flex-1`, { color: Colors.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[tw`text-sm font-semibold ml-4 text-right`, { color: Colors.textPrimary }]}
        numberOfLines={1}
      >
        {String(value)}
      </Text>
    </View>
  );
}

function DetailsCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={[
        tw`rounded-2xl overflow-hidden`,
        { borderWidth: 1, borderColor: Colors.divider },
      ]}
    >
      <View
        style={[
          tw`px-4 py-3 border-b`,
          { backgroundColor: Colors.inputBg, borderColor: Colors.divider },
        ]}
      >
        <Text style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}>
          Investment Details
        </Text>
      </View>
      <View style={tw`px-4 divide-y`}>{children}</View>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function InvestmentDetails({
  type,
  property,
}: {
  type: InvestmentModel;
  property: PropertyDetail;
}) {
  switch (type) {
    case "LAND_BANKING":
      return (
        <DetailsCard>
          <DetailRow label="Available Plots" value={property.availablePlots ?? 0} />
          <DetailRow label="Price Per Plot" value={fmt(property.pricePerPlot)} />
          <DetailRow label="Holding Period (Months)" value={property.holdingPeriod ?? "N/A"} />
          <DetailRow
            label="Buy-Back Option"
            value={property.buyBackOption ? "Yes" : "No"}
          />
          <DetailRow label="Payment Option" value={property.paymentOption ?? "N/A"} />
        </DetailsCard>
      );

    case "OUTRIGHT_PURCHASE":
      return (
        <DetailsCard>
          <DetailRow label="Exit Strategy" value={property.exitRule ?? "ANYTIME"} />
          <DetailRow label="Payment Option" value={property.paymentOption ?? "N/A"} />
          <DetailRow
            label="Installment Duration"
            value={
              property.installmentDuration
                ? `${property.installmentDuration} Months`
                : "N/A"
            }
          />
          <DetailRow
            label="Minimum Installment Amount"
            value={fmt(property.minimumInstallmentAmount)}
          />
        </DetailsCard>
      );

    case "SAVE_TO_OWN":
      return (
        <DetailsCard>
          <DetailRow label="Savings Frequency" value={property.savingsFrequency ?? "N/A"} />
          <DetailRow
            label="Target Property Price"
            value={fmt(property.targetPropertyPrice)}
          />
          <DetailRow label="Payment Option" value={property.paymentOption ?? "N/A"} />
          <DetailRow
            label="Installment Duration"
            value={
              property.installmentDuration
                ? `${property.installmentDuration} ${property.savingsFrequency ?? ""}`
                : "N/A"
            }
          />
          <DetailRow
            label="Min. Installment Deposit"
            value={fmt(property.minimumInstallmentAmount)}
          />
        </DetailsCard>
      );

    case "CO_DEVELOPMENT":
      return (
        <DetailsCard>
          <DetailRow label="Exit Strategy" value={property.exitRule ?? "N/A"} />
          <DetailRow label="Payment Option" value={property.paymentOption ?? "N/A"} />
          <DetailRow
            label="Installment Duration"
            value={
              property.installmentDuration
                ? `${property.installmentDuration} Months`
                : "N/A"
            }
          />
          <DetailRow
            label="Min. Installment Amount"
            value={fmt(property.minimumInstallmentAmount)}
          />
        </DetailsCard>
      );

    case "FRACTIONAL_OWNERSHIP":
      return (
        <DetailsCard>
          <DetailRow
            label="Total Shares"
            value={property.totalShares?.toLocaleString() ?? "N/A"}
          />
          <DetailRow label="Price Per Slot" value={fmt(property.pricePerShare)} />
          <DetailRow label="Payment Option" value={property.paymentOption ?? "N/A"} />
          <DetailRow
            label="Platform Charge"
            value={`${property.systemCharges?.platformChargePercentage ?? 0}%`}
          />
        </DetailsCard>
      );

    default:
      return (
        <DetailsCard>
          <DetailRow
            label="Min. Investment"
            value={
              property.minimumInvestment
                ? `₦${property.minimumInvestment.toLocaleString()}`
                : "N/A"
            }
          />
          <DetailRow label="Exit Window" value={property.exitWindow ?? "N/A"} />
          {property.profitSharingRatio && (
            <DetailRow label="Profit Sharing" value={property.profitSharingRatio} />
          )}
          <DetailRow
            label="Platform Charge"
            value={`${property.systemCharges?.platformChargePercentage ?? 0}%`}
          />
        </DetailsCard>
      );
  }
}
