import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { router } from "expo-router";

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
