import axiosInstance from "@/utils/axios/axiosInstance";
import { queryClient } from "@/utils/queryclient/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

export const BillSplitType = {
  EQUAL: "EQUAL",
  PERCENTAGE: "PERCENTAGE",
  EXACT: "EXACT",
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

async function createBill(dto: CreateBillDto) {
  return await axiosInstance.post("/bills", dto);
}

export function useCreateBill(planId: string) {
  return useMutation({
    mutationFn: (dto: CreateBillDto) => createBill(dto),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bills", planId],
      });
      queryClient.invalidateQueries({
        queryKey: ["report"],
      });
    },
  });
}

export interface UpdateBillDto {
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

async function updateBill(billId: string, dto: UpdateBillDto) {
  return await axiosInstance.patch(`/bills/${billId}`, dto);
}

export function useUpdateBill(planId: string) {
  return useMutation({
    mutationFn: ({ billId, dto }: { billId: string; dto: UpdateBillDto }) =>
      updateBill(billId, dto),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bills", planId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bill", variables.billId],
      });
      queryClient.invalidateQueries({
        queryKey: ["report"],
      });
    },
  });
}

export interface Bill {
  id: string;
  planId: string;
  taskId: string | null;
  title: string;
  amount: number;
  category: string | null;
  attachmentUrl: string | null;
  splitType: BillSplitType;
  paidById: string | null;
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;
  createdById: string;
}

export interface BillsResponse {
  data: Bill[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    pages: number;
  };
}

export interface GetBillsParams {
  planId: string;
  search?: string;
  limit?: number;
  skip?: number;
}

export async function getBills({
  planId,
  search,
  limit = 10,
  skip = 0,
}: GetBillsParams): Promise<BillsResponse> {
  const params = new URLSearchParams({
    planId,
    limit: limit.toString(),
    skip: skip.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await axiosInstance.get(`/bills?${params.toString()}`);
  return response.data;
}

export function useGetBills(params: GetBillsParams) {
  return useQuery({
    queryKey: [
      "bills",
      params.planId,
      params.search,
      params.limit,
      params.skip,
    ],
    queryFn: () => getBills(params),
    enabled: !!params.planId,
  });
}

export interface BillSplit {
  id: string;
  amount: number;
  userId: string;
  percentage: number | null;
  billId: string;
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture: string | null;
  };
}

export interface BillTask {
  name: string;
  description: string | null;
  assigneeId: string | null;
  dueDate: Date | null;
  id: string;
  phaseId: string | null;
  creatorId: string;
  createdAt: Date;
}

export interface BillWithRelations {
  id: string;
  planId: string;
  taskId: string | null;
  title: string;
  amount: number;
  category: string | null;
  attachmentUrl: string | null;
  splitType: BillSplitType;
  paidById: string | null;
  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;
  createdById: string;
  split: BillSplit[];
  task: BillTask | null;
  paidBy: {
    id: string;
    name: string;
    email: string;
    profilePicture: string | null;
  } | null;
}

export async function getBill(
  billId: string,
): Promise<BillWithRelations | null> {
  const response = await axiosInstance.get(`/bills/${billId}`);
  return response.data;
}

export function useGetBill(billId: string) {
  return useQuery({
    queryKey: ["bill", billId],
    queryFn: () => getBill(billId),
    enabled: !!billId,
  });
}
