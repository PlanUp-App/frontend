import axiosInstance from "@/utils/axios/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export interface UpdateAccountResponse {
  name: string;
  profilePicture: string;
  email: string;
}

export interface UpdateAccountValues {
  name: string;
}

export const useUpdateAccount = () => {
  return useMutation<UpdateAccountResponse, AxiosError, UpdateAccountValues>({
    mutationFn: async (val: UpdateAccountValues) => {
      const { data } = await axiosInstance.post("/users/update", val);
      return data;
    },
    retry: 0,
  });
};
