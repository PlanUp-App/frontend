import AddFile from "@/components/Files/add-file";
import FileCard from "@/components/Files/file-card";
import { useDeleteFile, useGetFiles } from "@/components/Files/-queries";
import { PrimaryButton } from "@/components/Button/primary-filled";
import { SearchInput } from "@/components/CustomInput/search-input";
import { useDebounce } from "@/components/CustomInput/useDebounce";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/auth/useAuth";
import { router } from "@/main";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$planId/_layout/files/",
)({
  validateSearch: (search) => ({
    search: search.search as string | undefined,
    page: Number(search.page) > 0 ? Number(search.page) : 1,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { planId } = Route.useParams();
  const { user } = useAuth();
  const { search, page } = Route.useSearch();
  const [searchTerm, setSearchTerm] = useState(search ?? "");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [addFileIsOpen, setAddFileIsOpen] = useState(false);
  const role = localStorage.getItem(`plan_role_${planId}`);
  const isPlanOwner = role === "OWNER";
  const deleteFileMutation = useDeleteFile(planId);

  useEffect(() => {
    router.navigate({
      to: `/my-plans/${planId}/files`,
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        search: debouncedSearch || undefined,
        page: 1,
      }),
    });
  }, [debouncedSearch, planId]);

  const { data, isLoading, isError } = useGetFiles({
    planId,
    search: debouncedSearch,
    page,
    limit: 10,
  });

  const pagination = data?.pagination;
  const currentPage = pagination?.page ?? page ?? 1;

  const handleDeleteFile = (fileId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this file?",
    );
    if (!confirmed) return;

    deleteFileMutation.mutate(fileId, {
      onSuccess: () => {
        toast.success("File deleted successfully");
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message ?? "Failed to delete file");
      },
    });
  };

  const handlePageChange = (nextPage: number) => {
    router.navigate({
      to: `/my-plans/${planId}/files`,
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        page: nextPage,
      }),
    });
  };

  return (
    <>
      <AddFile
        open={addFileIsOpen}
        onOpenChange={setAddFileIsOpen}
        planId={planId}
      />
      <div className="flex justify-between mb-12 items-center">
        <h1 className="pup-heading-three">Files</h1>
        <PrimaryButton
          title="Upload File"
          type="button"
          onClick={() => setAddFileIsOpen(true)}
        />
      </div>

      <SearchInput
        placeholder="Search files by name"
        className="mb-8"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {isLoading ? (
        <div className="flex justify-center mt-16">
          <Spinner />
        </div>
      ) : isError ? (
        <p className="pup-body-md-400 text-neutral-grey">
          Something went wrong while fetching files.
        </p>
      ) : data?.data && data.data.length > 0 ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {data.data.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                canDelete={isPlanOwner || file.uploaderId === user?.id}
                isDeleting={deleteFileMutation.isPending}
                onDelete={handleDeleteFile}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="cursor-pointer rounded-lg border border-off-white px-3 py-1.5 pup-body-sm-400 text-neutral-dark-grey disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <span className="pup-body-sm-400 text-neutral-grey">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="cursor-pointer rounded-lg border border-off-white px-3 py-1.5 pup-body-sm-400 text-neutral-dark-grey disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="pup-body-md-400 text-neutral-grey">No files found.</p>
      )}
    </>
  );
}
