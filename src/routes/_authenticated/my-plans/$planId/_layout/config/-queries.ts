import axiosInstance from "@/utils/axios/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export type PlanConfig = {
  id: string;
  maxMembers: number | null;
  acceptJoinRequest: boolean;
};

export type PlanMember = {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
  user: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
};

export type PlanPhase = {
  id: string;
  name: string;
  order: number;
};

export type PlanDetail = {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;
  archivedAt: string | null;
  config: PlanConfig | null;
  members: PlanMember[];
  phases: PlanPhase[];
};

export type GetPlanResponse = {
  plan: PlanDetail;
};

export const useGetPlan = (planId: string) => {
  return useQuery<PlanDetail>({
    queryKey: ["plan", planId],
    queryFn: async () => {
      const res = await axiosInstance.get<GetPlanResponse>(`/plans/${planId}`);
      return res.data.plan;
    },
    enabled: !!planId,
  });
};
