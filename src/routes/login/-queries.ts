import { queryClient } from "@/utils/queryclient/queryClient";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

export interface Login {
  email: string;
  password: string;
}

interface LoginResponse {
  data: {
    accessToken: string;
    expiresIn: string;
  };
}

export const useLogin = () => {
  return useMutation<LoginResponse, AxiosError, Login>({
    mutationFn: async (val: Login) => {
      const { data } = await axios.post("/auth/login", val);
      return data;
    },
    onSuccess: () => {
      queryClient.resetQueries();
    },
    retry: 0,
  });
};
