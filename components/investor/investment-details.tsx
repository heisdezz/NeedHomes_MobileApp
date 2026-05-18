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

function Divider() {
  return <View style={{ height: 1, backgroundColor: Colors.divider }} />;
}

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string | number;
  last?: boolean;
}) {
  return (
    <>
      <View style={tw`flex-row justify-between items-center py-3`}>
        <Text style={[tw`text-sm flex-1`, { color: Colors.textSecondary }]}>
          {label}
        </Text>
        <Text
          style={[
            tw`text-sm font-semibold ml-6 text-right`,
            { color: Colors.textPrimary },
          ]}
          numberOfLines={1}
        >
          {String(value)}
        </Text>
      </View>
      {!last && <Divider />}
    </>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View
      style={[
        tw`px-4 py-3`,
        {
          backgroundColor: Colors.inputBg,
          borderBottomWidth: 1,
          borderColor: Colors.divider,
        },
      ]}
    >
      <Text style={[tw`text-sm font-bold`, { color: Colors.textPrimary }]}>
        {title}
      </Text>
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={[
        tw`rounded-2xl overflow-hidden`,
        { borderWidth: 1, borderColor: Colors.divider },
      ]}
    >
      {children}
    </View>
  );
}

function DetailsCard({
  title = "Investment Details",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <SectionHeader title={title} />
      <View style={tw`px-4`}>{children}</View>
    </Card>
  );
}

// ─── Fractional-specific sub-components ──────────────────────────────────────

function SharesProgress({
  available,
  total,
}: {
  available: number;
  total: number;
}) {
  const soldPct =
    total > 0 ? Math.min(((total - available) / total) * 100, 100) : 0;
  const sold = total - available;

  return (
    <View style={tw`pb-4`}>
      <View style={tw`flex-row justify-between mb-2`}>
        <Text style={[tw`text-xs`, { color: Colors.textSecondary }]}>
          {available.toLocaleString()} shares available
        </Text>
        <Text style={[tw`text-xs font-semibold`, { color: Colors.brand }]}>
          {sold.toLocaleString()} / {total.toLocaleString()} sold
        </Text>
      </View>
      <View
        style={[
          tw`w-full rounded-full`,
          { height: 7, backgroundColor: Colors.inputBg },
        ]}
      >
        <View
          style={[
            tw`rounded-full`,
            {
              height: 7,
              width: `${soldPct}%`,
              backgroundColor: Colors.brand,
            },
          ]}
        />
      </View>
    </View>
  );
}

