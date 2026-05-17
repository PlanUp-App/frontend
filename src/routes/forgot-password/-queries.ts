import axiosInstance from "@/utils/axios/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export interface ForgotPasswordCredentials {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export const useForgotPassword = () => {
  return useMutation<ForgotPasswordResponse, AxiosError, ForgotPasswordCredentials>({
    mutationFn: async (val: ForgotPasswordCredentials) => {
      const { data } = await axiosInstance.post("/auth/forgot-password", val);
      return data;
    },
    retry: 0,
  });
};
