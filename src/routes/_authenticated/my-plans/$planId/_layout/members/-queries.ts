import type { User } from "@/auth/auth";
import axiosInstance from "@/utils/axios/axiosInstance";
import { queryClient } from "@/utils/queryclient/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

export type PlanRole = "OWNER" | "ADMIN" | "MEMBER";

export interface PlanMember {
  role: PlanRole;
  user: User;
}

export const useGetMembers = (planId: string) =>
  useQuery({
    queryKey: ["members", planId],
    queryFn: async () => {
      const res = await axiosInstance.get<PlanMember[]>(
        `/plans/${planId}/members`,
      );
      return res.data;
    },
  });

export interface JoinRequest {
  id: string;
  createdAt: string;
  userId: string;
  planId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const useGetPendingRequests = (
  planId: string,
  isOwner: boolean = false,
) =>
  useQuery({
    queryKey: ["joinRequests", planId],
    queryFn: async () => {
      const res = await axiosInstance.get<JoinRequest[]>(
        `/plans/${planId}/join-requests/pending`,
      );
      return res.data;
    },
    enabled: isOwner,
  });

export const useApproveJoinRequest = (planId: string) =>
  useMutation({
    mutationFn: async (requestId: string) => {
      const res = await axiosInstance.patch(
        `/plans/join-requests/${requestId}/approve`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["joinRequests", planId] });
      queryClient.invalidateQueries({ queryKey: ["members", planId] });
    },
  });

export const useRejectJoinRequest = (planId: string) =>
  useMutation({
    mutationFn: async (requestId: string) => {
      const res = await axiosInstance.patch(
        `/plans/join-requests/${requestId}/reject`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["joinRequests", planId] });
    },
  });

export const useLeavePlan = (planId: string) =>
  useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/plans/${planId}/leave`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPlans"] });
      queryClient.invalidateQueries({ queryKey: ["plan", planId] });
      queryClient.invalidateQueries({ queryKey: ["myRole", planId] });
      queryClient.invalidateQueries({ queryKey: ["members", planId] });
      queryClient.invalidateQueries({ queryKey: ["joinRequests", planId] });
    },
  });

export const useRemoveMember = (planId: string) =>
  useMutation({
    mutationFn: async (memberId: string) => {
      const res = await axiosInstance.delete(
        `/plans/${planId}/members/${memberId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", planId] });
    },
  });
