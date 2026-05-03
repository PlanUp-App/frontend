import axiosInstance from "@/utils/axios/axiosInstance";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

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
  userStatus: "MEMBER" | "PENDING" | "NONE";
}

export interface PublicPlansResponse {
  data: PublicPlan[];
  meta: {
    total: number;
    skip: number;
    limit: number;
  };
}

export interface GetPublicPlansParams {
  search?: string;
  skip?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export const useGetPublicPlans = (params?: GetPublicPlansParams) => {
  return useQuery({
    queryKey: ["public-plans", params],
    queryFn: async (): Promise<PublicPlansResponse> => {
      const { data } = await axiosInstance.get("/public-plans", { params });
      return data;
    },
  });
};

export const useGetPublicPlansInfinite = (params?: Omit<GetPublicPlansParams, "skip">) => {
  return useInfiniteQuery({
    queryKey: ["public-plans-infinite", params],
    queryFn: async ({ pageParam = 0 }): Promise<PublicPlansResponse> => {
      const { data } = await axiosInstance.get("/public-plans", {
        params: { ...params, skip: pageParam, limit: params?.limit || 9 },
      });
      return data;
    },
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.meta.skip + lastPage.meta.limit;
      return nextSkip < lastPage.meta.total ? nextSkip : undefined;
    },
    initialPageParam: 0,
  });
};
