import type { User } from "@/auth/auth";
import type { Member } from "@/components/PlanCard";
import axiosInstance from "@/utils/axios/axiosInstance";
import { useQuery } from "@tanstack/react-query";

type PlanVisibility = "PUBLIC" | "PRIVATE";

interface getAllPlansParams {
  search?: string;
  limit?: number;
  skip?: number;
  sortBy?: "createdAt" | "name";
  order?: "asc" | "desc";
}

interface getAllPlansResponse {
  id: string;
  name: string;
  coverImage: string;
  createdAt: string;
  owner: User;
  members: Member[];
  visibility: PlanVisibility;
}

export const useGetAllPlans = ({
  search,
  limit = 10,
  skip = 0,
  sortBy = "createdAt",
  order = "desc",
}: getAllPlansParams) => {
  return useQuery({
    queryKey: ["allPlans", skip, limit, order, search, sortBy],
    queryFn: async () => {
      const params: getAllPlansParams = {
        skip,
        limit,
        order,
        sortBy,
        search,
      };

      return await axiosInstance.get<getAllPlansResponse[]>("/plans", {
        params,
      });
    },
  });
};

export const useGetMyRole = (planId: string) =>
  useQuery({
    queryKey: ["myRole", planId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/plans/${planId}/role`);
      localStorage.setItem(`plan_role_${planId}`, res.data.role);
      return res.data;
    },
  });
