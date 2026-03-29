import type { User } from "@/auth/auth";
import axiosInstance from "@/utils/axios/axiosInstance";
import { queryClient } from "@/utils/queryclient/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface CreateTaskRequest {
  name: string;
  description?: string;
  assigneeId?: string;
  dueDate: string;
}

export const useCreateTask = (planId: string, phaseId: string) => {
  return useMutation({
    mutationFn: async (request: CreateTaskRequest) => {
      await axiosInstance.post(
        `plans/${planId}/phases/${phaseId}/tasks`,
        request,
      );
    },
  });
};

export interface GetTaskResponse {
  assignee: User | null;
  creator: User;
  id: string;
  name: string;
  description: string | null;
  assigneeId: string | null;
  dueDate: string | null;
  phaseId: string | null;
  isComplete: boolean;
  creatorId: string;
  createdAt: Date;
}

export const useGetTask = (planId: string, phaseId: string, taskId: string) => {
  return useQuery({
    queryKey: ["tasks", planId, taskId],
    queryFn: async () => {
      const res = await axiosInstance.get<GetTaskResponse>(
        `/plans/${planId}/phases/${phaseId}/tasks/${taskId}`,
      );
      return res;
    },
  });
};

export type UpdateTaskRequest = Partial<CreateTaskRequest>;

export const useUpdateTask = (
  planId: string,
  phaseId: string,
  taskId: string,
) => {
  return useMutation({
    mutationFn: async (request: UpdateTaskRequest) => {
      await axiosInstance.patch(
        `plans/${planId}/phases/${phaseId}/tasks/${taskId}`,
        request,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", planId, taskId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", planId] });
    },
  });
};

export const useMarkTaskComplete = (
  planId: string,
  phaseId: string,
  taskId: string,
) =>
  useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.patch(
        `plans/${planId}/phases/${phaseId}/tasks/${taskId}/complete`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", planId, taskId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", planId] });
    },
  });
