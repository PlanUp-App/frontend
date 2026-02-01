import { OutlineButton } from "../Button/outline";
import { PrimaryButton } from "../Button/primary-filled";
import { SheetContent, SheetFooter, SheetClose, Sheet } from "../ui/sheet";
import { Spinner } from "../ui/spinner";
import { BillSplitType, useGetBill } from "./-queries";
import MemberCard from "../MemberCard";
import { useState } from "react";
import AddBill from "./add-bill";

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

  const [isEdit, setIsEdit] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsEdit(false);
    }
    onOpenChange(newOpen);
  };

  if (!isEdit)
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="max-w-[50%] min-w-[40%] px-8 py-12 overflow-scroll gap-10">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <p>An error occurred</p>
          ) : (
            <>
              <div className="flex gap-3 items-center">
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
                  <label className="pup-body-md-500 block text-neutral-black mb-2">
                    Paid by:
                  </label>
                  <MemberCard
                    id={bill.paidBy.id}
                    name={bill.paidBy.name}
                    email={bill.paidBy.email}
                    profilePicture={bill.paidBy.profilePicture}
                    hasOptions={false}
                  />
                </div>
              )}

              {bill?.split && bill.split.length > 0 && (
                <div>
                  <label className="pup-body-md-500 block text-neutral-black mb-2">
                    Split between:
                  </label>
                  <div className="space-y-2">
                    {bill.split.map((split) => (
                      <div
                        key={split.id}
                        className="flex items-center justify-between"
                      >
                        <MemberCard
                          id={split.user.id}
                          name={split.user.name}
                          email={split.user.email}
                          profilePicture={split.user.profilePicture}
                          hasOptions={false}
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

              {/* {bill?.attachmentUrl && (
                <div>
                  <label className="pup-body-md-500 block text-neutral-black mb-2">
                    Attachment:
                  </label>
                  <img
                    href={bill.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pup-body-md-400 text-primary-orange underline"
                  >
                    View attachment
                  </a>
                </div>
              )} */}

              <div className="flex gap-4 text-neutral-grey pup-body-sm-400">
                <span>Created: {new Date().toLocaleDateString()}</span>
              </div>

              <SheetFooter>
                <PrimaryButton
                  type="button"
                  title="Edit"
                  onClick={() => setIsEdit(true)}
                />
                <SheetClose asChild>
                  <OutlineButton
                    title="Close"
                    className="border-primary-orange text-primary-orange"
                  />
                </SheetClose>
              </SheetFooter>
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
      }}
    />
  );
}
