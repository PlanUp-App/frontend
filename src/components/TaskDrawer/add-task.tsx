"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { PrimaryButton } from "../Button/primary-filled";
import { OutlineButton } from "../Button/outline";
import { CustomInput } from "../CustomInput/input";
import { SearchInput } from "../CustomInput/search-input";
import { useDebounce } from "../CustomInput/useDebounce";
import z from "zod";
import { DatePicker } from "../DatePicker";
import TextEditor from "../TextEditor";
import MemberSelect, { type MemberOption } from "../MemberSelect";
import { useGetMembers } from "@/routes/_authenticated/my-plans/$planId/_layout/members/-queries";
import { Spinner } from "../ui/spinner";
import { useCreateTask, useUpdateTask, type TaskFile } from "./-queries";
import { toast } from "sonner";
import { queryClient } from "@/utils/queryclient/queryClient";
import { dateFormat } from "@/lib/utils";
import AddFile from "../Files/add-file";
import { useGetFiles, type PlanFile } from "../Files/-queries";
import { Paperclip } from "lucide-react";
import AttachmentItem from "../Files/attachment-item";

const schema = z.object({
  name: z
    .string()
    .refine((val) => val.trim().length > 0, { message: "Name is required" })
    .refine((val) => val.trim().length >= 2, { message: "Name too short" })
    .default(""),
});

interface TaskDrawerInitialData {
  name: string;
  description: string;
  dueDate: string;
  assignee: MemberOption | null;
  taskId: string;
  files?: TaskFile[];
}

interface TaskDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  phaseId: string;
  initialData?: TaskDrawerInitialData;
  onClose?: () => void;
}

