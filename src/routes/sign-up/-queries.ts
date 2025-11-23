import axiosInstance from "@/utils/axios/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

export interface SignUp {
  email: string;
  password: string;
  name: string;
}

export interface SignUpResponse {
  id: string;
  email: string;
  createdAt: string;
}

export const useSignUp = () => {
  return useMutation<SignUpResponse, AxiosError, SignUp>({
    mutationFn: async (val: SignUp) => {
      const { data } = await axiosInstance.post("/auth/sign-up", val);
      return data;
    },
    retry: 0,
  });
};
