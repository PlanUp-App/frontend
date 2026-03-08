import axiosInstance from "@/utils/axios/axiosInstance";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export interface UpdateAccountResponse {
  name: string;
  profilePicture: string;
  email: string;
}

export interface UpdateAccountValues {
  name: string;
  bio?: string;
}

export const useUpdateAccount = (userId: string) => {
  return useMutation<UpdateAccountResponse, AxiosError, UpdateAccountValues>({
    mutationFn: async (val: UpdateAccountValues) => {
      const { data } = await axiosInstance.post(`/users/${userId}/update`, val);
      return data;
    },
    retry: 0,
  });
};

export interface ProfilePlan {
  id: string;
  name: string;
  coverImage?: string | null;
  memberCount?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  bio?: string | null;
  profilePicture?: string | null;
  coverImage?: string | null;
  totalPlansCreated: number;
  totalPlansJoined: number;
  publicPlans: ProfilePlan[];
}

export const useGetProfile = (userId: string) =>
  useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const res = await axiosInstance.get<UserProfile>(
        `/users/${userId}/profile`,
      );
      return res.data;
    },
  });
