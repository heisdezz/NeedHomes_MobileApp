import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import apiClient, { type ApiResponse, type ApiResponseV2, new_url } from "@/lib/api";

// ─── Properties ───────────────────────────────────────────────────────────────

export interface ApiProperty {
  id: string;
  propertyTitle: string;
  location: string;
  propertyType: "RESIDENTIAL" | "COMMERCIAL" | "LAND";
  investmentModel:
    | "OUTRIGHT_PURCHASE"
    | "CO_DEVELOPMENT"
    | "FRACTIONAL_OWNERSHIP"
    | "SAVE_TO_OWN"
    | "LAND_BANKING";
  developmentStage: "PLANNING" | "FOUNDATION" | "ROOFING" | "FINISHED";
  basePrice: number; // in kobo
  coverImage: string;
  galleryImages: string[];
}

export interface PropertiesMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PropertiesParams {
  search?: string;
  investmentModel?: ApiProperty["investmentModel"];
  propertyType?: "RESIDENTIAL" | "COMMERCIAL" | "LAND";
  developmentStage?: ApiProperty["developmentStage"];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface AdditionalFee {
  label: string;
  amount: number; // in kobo
}

export interface PropertyDetail extends ApiProperty {
  description: string;
  totalPrice: number; // in kobo
  videos?: string;
  availableUnits?: number;
  profitSharingRatio?: string;
  exitRule?: string;
  exitWindow?: string;
  minimumInvestment?: number;
  // OUTRIGHT_PURCHASE / CO_DEVELOPMENT / SAVE_TO_OWN
  paymentOption?: string;
  minimumInstallmentAmount?: number;
  installmentDuration?: number;
  // FRACTIONAL_OWNERSHIP
  totalShares?: number;
  pricePerShare?: number;
  minimumShares?: number;
  availableShares?: number;
  fractionalHoldingPeriodDays?: number;
  returnTiers?: Record<string, number>; // { [days: string]: ratePercent }
  // LAND_BANKING
  availablePlots?: number;
  pricePerPlot?: number;
  holdingPeriod?: number;
  buyBackOption?: boolean;
  // SAVE_TO_OWN
  savingsFrequency?: string;
  targetPropertyPrice?: number;
  // Fees
  additionalFees?: AdditionalFee[];
  systemCharges?: { platformChargePercentage: number };
  // Documents
  buildingPermitNumber?: string | null;
  propertyDocument?: string | null;
  propertyTitleDocuments?: { type: string; documentUrl: string }[] | null;
  // Location
  latitude?: number;
  longitude?: number;
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

export const useProperty = (id: string) =>
  useQuery<ApiResponse<PropertyDetail>>({
    queryKey: ["property", id],
    queryFn: async () => {
      const resp = await publicClient.get(`/properties/${id}`);
      return resp.data;
    },
    enabled: !!id,
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
  type: "DEPOSIT" | "WITHDRAWAL" | "PROMOTION";
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
      return resp.data as ApiResponse<{ access_code: string; reference: string; authorization_url: string }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
};

export const useWithdrawalMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount, pin }: { amount: number; pin: string }) => {
      const resp = await apiClient.post("/withdrawals", { amount: amount * 100, pin });
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["withdrawal-pin-status"] });
    },
  });
};

// ─── Withdrawal PIN ───────────────────────────────────────────────────────────

export interface PinStatus {
  isSetUp: boolean;
  securityQuestion?: string;
  isLocked?: boolean;
  lockedUntil?: string;
}

export interface SecurityQuestion {
  id: string;
  question: string;
}

export const usePinStatus = () =>
  useQuery<ApiResponse<PinStatus>>({
    queryKey: ["withdrawal-pin-status"],
    queryFn: async () => {
      const resp = await apiClient.get("/withdrawal-pin/status");
      return resp.data;
    },
  });

export const usePinQuestions = (enabled: boolean) =>
  useQuery<ApiResponse<SecurityQuestion[]>>({
    queryKey: ["withdrawal-pin-questions"],
    queryFn: async () => {
      const resp = await apiClient.get("/withdrawal-pin/questions");
      return resp.data;
    },
    enabled,
    staleTime: 1000 * 60 * 10,
  });

export const useSetupPinMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { pin: string; securityQuestion: string; securityAnswer: string }) => {
      const resp = await apiClient.post("/withdrawal-pin/setup", data);
      return resp.data as ApiResponse<any>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["withdrawal-pin-status"] });
    },
  });
};

export const useVerifyPinAnswerMutation = () =>
  useMutation({
    mutationFn: async (data: { securityAnswer: string }) => {
      const resp = await apiClient.post("/withdrawal-pin/verify-answer", data);
      return resp.data as ApiResponse<{ resetToken: string }>;
    },
  });

export const useResetPinMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { resetToken: string; newPin: string }) => {
      const resp = await apiClient.post("/withdrawal-pin/reset", data);
      return resp.data as ApiResponse<any>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["withdrawal-pin-status"] });
    },
  });
};

// ─── Bank ─────────────────────────────────────────────────────────────────────

export interface Bank {
  id: number;
  name: string;
  code: string;
}

export interface MyBankInfo {
  id: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
  account_name: string;
}

export interface ResolvedAccount {
  account_name: string;
  account_number: string;
  bank_id: number;
}

export const useBanks = () =>
  useQuery<ApiResponse<Bank[]>>({
    queryKey: ["banks"],
    queryFn: async () => {
      const resp = await apiClient.get("/banks");
      return resp.data;
    },
    staleTime: 1000 * 60 * 10,
  });

export const useMyBankInfo = () =>
  useQuery<ApiResponse<MyBankInfo>>({
    queryKey: ["banks", "me"],
    queryFn: async () => {
      const resp = await apiClient.get("/banks/me");
      return resp.data;
    },
    retry: 1,
  });

export const useResolveBankMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { accountNumber: string; bankCode: string }) => {
      const resp = await apiClient.post("/banks/resolve", data);
      return resp.data as ApiResponse<ResolvedAccount>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banks", "me"] });
    },
  });
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: "INVESTMENT" | "DEPOSIT" | "WITHDRAWAL" | "PROMOTION";
  status: "SUCCESS" | "PENDING" | "FAILED";
  reference: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TransactionParams {
  page?: number;
  type?: string;
  status?: string;
  search?: string;
}

export const useTransactions = (params: TransactionParams) =>
  useQuery<ApiResponseV2<Transaction[]>>({
    queryKey: ["transactions", params],
    queryFn: async () => {
      const resp = await apiClient.get("/wallet-trx", { params });
      return resp.data;
    },
    retry: 1,
  });

export const useTransaction = (id: string) =>
  useQuery<ApiResponse<Transaction>>({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const resp = await apiClient.get(`/wallet-trx/${id}`);
      return resp.data;
    },
    enabled: !!id,
  });
