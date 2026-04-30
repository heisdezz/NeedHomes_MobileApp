import { ApiProperty } from "@/lib/queries/investor";
import { ADMIN_PROPERTY_LISTING, PROPERTY_DATA } from "@/types";

export const nav_to_invest_page = (property: PROPERTY_DATA) => {
  switch (property.investmentModel) {
    case "CO_DEVELOPMENT":
      return "co-dev";
    default:
      break;
  }
};
