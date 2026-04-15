import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import apiClient, { type ApiResponse, type ApiResponseV2, new_url } from "@/lib/api";

// ─── Properties ───────────────────────────────────────────────────────────────

export interface ApiProperty {
  id: string;
  title: string;
  location?: string;
  address?: string;
  propertyType: "RESIDENTIAL" | "COMMERCIAL" | "LAND";
  investmentModel: "OUTRIGHT_PURCHASE" | "CO_DEVELOPMENT" | "FRACTIONAL_OWNERSHIP";
  developmentStage: "PLANNING" | "ONGOING" | "COMPLETED";
  basePrice: number; // in kobo
  images?: string[];
}

export interface PropertiesMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PropertiesParams {
  search?: string;
  investmentModel?: "OUTRIGHT_PURCHASE" | "CO_DEVELOPMENT" | "FRACTIONAL_OWNERSHIP";
  propertyType?: "RESIDENTIAL" | "COMMERCIAL" | "LAND";
  developmentStage?: "PLANNING" | "ONGOING" | "COMPLETED";
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// No auth required — use a plain axios instance to avoid auth interceptors
const publicClient = axios.create({ baseURL: new_url });

export const useProperties = (params?: PropertiesParams) =>
  useQuery<ApiResponseV2<ApiProperty[]>>({
    queryKey: ["properties", params],
    queryFn: async () => {
      const resp = await publicClient.get("/properties", { params });
      return resp.data;
    },
  });

// ─── Investment Stats ────────────────────────────────────────────────────────

export interface InvestmentStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  totalInvested: number;
}

export const useInvestmentStats = () =>
  useQuery<ApiResponse<InvestmentStats>>({
    queryKey: ["investments", "statistics"],
    queryFn: async () => {
      const resp = await apiClient.get("/investments/my-investments/stats");
      return resp.data;
    },
  });

// ─── Wallet ──────────────────────────────────────────────────────────────────

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL";
  status: "PENDING" | "SUCCESS" | "FAILED";
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletData {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  walletTransactions: WalletTransaction[];
}

export const useWallet = () =>
  useQuery<ApiResponse<WalletData>>({
    queryKey: ["wallet"],
    queryFn: async () => {
      const resp = await apiClient.get("/wallet");
      return resp.data;
    },
    retry: 1,
  });

export const useDepositMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      const resp = await apiClient.post("/wallet/deposit/initialize", {
        amount: amount * 100,
      });
      return resp.data as ApiResponse<{ access_code: string; reference: string }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
};

export const useWithdrawalMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (amount: number) => {
      const resp = await apiClient.post("/withdrawals", { amount: amount * 100 });
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
};
