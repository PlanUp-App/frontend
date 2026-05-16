import { OutlineButton } from "../Button/outline";
import { PrimaryButton } from "../Button/primary-filled";
import { SheetContent, SheetFooter, SheetClose, Sheet } from "../ui/sheet";
import { Spinner } from "../ui/spinner";
import { useGetTask, useMarkTaskComplete } from "./-queries";
import { cn, dateFormat } from "@/lib/utils";
import { RichTextParser } from "../RichTextParser";
import MemberCard from "../MemberCard";
import { useState } from "react";
import TaskDrawer from "./add-task";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import AttachmentItem from "../Files/attachment-item";
import { useAuth } from "@/auth/useAuth";
import { ConfirmDeleteDialog } from "../Modals/delete-confirmation";
import { useDeleteTask } from "./-queries";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function ViewTaskDrawer({
  open,
  onOpenChange,
  planId,
  phaseId,
  taskId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  phaseId: string;
  taskId: string;
}) {
  const {
    data: task,
    isLoading,
    isError,
  } = useGetTask(planId, phaseId, taskId);
  const { mutate: toggleComplete, isPending: isToggling } = useMarkTaskComplete(
    planId,
    phaseId,
    taskId,
  );
  const { user } = useAuth();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask(
    planId,
    phaseId,
    taskId,
  );

  const [isEdit, setIsEdit] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const role = localStorage.getItem(`plan_role_${planId}`);
  const isOwner = role === "OWNER";
  const isCreator = task?.data.creatorId === user?.id;
  const isAssignee = task?.data.assigneeId === user?.id;

  const canEdit = isOwner || isCreator;
  const canMarkComplete = isOwner || isCreator || isAssignee;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setIsEdit(false);
      setDeleteConfirmOpen(false);
    }
    onOpenChange(nextOpen);
  };

  const isComplete = task?.data.isComplete;

  if (!isEdit)
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="w-full sm:max-w-[50%] sm:min-w-[40%] px-6 sm:px-8 py-10 sm:py-12 overflow-scroll gap-10">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <p>An error occured</p>
          ) : (
            <>
              <div className="flex gap-3 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      tabIndex={-1}
                      onClick={() => toggleComplete()}
                      disabled={isToggling || !canMarkComplete}
                      className="shrink-0 cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-40"
                    >
                      {isComplete ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <Circle size={20} className="text-neutral-300" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {isComplete ? "Mark as incomplete" : "Mark as complete"}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <h3
                  className={cn(
                    "pup-body-xl-700 text-neutral-black",
                    isComplete && "line-through text-neutral-grey",
                  )}
                >
                  {task?.data.name}
                </h3>
                <span>•</span>
                <span className="pup-body-xl-400 text-neutral-grey">
                  {task?.data.dueDate
                    ? dateFormat(task?.data.dueDate)
                    : "Invalid Date"}
                </span>
              </div>
              <div>
                <RichTextParser html={task?.data.description} />
              </div>
              <div>
                <label className="pup-body-md-500 block text-neutral-black mb-4">
                  Assigned to:
                </label>
                {task?.data.assignee ? (
                  <MemberCard
                    id={task?.data.assignee.id}
                    name={task?.data.assignee?.name}
                    email={task?.data.assignee.email}
                    profilePicture={task?.data.assignee.profilePicture}
                    hasOptions={false}
                    type="sm"
                  />
                ) : (
                  <p>No one</p>
                )}
              </div>
              {task?.data.files && task.data.files.length > 0 && (
                <div>
                  <label className="pup-body-md-500 block text-neutral-black mb-3">
                    Attachments
                  </label>
                  <div className="space-y-2">
                    {task.data.files.map((file) => (
                      <AttachmentItem key={file.id} file={file} />
                    ))}
                  </div>
                </div>
              )}
              <SheetFooter className="gap-3">
                {canEdit && (
                  <div className="flex gap-2">
                    <PrimaryButton
                      type="submit"
                      title="Edit"
                      className="flex-1"
                      onClick={() => setIsEdit(true)}
                    />
                    <button
                      className="w-11 h-11 flex items-center justify-center border border-red-200 text-red-600 hover:bg-red-50 rounded-full transition-colors shrink-0 cursor-pointer"
                      onClick={() => setDeleteConfirmOpen(true)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
                <SheetClose asChild>
                  <OutlineButton
                    title="Close"
                    className="border-primary-orange text-primary-orange"
                  />
                </SheetClose>
              </SheetFooter>

              <ConfirmDeleteDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title="Delete Task"
                description={`Are you sure you want to delete "${task?.data.name}"? This action cannot be undone.`}
                isLoading={isDeleting}
                onConfirm={() => {
                  deleteTask(undefined, {
                    onSuccess: () => {
                      toast.success("Task deleted successfully");
                      handleOpenChange(false);
                    },
                    onError: () => {
                      toast.error("Failed to delete task");
                    },
                  });
                }}
              />
            </>
          )}
        </SheetContent>
      </Sheet>
    );

  return (
    <TaskDrawer
      open={open}
      onOpenChange={handleOpenChange}
      planId={planId}
      phaseId={phaseId}
      onClose={() => setIsEdit(false)}
      initialData={{
        taskId: task?.data.id ?? "",
        name: task?.data.name ?? "",
        description: task?.data.description ?? "<p></p>",
        dueDate: task?.data.dueDate || new Date().toISOString(),
        assignee: task?.data.assignee
          ? {
              value: task.data.assignee.id,
              label: task.data.assignee.name,
              email: task.data.assignee.email,
              profilePicture: task.data.assignee.profilePicture,
            }
          : null,
        files: task?.data.files ?? [],
      }}
    />
  );
}
