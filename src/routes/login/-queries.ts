import type { User } from "@/auth/auth";
import axiosInstance from "@/utils/axios/axiosInstance";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: string;
  user: User;
}

export const useLogin = () => {
  return useMutation<LoginResponse, AxiosError, LoginCredentials>({
    mutationFn: async (val: LoginCredentials) => {
      const { data } = await axiosInstance.post("/auth/login", val);
      return data;
    },
    retry: 0,
  });
};

export const useValidateToken = ({ enabled }: { enabled: boolean }) => {
  return useQuery<User>({
    queryKey: ["validate-token"],
    queryFn: async (): Promise<User> => {
      const { data } = await axiosInstance.get("/auth/validate-token");
      return data;
    },
    enabled,
  });
};
