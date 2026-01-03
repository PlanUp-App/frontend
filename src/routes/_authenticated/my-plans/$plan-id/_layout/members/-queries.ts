import axiosInstance from "@/utils/axios/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export interface Members {
  id: string;
  owner: {
    id: string;
    name: string;
    email: string;
    profilePicture: string | null;
  };
  members: {
    user: {
      id: string;
      name: string;
      email: string;
      profilePicture: string | null;
    };
  }[];
}

export const useGetMembers = (planId: string) =>
  useQuery({
    queryKey: ["members", planId],
    queryFn: async () => {
      const res = await axiosInstance.get<Members>(`/plans/${planId}/members`);
      return res;
    },
  });
