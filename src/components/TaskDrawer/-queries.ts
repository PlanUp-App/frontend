import type { User } from "@/auth/auth";
import axiosInstance from "@/utils/axios/axiosInstance";
import { queryClient } from "@/utils/queryclient/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface TaskFile {
  id: string;
  name: string;
  createdAt: Date;
  planId: string;
  url: string;
  publicId: string;
  size: number | null;
  mimeType: string | null;
  uploaderId: string;
  tasks?: { id: string; name: string }[];
  bills?: { id: string; title: string }[];
  messages?: { id: string }[];
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  assigneeId?: string;
  dueDate: string;
  fileIds?: string[];
}

export const useCreateTask = (planId: string, phaseId: string) => {
  return useMutation({
    mutationFn: async (request: CreateTaskRequest) => {
      const res = await axiosInstance.post<GetTaskResponse>(
        `plans/${planId}/phases/${phaseId}/tasks`,
        request,
      );
      return res.data;
    },
  });
};

export interface GetTaskResponse {
  assignee: User | null;
  creator: User;
  files: TaskFile[];
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
      const res = await axiosInstance.patch<GetTaskResponse>(
        `plans/${planId}/phases/${phaseId}/tasks/${taskId}`,
        request,
      );
      return res.data;
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
      queryClient.invalidateQueries({ queryKey: ["tasks", phaseId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", planId] });
    },
  });
