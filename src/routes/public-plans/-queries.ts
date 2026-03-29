import axiosInstance from "@/utils/axios/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export interface PublicPlan {
  id: string;
  name: string;
  coverImage: string | null;
  description: string | null;
  createdAt: string;
  visibility: "PUBLIC" | "PRIVATE";
  _count: {
    members: number;
  };
}

export interface GetPublicPlansParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export const useGetPublicPlans = (params?: GetPublicPlansParams) => {
  return useQuery({
    queryKey: ["public-plans", params],
    queryFn: async (): Promise<PublicPlan[]> => {
      const { data } = await axiosInstance.get("/public-plans", { params });
      return data;
    },
  });
};
