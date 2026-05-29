import type { ApiResponse } from "@/lib/api";
import type { AxiosError } from "axios";

export const extract_message = (data: unknown): string => {
  const err = data as AxiosError<ApiResponse>;
  const api_error = err?.response?.data?.message;
  if (!api_error) {
    return (err as any)?.message ?? "An error occurred";
  }
  if (Array.isArray(api_error)) {
    return api_error.join(", ");
  }
  return api_error;
};
