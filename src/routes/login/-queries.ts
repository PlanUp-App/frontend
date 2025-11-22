import type { User } from "@/auth/auth";
import axiosInstance from "@/utils/axios/axiosInstance";
import { queryClient } from "@/utils/queryclient/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export interface Login {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: string;
  user: User;
}

export const useLogin = () => {
  return useMutation<LoginResponse, AxiosError, Login>({
    mutationFn: async (val: Login) => {
      const { data } = await axiosInstance.post("/auth/login", val);
      return data;
    },
    onSuccess: () => {
      queryClient.resetQueries();
    },
    retry: 0,
  });
};

export const useValidateToken = () => {
  return useQuery<User>({
    queryKey: ["validate-token"],
    queryFn: async (): Promise<User> => {
      const { data } = await axiosInstance.get("/auth/validate-token");
      return data;
    },
  });
};
