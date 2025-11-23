import axiosInstance from "@/utils/axios/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export interface VerifyEmail {
  token: string;
}

export interface VerifyEmailResponse {
  id: string;
  email: string;
  verifiedAt: string;
}

export const useVerifyEmail = (options?: {
  onSuccess?: (data: VerifyEmailResponse) => void;
}) => {
  return useMutation<VerifyEmailResponse, AxiosError, VerifyEmail>({
    mutationFn: async (val: VerifyEmail) => {
      const { data } = await axiosInstance.post("/auth/verify-email", val);
      return data;
    },
    ...options,
  });
};
