import { useMutation } from "@tanstack/react-query";
import apiClient, { type ApiResponse } from "@/lib/api";
import { router } from "expo-router";
import { showMessage } from "react-native-flash-message";
import {
  get_user_value,
  set_kyc_value,
  clear_user,
  clear_kyc,
} from "@/store/auth-store";

export type NextOfKinPayload = {
  fullName: string;
  email: string;
  phone: string;
  relationship: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone: string;
  nextOfKin?: NextOfKinPayload;
};

export type AccountSubType = "INDIVIDUAL" | "CORPORATE";

export const useRegisterMutation = (accountType: AccountSubType) =>
  useMutation({
    mutationFn: (data: RegisterPayload) =>
      apiClient.post(`/auth/register?accountType=${accountType}`, data),
    onSuccess: () => {
      router.push("/auth/verify");
    },
  });

export type PartnerType = "REAL_ESTATE_AGENT" | "PROPERTY_DEVELOPER";

export type PartnerRegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  partnerType: PartnerType;
  password: string;
};

export const usePartnerRegisterMutation = () =>
  useMutation({
    mutationFn: (data: PartnerRegisterPayload) =>
      apiClient.post("partners/register", data),
  });

// ─── Session / logout ─────────────────────────────────────────────────────────

const auth_logout = async () => {
  const session = get_user_value()?.sessionId;
  const resp = await apiClient.delete("auth/sessions/" + session);
  return resp.data;
};

export const refresh_kyc = async () => {
  const resp = await apiClient.get<ApiResponse>("/users/profile");
  set_kyc_value(resp.data.data);
  return resp.data;
};

export const useLogout = () =>
  useMutation({
    mutationFn: auth_logout,
    onSuccess: () => {
      clear_user();
      clear_kyc();
      showMessage({ message: "Logged out successfully", type: "success" });
      router.replace("/auth/login");
    },
    onError: () => {
      // session may already be invalid — still clear local state
      clear_user();
      clear_kyc();
      showMessage({ message: "Logout failed", type: "error" });
      router.replace("/auth/login");
    },
  });

export const logout = async () => {
  try {
    await auth_logout();
  } catch {
    // session may already be invalid — still clear local state
  } finally {
    clear_user();
    clear_kyc();
    router.replace("/auth/login");
  }
};
