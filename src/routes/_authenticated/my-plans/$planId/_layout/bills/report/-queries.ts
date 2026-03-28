import axiosInstance from "@/utils/axios/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export interface DashboardSummary {
  planTotalExpenditure: number;
  planSettledTotal: number;
  planUnsettledTotal: number;
  myTotalOwed: number;
  myTotalOwedToMe: number;
  myTotalPaidSettled: number;
  netBalance: number;
}

export interface OwedItem {
  billId: string;
  title: string;
  amount: number;
  percentage?: number | null;
  paidBy?: { id: string; name: string; profilePicture?: string } | null;
  category?: string | null;
}

export interface OwedToMeItem {
  billId: string;
  title: string;
  amount: number;
  debtor: { id: string; name: string; profilePicture?: string } | null;
  category?: string | null;
}

export interface MinTransaction {
  from: { id: string; name: string; profilePicture?: string | null };
  to: { id: string; name: string; profilePicture?: string | null };
  amount: number;
}

export interface CategoryStat {
  category: string;
  total: number;
}

export interface MonthlyTrend {
  month: string;
  total: number;
}

export interface TopSpender {
  user: { id: string; name: string; profilePicture?: string };
  totalPaid: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  owedByMe: OwedItem[];
  owedToMe: OwedToMeItem[];
  expenditureByCategory: CategoryStat[];
  monthlyTrend: MonthlyTrend[];
  topSpenders: TopSpender[];
  minTransactions: MinTransaction[];
}

export const useGetDashboard = (planId: string) =>
  useQuery<DashboardData>({
    queryKey: ["dashboard", planId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/bills/${planId}/report`);
      return res.data;
    },
  });
