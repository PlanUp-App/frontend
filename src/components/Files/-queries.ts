import axiosInstance from "@/utils/axios/axiosInstance";
import { queryClient } from "@/utils/queryclient/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface FileUploader {
  id: string;
  name: string;
  profilePicture: string | null;
}

export interface PlanFile {
  id: string;
  planId: string;
  name: string;
  url: string;
  publicId: string;
  size: number | null;
  mimeType: string | null;
  createdAt: string;
  uploaderId: string;
  uploader: FileUploader;
  tasks: { id: string; name: string }[];
  bills: { id: string; title: string }[];
  messages: { id: string }[];
}

export interface FilesResponse {
  data: PlanFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface GetFilesParams {
  planId: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getFiles({
  planId,
  search,
  page = 1,
  limit = 10,
}: GetFilesParams): Promise<FilesResponse> {
  const response = await axiosInstance.get(`/plans/${planId}/files`, {
    params: {
      ...(search ? { search } : {}),
      page,
      limit,
    },
  });

  return response.data;
}

export function useGetFiles(params: GetFilesParams) {
  return useQuery({
    queryKey: [
      "files",
      params.planId,
      params.search,
      params.page,
      params.limit,
    ],
    queryFn: () => getFiles(params),
    enabled: !!params.planId,
  });
}

interface UploadFilePayload {
  file: File;
  name: string;
  taskIds?: string[];
  billIds?: string[];
  messageIds?: string[];
}

async function uploadFile(planId: string, payload: UploadFilePayload) {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("name", payload.name);

  payload.taskIds?.forEach((taskId) => {
    formData.append("taskIds", taskId);
  });

  payload.billIds?.forEach((billId) => {
    formData.append("billIds", billId);
  });

  payload.messageIds?.forEach((messageId) => {
    formData.append("messageIds", messageId);
  });

  const response = await axiosInstance.post(
    `/plans/${planId}/files`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

export function useUploadFile(planId: string) {
  return useMutation({
    mutationFn: (payload: UploadFilePayload) => uploadFile(planId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["files", planId],
      });
    },
  });
}

async function deleteFile(planId: string, fileId: string) {
  const response = await axiosInstance.delete(
    `/plans/${planId}/files/${fileId}`,
  );
  return response.data;
}

export function useDeleteFile(planId: string) {
  return useMutation({
    mutationFn: (fileId: string) => deleteFile(planId, fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["files", planId],
      });
    },
  });
}

interface UpdateFileAssociationsPayload {
  taskIds?: string[];
  billIds?: string[];
  messageIds?: string[];
}

async function updateFileAssociations(
  planId: string,
  fileId: string,
  payload: UpdateFileAssociationsPayload,
) {
  const response = await axiosInstance.patch(
    `/plans/${planId}/files/${fileId}/associations`,
    payload,
  );
  return response.data;
}

export function useUpdateFileAssociations(planId: string) {
  return useMutation({
    mutationFn: ({
      fileId,
      payload,
    }: {
      fileId: string;
      payload: UpdateFileAssociationsPayload;
    }) => updateFileAssociations(planId, fileId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", planId] });
    },
  });
}
