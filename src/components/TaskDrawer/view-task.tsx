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
import {
  CheckCircle2,
  Circle,
  Trash2,
  Link2,
  X,
  ChevronDown,
  Search,
  Receipt,
} from "lucide-react";
import AttachmentItem from "../Files/attachment-item";
import { useAuth } from "@/auth/useAuth";
import { ConfirmDeleteDialog } from "../Modals/delete-confirmation";
import { useDeleteTask } from "./-queries";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useGetBillsForPlan, useLinkBillToTask } from "../Bills/-queries";
import { useClickOutside } from "@mantine/hooks";

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
  const { mutate: linkBill, isPending: isLinking } = useLinkBillToTask(planId);

  const [isEdit, setIsEdit] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [billPickerOpen, setBillPickerOpen] = useState(false);
  const [billSearch, setBillSearch] = useState("");

  const pickerRef = useClickOutside(() => setBillPickerOpen(false));

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
      setBillPickerOpen(false);
    }
    onOpenChange(nextOpen);
  };

  const isComplete = task?.data.isComplete;

  // Bills data
  const linkedBills = task?.data.Bill ?? [];
  const linkedBillIds = new Set(linkedBills.map((b) => b.id));

  const { data: allBills } = useGetBillsForPlan(planId, billSearch);
  const availableBills = (allBills ?? []).filter(
    (b) => !linkedBillIds.has(b.id) && !b.taskId,
  );

  const handleLinkBill = (billId: string) => {
    linkBill(
      { billId, taskId },
      {
        onSuccess: () => {
          toast.success("Bill linked");
          setBillPickerOpen(false);
          setBillSearch("");
        },
        onError: () => toast.error("Failed to link bill"),
      },
    );
  };

  const handleUnlinkBill = (billId: string) => {
    linkBill(
      { billId, taskId: null },
      {
        onSuccess: () => toast.success("Bill unlinked"),
        onError: () => toast.error("Failed to unlink bill"),
      },
    );
  };

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

              <div>
                <label className="pup-body-md-500 block text-neutral-black mb-3">
                  Linked Bills:
                </label>

                {linkedBills.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {linkedBills.map((bill) => (
                      <div
                        key={bill.id}
                        className="flex items-center gap-2 p-3 rounded-xl border border-off-white bg-neutral-50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="pup-body-sm-400 text-neutral-black truncate">
                            {bill.title}
                          </p>
                          <p className="pup-body-xs-400 text-neutral-grey">
                            {bill.amount.toLocaleString("en-US", {
                              style: "currency",
                              currency: "NPR",
                            })}
                            {bill.category && ` · ${bill.category}`}
                          </p>
                        </div>
                        {bill.isSettled && (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle2 size={14} />
                            Settled
                          </span>
                        )}
                        {canEdit && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleUnlinkBill(bill.id)}
                                disabled={isLinking}
                                tabIndex={-1}
                                className="shrink-0 p-1 rounded-full text-neutral-grey hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                              >
                                {isLinking ? <Spinner /> : <X size={14} />}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Unlink bill</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Link bill picker */}
                {canEdit && (
                  <div className="relative" ref={pickerRef}>
                    <button
                      type="button"
                      onClick={() => setBillPickerOpen((v) => !v)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-neutral-300 text-neutral-grey hover:border-primary-orange hover:text-primary-orange transition-colors pup-body-md-400 cursor-pointer w-full"
                    >
                      <Link2 size={14} />
                      <span className="flex-1 text-left">Link a bill</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${billPickerOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {billPickerOpen && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-off-white bg-white shadow-lg overflow-hidden">
                        {/* search */}
                        <div className="p-2 border-b border-off-white">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50">
                            <Search
                              size={13}
                              className="text-neutral-grey shrink-0"
                            />
                            <input
                              autoFocus
                              value={billSearch}
                              onChange={(e) => setBillSearch(e.target.value)}
                              placeholder="Search bills…"
                              className="flex-1 bg-transparent outline-none pup-body-sm-400 text-neutral-black placeholder:text-neutral-grey"
                            />
                          </div>
                        </div>

                        <div className="max-h-56 overflow-y-auto">
                          {availableBills.length === 0 ? (
                            <p className="p-4 pup-body-sm-400 text-neutral-grey text-center">
                              No unlinked bills found
                            </p>
                          ) : (
                            availableBills.map((bill) => (
                              <button
                                key={bill.id}
                                type="button"
                                onClick={() => handleLinkBill(bill.id)}
                                disabled={isLinking}
                                className="w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors border-b border-off-white last:border-b-0 flex items-center gap-3 disabled:opacity-50"
                              >
                                <Receipt
                                  size={14}
                                  className="text-neutral-grey shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="pup-body-sm-400 text-neutral-black truncate">
                                    {bill.title}
                                  </p>
                                  <p className="pup-body-xs-400 text-neutral-grey">
                                    {bill.amount.toLocaleString("en-US", {
                                      style: "currency",
                                      currency: "NPR",
                                    })}
                                    {bill.category && ` · ${bill.category}`}
                                  </p>
                                </div>
                                <span
                                  className={cn(
                                    "shrink-0 px-2 py-0.5 rounded-full pup-body-xs-400",
                                    bill.isSettled
                                      ? "bg-green-50 text-green-600"
                                      : "bg-amber-50 text-amber-600",
                                  )}
                                >
                                  {bill.isSettled ? "Settled" : "Pending"}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="pup-body-md-500 block text-neutral-black mb-3">
                  Total Task Cost from Bills:
                </label>
                <p className="pup-body-sm-500 block text-neutral-black mb-3">
                  {linkedBills
                    .reduce((sum, bill) => sum + bill.amount, 0)
                    .toLocaleString("en-US", {
                      style: "currency",
                      currency: "NPR",
                    })}
                </p>
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
