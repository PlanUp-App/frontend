import type { User } from "@/auth/auth";
import axiosInstance from "@/utils/axios/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export interface Members {
  id: string;
  owner: User;
  members: { user: User }[];
}

export const useGetMembers = (planId: string) =>
  useQuery({
    queryKey: ["members", planId],
    queryFn: async () => {
      const res = await axiosInstance.get<Members>(`/plans/${planId}/members`);
      return res;
    },
  });
