import { OutlineButton } from "../Button/outline";
import { PrimaryButton } from "../Button/primary-filled";
import { SheetContent, SheetFooter, SheetClose, Sheet } from "../ui/sheet";
import { Spinner } from "../ui/spinner";
import {
  BillSplitType,
  useGetBill,
  useMarkBillSettled,
  useLinkBillToTask,
} from "./-queries";
import MemberCard from "../MemberCard";
import { useState, useRef } from "react";
import AddBill from "./add-bill";
import { useAuth } from "@/auth/useAuth";
import { toast } from "sonner";
import {
  CheckCircle2,
  Circle,
  Trash2,
  Link2,
  X,
  ChevronDown,
  Search,
} from "lucide-react";
import AttachmentItem from "../Files/attachment-item";
import { ConfirmDeleteDialog } from "../Modals/delete-confirmation";
import { useDeleteBill } from "./-queries";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useGetPlanTasksForPicker } from "../TaskDrawer/-queries";
import { useClickOutside } from "@mantine/hooks";

export default function ViewBill({
  open,
  onOpenChange,
  planId,
  billId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  billId: string;
}) {
  const { data: bill, isLoading, isError } = useGetBill(billId);
  const { user } = useAuth();
  const { mutate: toggleSettled, isPending: isToggling } =
    useMarkBillSettled(planId);
  const { mutate: deleteBill, isPending: isDeleting } = useDeleteBill(planId);
  const { mutate: linkTask, isPending: isLinking } = useLinkBillToTask(planId);

  const [isEdit, setIsEdit] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskPickerOpen, setTaskPickerOpen] = useState(false);
  const [taskSearch, setTaskSearch] = useState("");

  const pickerRef = useClickOutside(() => setTaskPickerOpen(false));

  const role = localStorage.getItem(`plan_role_${planId}`);
  const isPlanOwner = role === "OWNER";
  const isCreator = bill?.createdById === user?.id;

  const canEdit = isPlanOwner || isCreator;

  const canSettle =
    !!bill &&
    !!user?.id &&
    (bill.createdById === user.id || bill.paidById === user.id || isPlanOwner);

  const { data: planTasks } = useGetPlanTasksForPicker(planId);

  const filteredTasks = (planTasks ?? []).filter((t) =>
    t.name.toLowerCase().includes(taskSearch.toLowerCase()),
  );

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsEdit(false);
      setDeleteConfirmOpen(false);
      setTaskPickerOpen(false);
    }
    onOpenChange(newOpen);
  };

  const handleLinkTask = (taskId: string | null) => {
    linkTask(
      { billId, taskId },
      {
        onSuccess: () => {
          toast.success(taskId ? "Task linked" : "Task unlinked");
          setTaskPickerOpen(false);
          setTaskSearch("");
        },
        onError: () => toast.error("Failed to update link"),
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
            <p>An error occurred</p>
          ) : (
            <>
              <div className="flex gap-3 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      tabIndex={-1}
                      onClick={() => bill && toggleSettled(bill?.id)}
                      disabled={isToggling || !canSettle}
                      className="shrink-0 cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-40"
                    >
                      {isToggling ? (
                        <Spinner />
                      ) : bill?.isSettled ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <Circle size={20} className="text-neutral-300" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {bill?.isSettled
                        ? "Mark as unsettled"
                        : "Mark as settled"}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <h3 className="pup-body-xl-700 text-neutral-black">
                  {bill?.title}
                </h3>
                <span>•</span>
                <span className="pup-body-xl-400 text-neutral-grey">
                  {bill?.amount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "NPR",
                  })}
                </span>
              </div>

              {bill?.category && (
                <div>
                  <label className="pup-body-md-500 block text-neutral-black mb-2">
                    Category:
                  </label>
                  <p className="pup-body-md-400">{bill.category}</p>
                </div>
              )}

              {bill?.paidBy && (
                <div>
                  <label className="pup-body-md-500 block text-neutral-black mb-4">
                    Paid by:
                  </label>
                  <MemberCard
                    id={bill.paidBy.id}
                    name={bill.paidBy.name}
                    email={bill.paidBy.email}
                    profilePicture={bill.paidBy.profilePicture}
                    hasOptions={false}
                    type="sm"
                  />
                </div>
              )}

              {bill?.split && bill.split.length > 0 && (
                <div>
                  <label className="pup-body-md-500 block text-neutral-black mb-4">
                    Split between:
                  </label>
                  <div className="space-y-2">
                    {bill.split.map((split) => (
                      <div
                        key={split.id}
                        className="flex items-center justify-between mb-4"
                      >
                        <MemberCard
                          id={split.user.id}
                          name={split.user.name}
                          email={split.user.email}
                          profilePicture={split.user.profilePicture}
                          hasOptions={false}
                          type="sm"
                        />
                        <span className="pup-body-md-400 text-neutral-grey">
                          {split.amount.toLocaleString("en-US", {
                            style: "currency",
                            currency: "NPR",
                          })}
                          {split.percentage && ` (${split.percentage}%)`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="pup-body-md-500 block text-neutral-black mb-2">
                  Linked Task:
                </label>

                {bill?.task ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-off-white bg-neutral-50 group">
                    <span className="pup-body-md-400 text-neutral-black flex-1 truncate">
                      {bill.task.name}
                    </span>
                    {canEdit && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleLinkTask(null)}
                            disabled={isLinking}
                            tabIndex={-1}
                            className="shrink-0 p-1 rounded-full text-neutral-grey hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            {isLinking ? <Spinner /> : <X size={14} />}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Unlink task</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                ) : (
                  canEdit && (
                    <div className="relative" ref={pickerRef}>
                      <button
                        type="button"
                        onClick={() => setTaskPickerOpen((v) => !v)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-neutral-300 text-neutral-grey hover:border-primary-orange hover:text-primary-orange transition-colors pup-body-md-400 cursor-pointer w-full"
                      >
                        <Link2 size={14} />
                        <span className="flex-1 text-left">Link a task</span>
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${taskPickerOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {taskPickerOpen && (
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
                                value={taskSearch}
                                onChange={(e) => setTaskSearch(e.target.value)}
                                placeholder="Search tasks…"
                                className="flex-1 bg-transparent outline-none pup-body-sm-400 text-neutral-black placeholder:text-neutral-grey"
                              />
                            </div>
                          </div>

                          <div className="max-h-56 overflow-y-auto">
                            {filteredTasks.length === 0 ? (
                              <p className="p-4 pup-body-sm-400 text-neutral-grey text-center">
                                No tasks found
                              </p>
                            ) : (
                              filteredTasks.map((task) => (
                                <button
                                  key={task.id}
                                  type="button"
                                  onClick={() => handleLinkTask(task.id)}
                                  disabled={isLinking}
                                  className="w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors border-b border-off-white last:border-b-0 flex items-center gap-3 disabled:opacity-50"
                                >
                                  {task.isComplete ? (
                                    <CheckCircle2
                                      size={14}
                                      className="text-green-500 shrink-0"
                                    />
                                  ) : (
                                    <Circle
                                      size={14}
                                      className="text-neutral-300 shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="pup-body-sm-400 text-neutral-black truncate">
                                      {task.name}
                                    </p>
                                    {task.phaseName && (
                                      <p className="pup-body-xs-400 text-neutral-grey truncate">
                                        {task.phaseName}
                                      </p>
                                    )}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>

              {bill?.files && bill.files.length > 0 && (
                <div>
                  <label className="pup-body-md-500 block text-neutral-black mb-4">
                    Attachments:
                  </label>
                  <div className="space-y-2">
                    {bill.files.map((file) => (
                      <AttachmentItem key={file.id} file={file} />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 text-neutral-grey pup-body-sm-400">
                <span>
                  Created:{" "}
                  {new Date(bill?.createdAt || "").toLocaleDateString()}
                </span>
              </div>

              <SheetFooter className="gap-3">
                {canEdit && (
                  <div className="flex gap-2">
                    <PrimaryButton
                      type="button"
                      title="Edit"
                      onClick={() => setIsEdit(true)}
                      className="flex-1"
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
                title="Delete Bill"
                description={`Are you sure you want to delete "${bill?.title}"? This action cannot be undone.`}
                isLoading={isDeleting}
                onConfirm={() => {
                  if (!bill?.id) return;
                  deleteBill(bill.id, {
                    onSuccess: () => {
                      toast.success("Bill deleted successfully");
                      handleOpenChange(false);
                    },
                    onError: () => {
                      toast.error("Failed to delete bill");
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
    <AddBill
      open={open}
      onOpenChange={handleOpenChange}
      planId={planId}
      onClose={() => setIsEdit(false)}
      billId={billId}
      initialValues={{
        planId: bill?.planId ?? planId,
        title: bill?.title ?? "",
        amount: bill?.amount ?? 0,
        category: bill?.category ?? undefined,
        splitType: bill?.splitType ?? BillSplitType.EQUAL,
        paidBy: bill?.paidBy
          ? {
              value: bill.paidBy.id,
              label: bill.paidBy.name,
              email: bill.paidBy.email,
              profilePicture: bill.paidBy.profilePicture,
            }
          : undefined,
        split:
          bill?.split.map((s) => ({
            member: {
              value: s.user.id,
              label: s.user.name,
              email: s.user.email,
              profilePicture: s.user.profilePicture,
            },
            amount: s.amount,
            percentage: s.percentage ?? undefined,
          })) ?? [],
        fileIds: bill?.files.map((f) => f.id) ?? [],
        files: bill?.files ?? [],
      }}
    />
  );
}
