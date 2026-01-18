import type { User } from "@/auth/auth";
import axiosInstance from "@/utils/axios/axiosInstance";
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
  creatorId: string;
  createdAt: Date;
}

export const useGetTask = (planId: string, phaseId: string, taskId: string) => {
  return useQuery({
    queryKey: ["tasks", phaseId, taskId],
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
  });
};
