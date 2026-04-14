import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { router } from "expo-router";
import { expoSecureStorage } from "@/lib/storage";
import type { USER, USER_KYC } from "@/types";
import apiClient, { ApiResponse } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { showMessage } from "react-native-flash-message";

export interface AUTHRECORD {
  user: USER;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

type AuthState = {
  auth: AUTHRECORD | null;
  kyc: USER_KYC | null;
  tempUser: string | null;
  setAuth: (auth: AUTHRECORD) => void;
  setKyc: (kyc: USER_KYC) => void;
  setTempUser: (user: string) => void;
  clearAuth: () => void;
  clearKyc: () => void;
  clearTempUser: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      auth: null,
      kyc: null,
      tempUser: null,
      setAuth: (auth) => set({ auth }),
      setKyc: (kyc) => set({ kyc }),
      setTempUser: (tempUser) => set({ tempUser }),
      clearAuth: () => set({ auth: null }),
      clearKyc: () => set({ kyc: null }),
      clearTempUser: () => set({ tempUser: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => expoSecureStorage),
    },
  ),
);

// Imperative helpers for use outside React (e.g. axios interceptors)
export const get_user_value = () => useAuthStore.getState().auth;
export const get_kyc_value = () => useAuthStore.getState().kyc;
export const set_user_value = (auth: AUTHRECORD) =>
  useAuthStore.getState().setAuth(auth);
export const set_kyc_value = (kyc: USER_KYC) =>
  useAuthStore.getState().setKyc(kyc);
export const clear_user = () => useAuthStore.getState().clearAuth();
export const clear_kyc = () => useAuthStore.getState().clearKyc();

// Hooks
export const useAuth = () => useAuthStore((s) => s.auth);
export const useKyc = () => useAuthStore((s) => s.kyc);
export const useTempUser = () => useAuthStore((s) => s.tempUser);

const auth_logout = async () => {
  const session = get_user_value()?.sessionId;
  let resp = await apiClient.delete("auth/sessions/" + session);
  return resp.data;
};

export const refresh_kyc = async () => {
  let resp = await apiClient.get<ApiResponse>("/users/profile");
  set_kyc_value(resp.data.data);
  return resp.data;
};

export const useLogout = () => {
  const mutation = useMutation({
    mutationFn: auth_logout,
    onSuccess: () => {
      clear_user();
      clear_kyc();
      showMessage({
        message: "Logged out successfully",
        type: "success",
      });
      router.replace("/auth/login");
    },
    onError: () => {
      // session may already be invalid — still clear local state
      clear_user();
      clear_kyc();
      showMessage({
        message: "Logout failed",
        type: "error",
      });
      router.replace("/auth/login");
    },
  });
  return mutation;
};

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
