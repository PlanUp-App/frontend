import type { User } from "@/auth/auth";
import axiosInstance from "@/utils/axios/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export interface Task {
  id: string;
  name: string;
  description: string | null;
  assigneeId: string | null;
  assignee: User | null;
  creatorId: string;
  dueDate: Date | null;
  phaseId: string | null;
  createdAt: Date;
}

export interface PhaseResponse {
  id: string;
  name: string;
  order: number;
  createdAt: Date;
  planId: string;
  tasks: Task[];
  _count: {
    tasks: number;
  };
}

export const useGetTasks = (planId: string, phaseId: string) => {
  return useQuery({
    queryKey: ["tasks", phaseId],
    queryFn: async (): Promise<PhaseResponse> => {
      const res = await axiosInstance.get(`/plans/${planId}/phases/${phaseId}`);
      return res.data;
    },
  });
};
