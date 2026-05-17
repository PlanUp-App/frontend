import axiosInstance from "@/utils/axios/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export interface ResetPasswordCredentials {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const useResetPassword = () => {
  return useMutation<ResetPasswordResponse, AxiosError, ResetPasswordCredentials>({
    mutationFn: async (val: ResetPasswordCredentials) => {
      const { data } = await axiosInstance.post("/auth/reset-password", val);
      return data;
    },
    retry: 0,
  });
};
