import axiosInstance from "@/utils/axios/axiosInstance";
import { useMutation } from "@tanstack/react-query";

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
