import { OutlineButton } from "../Button/outline";
import { PrimaryButton } from "../Button/primary-filled";
import { SheetContent, SheetFooter, SheetClose, Sheet } from "../ui/sheet";
import { Spinner } from "../ui/spinner";
import { BillSplitType, useGetBill, useMarkBillSettled } from "./-queries";
import MemberCard from "../MemberCard";
import { useState } from "react";
import AddBill from "./add-bill";
import { useAuth } from "@/auth/useAuth";
import { toast } from "sonner";
import { CheckCircle2, Trash2 } from "lucide-react";
import AttachmentItem from "../Files/attachment-item";
import { ConfirmDeleteDialog } from "../Modals/delete-confirmation";
import { useDeleteBill } from "./-queries";

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
  const { mutate: toggleSettled, isPending: isToggling } = useMarkBillSettled(planId);
  const { mutate: deleteBill, isPending: isDeleting } = useDeleteBill(planId);

  const [isEdit, setIsEdit] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const role = localStorage.getItem(`plan_role_${planId}`);
  const isPlanOwner = role === "OWNER";
  const isCreator = bill?.createdById === user?.id;

  const canEdit = isPlanOwner || isCreator;

  const canSettle =
    !!bill &&
    (!!user?.id &&
      (bill.createdById === user.id || bill.paidById === user.id || isPlanOwner));

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsEdit(false);
      setDeleteConfirmOpen(false);
    }
    onOpenChange(newOpen);
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
                <button
                  onClick={() => bill && toggleSettled(bill?.id)}
                  disabled={isToggling || !canSettle}
                  className="shrink-0 cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-40"
                ></button>
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
                {bill?.isSettled && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 pup-body-sm-500 text-green-600">
                      <CheckCircle2 size={16} />
                      Settled
                    </span>
                  </>
                )}
              </div>

              {bill?.category && (
                <div>
                  <label className="pup-body-md-500 block text-neutral-black mb-2">
                    Category:
                  </label>
                  <p className="pup-body-md-400">{bill.category}</p>
                </div>
              )}

              {/* <div>
                <label className="pup-body-md-500 block text-neutral-black mb-2">
                  Split Type:
                </label>
                <p className="pup-body-md-400 capitalize">
                  {bill?.splitType.toLowerCase().replace("_", " ")}
                </p>
              </div> */}

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

              {bill?.task && (
                <div>
                  <label className="pup-body-md-500 block text-neutral-black mb-2">
                    Linked Task:
                  </label>
                  <p className="pup-body-md-400">{bill.task.name}</p>
                </div>
              )}

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
                <span>Created: {new Date(bill?.createdAt || "").toLocaleDateString()}</span>
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
