import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone: string;
};

export type AccountSubType = 'INDIVIDUAL' | 'CORPORATE';

export const useRegisterMutation = (accountType: AccountSubType) =>
  useMutation({
    mutationFn: (data: RegisterPayload) =>
      apiClient.post(`/register?accountType=${accountType}`, data),
  });
