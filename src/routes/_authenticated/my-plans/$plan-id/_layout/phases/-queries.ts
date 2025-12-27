import axiosInstance from "@/utils/axios/axiosInstance";
import { queryClient } from "@/utils/queryclient/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface Phase {
  id: string;
  name: string;
  order: number;
  planId: string;
  createdAt: string;
  plan: {
    id: string;
    name: string;
  };
  _count: {
    tasks: number;
  };
}

export const useGetPhases = (planId: string) =>
  useQuery({
    queryKey: ["phases", planId],
    queryFn: async () => {
      const res = await axiosInstance.get<Phase[]>(`/plans/${planId}/phases`);
      return res;
    },
  });

export const useDeletePhase = (planId: string) =>
  useMutation({
    mutationFn: async (phaseId: string) => {
      return await axiosInstance.delete(`/plans/${planId}/phases/${phaseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
    },
  });

export const useReorderPhase = (planId: string) =>
  useMutation({
    mutationFn: async (phases: Phase[]) => {
      const phaseOrder = phases.map((phase, index) => ({
        name: phase.name,
        id: phase.id,
        order: index,
      }));
      return await axiosInstance.put(`/plans/${planId}/phases/reorder`, {
        phases: phaseOrder,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
    },
  });