function ReturnTiersGrid({ tiers }: { tiers: Record<string, number> }) {
  const entries = Object.entries(tiers).sort(
    ([a], [b]) => Number(a) - Number(b),
  );

  return (
    <View style={tw`pt-3 pb-4`}>
      <Text
        style={[
          tw`text-xs font-semibold mb-3`,
          { color: Colors.textSecondary, letterSpacing: 0.6 },
        ]}
      >
        RETURNS BY HOLDING PERIOD
      </Text>
      <View style={tw`flex-row flex-wrap gap-2`}>
        {entries.map(([days, rate]) => {
          const n = Number(days);
          const label =
            n >= 365
              ? `${Math.round(n / 365)}yr`
              : n >= 30
                ? `${Math.round(n / 30)}mo`
                : `${n}d`;
          return (
            <View
              key={days}
              style={[
                tw`rounded-xl px-4 py-3 items-center`,
                {
                  flex: 1,
                  minWidth: 68,
                  backgroundColor: Colors.inputBg,
                  borderWidth: 1,
                  borderColor: Colors.divider,
                },
              ]}
            >
              <Text style={[tw`text-base font-bold`, { color: Colors.brand }]}>
                {rate}%
              </Text>
              <Text style={[tw`text-sm mt-0.5`, { color: Colors.textMuted }]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
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
          <DetailRow
            label="Available Plots"
            value={property.availablePlots ?? 0}
          />
          <DetailRow
            label="Price Per Plot"
            value={fmt(property.pricePerPlot)}
          />
          <DetailRow
            label="Minimum Holding Period"
            value={
              property.holdingPeriod
                ? `${property.holdingPeriod} Months`
                : "N/A"
            }
          />
          <DetailRow
            label="Buy-Back Option"
            value={property.buyBackOption ? "Yes" : "No"}
          />
          <DetailRow
            label="Payment Option"
            value={property.paymentOption ?? "N/A"}
            last
          />
        </DetailsCard>
      );

    case "OUTRIGHT_PURCHASE":
      return (
        <DetailsCard>
          <DetailRow
            label="Exit Strategy"
            value={property.exitRule ?? "Anytime"}
          />
          <DetailRow
            label="Payment Option"
            value={property.paymentOption ?? "N/A"}
          />
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
            last
          />
        </DetailsCard>
      );

    case "SAVE_TO_OWN":
      return (
        <DetailsCard>
          <DetailRow
            label="Savings Frequency"
            value={property.savingsFrequency ?? "N/A"}
          />
          <DetailRow
            label="Target Property Price"
            value={fmt(property.targetPropertyPrice)}
          />
          <DetailRow
            label="Payment Option"
            value={property.paymentOption ?? "N/A"}
          />
          <DetailRow
            label="Installment Duration"
            value={
              property.installmentDuration
                ? `${property.installmentDuration} ${
                    property.savingsFrequency ?? "Months"
                  }`
                : "N/A"
            }
          />
          <DetailRow
            label="Min. Installment Deposit"
            value={fmt(property.minimumInstallmentAmount)}
            last
          />
        </DetailsCard>
      );

    case "CO_DEVELOPMENT":
      return (
        <DetailsCard>
          <DetailRow label="Exit Strategy" value={property.exitRule ?? "N/A"} />
          <DetailRow
            label="Payment Option"
            value={property.paymentOption ?? "N/A"}
          />
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
            last
          />
        </DetailsCard>
      );

    case "FRACTIONAL_OWNERSHIP": {
      const total = property.totalShares ?? 0;
      const available = property.availableShares ?? 0;
      const hasTiers =
        property.returnTiers && Object.keys(property.returnTiers).length > 0;
      const minInvestment =
        property.minimumShares && property.pricePerShare
          ? property.minimumShares * property.pricePerShare
          : undefined;

      return (
        <View style={tw`gap-3`}>
          {hasTiers && (
            <Card>
              <SectionHeader title="Expected Returns" />
              <View style={tw`px-4`}>
                <ReturnTiersGrid tiers={property.returnTiers!} />
              </View>
            </Card>
          )}

          {total > 0 && (
            <Card>
              <SectionHeader title="Share Availability" />
              <View style={tw`px-4 pt-3`}>
                <SharesProgress available={available} total={total} />
              </View>
            </Card>
          )}

          <DetailsCard>
            <DetailRow
              label="Price Per Share"
              value={fmt(property.pricePerShare)}
            />
            <DetailRow
              label="Min. Shares"
              value={property.minimumShares?.toLocaleString() ?? "1"}
            />
            {minInvestment != null && (
              <DetailRow label="Min. Investment" value={fmt(minInvestment)} />
            )}
            {property.fractionalHoldingPeriodDays != null && (
              <DetailRow
                label="Holding Period"
                value={
                  property.fractionalHoldingPeriodDays >= 365
                    ? `${Math.round(
                        property.fractionalHoldingPeriodDays / 365,
                      )} Year${
                        Math.round(
                          property.fractionalHoldingPeriodDays / 365,
                        ) !== 1
                          ? "s"
                          : ""
                      }`
                    : `${property.fractionalHoldingPeriodDays} Days`
                }
              />
            )}
            <DetailRow
              label="Platform Charge"
              value={`${
                property.systemCharges?.platformChargePercentage ?? 0
              }%`}
              last
            />
          </DetailsCard>
        </View>
      );
    }

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
            <DetailRow
              label="Profit Sharing"
              value={property.profitSharingRatio}
            />
          )}
          <DetailRow
            label="Platform Charge"
            value={`${property.systemCharges?.platformChargePercentage ?? 0}%`}
            last
          />
        </DetailsCard>
      );
  }
}
