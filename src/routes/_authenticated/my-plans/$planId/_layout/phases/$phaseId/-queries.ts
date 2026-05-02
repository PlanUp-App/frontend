import type { User } from "@/auth/auth";
import axiosInstance from "@/utils/axios/axiosInstance";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

export interface Task {
  id: string;
  name: string;
  description: string | null;
  assigneeId: string | null;
  assignee: User | null;
  creatorId: string;
  creator: User;
  dueDate: string | null;
  phaseId: string | null;
  createdAt: Date;
  isComplete: boolean;
}

export const TaskSortBy = {
  createdAt: "createdAt",
  dueDate: "dueDate",
  name: "name",
} as const;
export type TaskSortBy = (typeof TaskSortBy)[keyof typeof TaskSortBy];

export const SortOrder = {
  asc: "asc",
  desc: "desc",
} as const;
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

export interface QueryTaskDto {
  assigneeId?: string;
  creatorId?: string;
  search?: string;
  sortBy?: TaskSortBy;
  order?: SortOrder;
  skip?: number;
  limit?: number;
}

export interface TaskResponse {
  data: Task[];
  meta: {
    total: number;
    skip: number;
    limit: number;
  };
}

export interface PhaseResponse {
  id: string;
  name: string;
  order: number;
  createdAt: string;
  planId: string;
  _count: {
    tasks: number;
  };
}

export interface PhaseStats {
  totalTasks: number;
  completedTasks: number;
  assignedTasks: number;
  assignedCompletedTasks: number;
}

export const useGetPhase = (planId: string, phaseId: string) => {
  return useQuery({
    queryKey: ["phase", phaseId],
    queryFn: async (): Promise<PhaseResponse> => {
      const res = await axiosInstance.get(`/plans/${planId}/phases/${phaseId}`);
      return res.data;
    },
  });
};

export const useGetTasks = (
  planId: string,
  phaseId: string,
  query?: QueryTaskDto,
) => {
  return useQuery({
    queryKey: ["tasks", phaseId, query],
    queryFn: async (): Promise<TaskResponse> => {
      const res = await axiosInstance.get(
        `/plans/${planId}/phases/${phaseId}/tasks`,
        { params: query },
      );
      return res.data;
    },
  });
};

export const useGetPhaseStats = (planId: string, phaseId: string) => {
  return useQuery({
    queryKey: ["phase-stats", phaseId],
    queryFn: async (): Promise<PhaseStats> => {
      const res = await axiosInstance.get(
        `/plans/${planId}/phases/${phaseId}/stats`,
      );
      return res.data;
    },
  });
};

export const useGetTasksInfinite = (
  planId: string,
  phaseId: string,
  query?: Omit<QueryTaskDto, "skip">,
) => {
  return useInfiniteQuery({
    queryKey: ["tasks-infinite", phaseId, query],
    queryFn: async ({ pageParam = 0 }): Promise<TaskResponse> => {
      const res = await axiosInstance.get(
        `/plans/${planId}/phases/${phaseId}/tasks`,
        { params: { ...query, skip: pageParam, limit: query?.limit || 10 } },
      );
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.meta.skip + lastPage.meta.limit;
      return nextSkip < lastPage.meta.total ? nextSkip : undefined;
    },
    initialPageParam: 0,
  });
};
