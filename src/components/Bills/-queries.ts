import axiosInstance from "@/utils/axios/axiosInstance";
import { queryClient } from "@/utils/queryclient/queryClient";
import { useMutation } from "@tanstack/react-query";

export const BillSplitType = {
  EQUAL: "EQUAL",
  PERCENTAGE: "PERCENTAGE",
  AMOUNT: "AMOUNT",
} as const;

export type BillSplitType = (typeof BillSplitType)[keyof typeof BillSplitType];

export interface CreateBillDto {
  planId: string;
  taskId?: string;
  title: string;
  amount: number;
  category?: string;
  description?: string;
  attachmentUrl?: string;
  splitType: BillSplitType;
  paidById?: string;
  split: {
    userId: string;
    amount?: number;
    percentage?: number;
  }[];
}

export async function createBill(dto: CreateBillDto) {
  return await axiosInstance.post("/bills", dto);
}

export function useCreateBill(planId: string) {
  return useMutation({
    mutationFn: (dto: CreateBillDto) => createBill(dto),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bills", planId],
      });
    },
  });
}
