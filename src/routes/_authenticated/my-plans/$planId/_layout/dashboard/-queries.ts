import axiosInstance from "@/utils/axios/axiosInstance";
import { useQuery } from "@tanstack/react-query";

interface PlanInfo {
  id: string;
  name: string;
  coverImage: string | null;
  createdAt: Date;
  archivedAt: Date | null;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  deletedAt: Date | null;
}

interface PlanStats {
  memberCount: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalBills: number;
  totalExpense: number;
}

interface PlanMemberUser {
  id: string;
  name: string;
  profilePicture: string | null;
}

interface PlanMember {
  id: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
  user: PlanMemberUser;
}

interface TaskPhase {
  id: string;
  name: string;
}

interface TaskAssignee {
  id: string;
  name: string;
  profilePicture: string | null;
}

interface UpcomingTask {
  id: string;
  name: string;
  dueDate: string | null;
  isComplete: boolean;
  phase: TaskPhase | null;
  assignee: TaskAssignee | null;
}

interface BillUser {
  id: string;
  name: string;
}

interface RecentBill {
  id: string;
  title: string;
  amount: number;
  category: string | null;
  paidAt: string | null;
  createdBy: BillUser;
  paidBy: BillUser | null;
  isSettled: boolean;
}

interface PlanDashboard {
  plan: PlanInfo;
  stats: PlanStats;
  members: PlanMember[];
  upcomingTasks: UpcomingTask[];
  recentBills: RecentBill[];
}

export const useGetPlanDashboard = (planId: string) =>
  useQuery<PlanDashboard>({
    queryKey: ["dashboard", planId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/plans/${planId}/dashboard`);
      return res.data;
    },
  });
