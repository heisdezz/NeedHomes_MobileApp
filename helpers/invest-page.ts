import { router } from "expo-router";
import type { ApiProperty } from "@/lib/queries/investor";

const MODEL_ROUTE: Record<ApiProperty["investmentModel"], string> = {
  CO_DEVELOPMENT: "co-dev",
  OUTRIGHT_PURCHASE: "outright-purchase",
  FRACTIONAL_OWNERSHIP: "fractional-ownership",
  LAND_BANKING: "land-banking",
  SAVE_TO_OWN: "save-to-own",
};

export function navigateToInvest(
  propertyId: string,
  investmentModel: ApiProperty["investmentModel"],
) {
  const segment = MODEL_ROUTE[investmentModel] ?? "co-dev";
  router.push(`/investor/properties/${propertyId}/invest/${segment}`);
}
