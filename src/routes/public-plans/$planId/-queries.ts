import axiosInstance from "@/utils/axios/axiosInstance";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface PublicPlanMemberUser {
  id: string;
  name: string;
  profilePicture: string;
}

interface PublicPlanMember {
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: PublicPlanMemberUser;
}

interface PublicPlan {
  id: string;
  name: string;
  coverImage: string | null;
  description: string | null;
  createdAt: string;
  visibility: "PUBLIC" | "PRIVATE";

  members: PublicPlanMember[];

  _count: {
    members: number;
  };

  config: {
    acceptJoinRequest: boolean;
    maxMembers: number;
  };
}

export const useGetPublicPlan = (planId: string) =>
  useQuery<PublicPlan>({
    queryKey: ["public-plan", planId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/public-plans/${planId}`);
      return res.data;
    },
  });

export const useRequestToJoin = (planId: string, onSuccess?: (() => void) | undefined, onError?: (() => void) | undefined) =>
  useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/public-plans/${planId}/join-request`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Join request sent successfully");
      onSuccess && onSuccess()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to send request");
      onError && onError()
    },
  });
