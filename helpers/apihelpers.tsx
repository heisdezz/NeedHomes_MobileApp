import type { ApiResponse } from "@/lib/api";
import type { AxiosError } from "axios";

export const extract_message = (data: AxiosError<ApiResponse>) => {
  const api_error = data.response?.data?.message;
  if (!api_error) {
    return data.message;
  }
  if (Array.isArray(api_error)) {
    return api_error.join(", ");
  }
  return api_error;
};