export default function TaskDrawer({
  open,
  onOpenChange,
  planId,
  phaseId,
  initialData,
  onClose,
}: TaskDrawerProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "<p></p>",
  );
  const [assignee, setAssignee] = useState<MemberOption | null>(
    initialData?.assignee ?? null,
  );
  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);
  const [attachmentSearch, setAttachmentSearch] = useState("");
  const debouncedAttachmentSearch = useDebounce(attachmentSearch, 300);
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>(
    [],
  );
  const [attachmentMap, setAttachmentMap] = useState<
    Record<string, PlanFile | TaskFile>
  >({});
  const [attachmentsInitialized, setAttachmentsInitialized] = useState(false);
  const [errors, setErrors] = useState<string>("");

  const { data, isLoading } = useGetMembers(planId);
  const [date, setDate] = useState<string>(
    initialData?.dueDate || new Date().toISOString(),
  );

  const createTaskMutation = useCreateTask(planId, phaseId);
  const updateTaskMutation = useUpdateTask(
    planId,
    phaseId,
    initialData?.taskId ?? "",
  );
  const currentTaskId = initialData?.taskId ?? "";

  const { data: allFilesResponse, isLoading: isAllFilesLoading } = useGetFiles({
    planId,
    page: 1,
    limit: 100,
  });

  const { data: searchedFilesResponse, isLoading: isSearchFilesLoading } =
    useGetFiles({
      planId,
      search: debouncedAttachmentSearch,
      page: 1,
      limit: 20,
    });

  const resetForm = () => {
    setName("");
    setDescription("<p></p>");
    setDate(new Date().toISOString());
    setAssignee(null);
    setAttachmentSearch("");
    setSelectedAttachmentIds([]);
    setAttachmentMap({});
    setAttachmentsInitialized(false);
    setErrors("");
  };

  useEffect(() => {
    if (!open) return;

    if (initialData?.taskId) {
      setName(initialData.name ?? "");
      setDescription(initialData.description ?? "<p></p>");
      setDate(initialData.dueDate || new Date().toISOString());
      setAssignee(initialData.assignee ?? null);
      setAttachmentSearch("");
      setErrors("");

      const initialFiles = initialData.files ?? [];
      setAttachmentMap((prev) => {
        const next = { ...prev };
        initialFiles.forEach((file) => {
          next[file.id] = file;
        });
        return next;
      });
      setSelectedAttachmentIds(initialFiles.map((file) => file.id));
      setAttachmentsInitialized(initialFiles.length > 0);
      return;
    }

    resetForm();
  }, [
    open,
    initialData?.taskId,
    initialData?.name,
    initialData?.description,
    initialData?.dueDate,
    initialData?.assignee,
    initialData?.files,
  ]);

  useEffect(() => {
    const allFiles = allFilesResponse?.data ?? [];
    const searchedFiles = searchedFilesResponse?.data ?? [];

    if (allFiles.length === 0 && searchedFiles.length === 0) return;

    setAttachmentMap((prev) => {
      const next = { ...prev };
      allFiles.forEach((file) => {
        next[file.id] = file;
      });
      searchedFiles.forEach((file) => {
        next[file.id] = file;
      });
      return next;
    });
  }, [allFilesResponse?.data, searchedFilesResponse?.data]);

  useEffect(() => {
    if (!currentTaskId || attachmentsInitialized) return;

    // If initialData has files, use those directly
    const initialFiles = initialData?.files;
    if (initialFiles && initialFiles.length > 0) {
      setAttachmentMap((prev) => {
        const next = { ...prev };
        initialFiles.forEach((file) => {
          next[file.id] = file;
        });
        return next;
      });
      setSelectedAttachmentIds(initialFiles.map((file) => file.id));
      setAttachmentsInitialized(true);
      return;
    }

    // Fallback: search through allFilesResponse for linked files
    const allFiles = allFilesResponse?.data;
    if (!allFiles) return;

    const linkedFiles = allFiles.filter((file) =>
      file.tasks.some((task) => task.id === currentTaskId),
    );

    if (linkedFiles.length > 0) {
      setAttachmentMap((prev) => {
        const next = { ...prev };
        linkedFiles.forEach((file) => {
          next[file.id] = file;
        });
        return next;
      });
      setSelectedAttachmentIds(linkedFiles.map((file) => file.id));
    }

    setAttachmentsInitialized(true);
  }, [
    allFilesResponse?.data,
    attachmentsInitialized,
    currentTaskId,
    initialData?.files,
  ]);

  const addAttachment = (file: PlanFile) => {
    setAttachmentMap((prev) => ({ ...prev, [file.id]: file }));
    setSelectedAttachmentIds((prev) =>
      prev.includes(file.id) ? prev : [...prev, file.id],
    );
  };

  const removeAttachment = (fileId: string) => {
    setSelectedAttachmentIds((prev) => prev.filter((id) => id !== fileId));
  };

  const selectedAttachments = selectedAttachmentIds
    .map((id) => attachmentMap[id])
    .filter(Boolean);

  const visibleSearchFiles =
    searchedFilesResponse?.data.filter(
      (file) => !selectedAttachmentIds.includes(file.id),
    ) ?? [];

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
      onClose?.();
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = () => {
    const payload = {
      name,
      description,
      dueDate: date,
      assigneeId: assignee?.value,
      fileIds: selectedAttachmentIds,
    };

    const result = schema.safeParse({
      name,
    });

    if (!result.success) {
      const nameErrors = result.error.issues
        .filter((issue) => issue.path[0] === "name")
        .map((issue) => issue.message);

      setErrors(nameErrors.join(", "));
      console.log(nameErrors);
    } else {
      if (!initialData?.taskId)
        createTaskMutation.mutate(payload, {
          onSuccess: () => {
            toast.success(`Task created successfully`);
            resetForm();
            onOpenChange(false);
            queryClient.invalidateQueries({ queryKey: ["tasks", phaseId] });
          },
          onError: (data) => {
            toast.error(`Task could not be created: ${data.message}`);
          },
        });
      else
        updateTaskMutation.mutate(payload, {
          onSuccess: () => {
            onClose?.();
            toast.success(`Task updated successfully`);
            queryClient.invalidateQueries({
              queryKey: ["tasks", phaseId],
            });
          },
          onError: (data) => {
            toast.error(`Task could not be updated: ${data.message}`);
          },
        });
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <AddFile
        open={isUploadFileOpen}
        onOpenChange={setIsUploadFileOpen}
        planId={planId}
        onUploaded={(uploadedFile) => {
          addAttachment(uploadedFile);
        }}
      />
        <SheetContent className="w-full sm:max-w-[50%] sm:min-w-[40%] px-6 sm:px-8 py-10 sm:py-12 overflow-scroll gap-10">
        <div className="flex gap-3 items-center">
          <h3 className="pup-body-xl-700 text-neutral-black">
            {name ? name : "New Task"}
          </h3>
          <span>•</span>
          <span className="pup-body-xl-400 text-neutral-grey">
            {dateFormat(date)}
          </span>
        </div>
        <CustomInput
          label="Task Name"
          inputProps={{
            value: name,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value),
          }}
          error={errors}
        />
        <div>
          <label className="pup-body-md-500 block text-neutral-black mb-1.5">
            Due Date
          </label>
          <DatePicker date={date} setDate={setDate} />
        </div>
        <div>
          <label className="pup-body-md-500 block text-neutral-black mb-1.5">
            Description
          </label>
          <TextEditor content={description} setContent={setDescription} />
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          <MemberSelect
            data={data ?? null}
            label="Assignee"
            selectedMember={assignee}
            setSelectedMember={setAssignee}
          />
        )}

        <div className="border border-off-white rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="pup-body-md-500 text-neutral-black">
              Attachments
            </label>
            <OutlineButton
              title="Upload & Attach"
              className="border-primary-orange text-primary-orange h-9 px-4"
              type="button"
              onClick={() => setIsUploadFileOpen(true)}
            />
          </div>

          <div className="relative">
            <SearchInput
              placeholder="Search existing files"
              value={attachmentSearch}
              onChange={(e) => setAttachmentSearch(e.target.value)}
            />

            {attachmentSearch && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-off-white bg-white shadow-lg overflow-hidden">
                {isAllFilesLoading || isSearchFilesLoading ? (
                  <div className="p-4 flex justify-center">
                    <Spinner />
                  </div>
                ) : visibleSearchFiles.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {visibleSearchFiles.map((file) => (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => {
                          addAttachment(file);
                          setAttachmentSearch("");
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 transition-colors border-b border-off-white last:border-b-0 flex items-center gap-2"
                      >
                        <Paperclip
                          size={14}
                          className="text-neutral-dark-grey shrink-0"
                        />
                        <span className="pup-body-sm-400 text-neutral-black truncate">
                          {file.name}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="pup-body-sm-400 text-neutral-grey">
                      No matching files found.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedAttachments.length > 0 && (
            <div className="space-y-2">
              {selectedAttachments.map((file) => (
                <AttachmentItem
                  key={file.id}
                  file={file}
                  onRemove={removeAttachment}
                />
              ))}
            </div>
          )}
        </div>

        <SheetFooter>
          <PrimaryButton
            type="submit"
            title="Save changes"
            onClick={handleSubmit}
            isLoading={
              createTaskMutation.isPending || updateTaskMutation.isPending
            }
          />
          <SheetClose asChild>
            <OutlineButton
              title="Close"
              className="border-primary-orange text-primary-orange"
            />
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
