import { useQuery } from "@tanstack/react-query";
import apiClient, { type ApiResponse } from "@/lib/api";

export interface PartnerStats {
  totalProperties: number;
  totalAmountPaid: number;
  activeProjects: number;
  partnershipRevenue: number;
}

export const usePartnerStats = () =>
  useQuery<ApiResponse<PartnerStats>>({
    queryKey: ["partner", "stats"],
    queryFn: async () => {
      const resp = await apiClient.get("/partner/stats");
      return resp.data;
    },
    retry: 1,
  });
