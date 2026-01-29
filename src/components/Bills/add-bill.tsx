import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { CustomInput } from "../CustomInput/input";
import MemberSelect, { type MemberOption } from "../MemberSelect";
import { PrimaryButton } from "../Button/primary-filled";
import { OutlineButton } from "../Button/outline";
import { SimpleSelect } from "../Select";
import { useState } from "react";
import { useGetMembers } from "@/routes/_authenticated/my-plans/$plan-id/_layout/members/-queries";
import { z } from "zod";
import { useForm } from "@mantine/form";

export interface AddBillProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  onClose?: () => void;
}

const BillSplitTypeEnum = z.enum(["Equal", "Percentage", "Amount"]);

const memberOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  email: z.string().optional(),
  profilePicture: z.string().nullable().optional(),
});

const billSplitSchema = z.object({
  member: memberOptionSchema.nullable(),
  amount: z.number().positive().optional(),
  percentage: z.number().positive().optional(),
});

const createBillSchema = z
  .object({
    planId: z.string().min(1),
    taskId: z.string().optional(),
    title: z.string().min(1),
    amount: z.number().positive(),
    category: z.string().optional(),
    attachmentUrl: z.url().optional(),
    splitType: BillSplitTypeEnum,
    paidBy: memberOptionSchema.nullable().optional(),
    split: z.array(billSplitSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const { splitType, split } = data;
    const seen = new Set<string>();

    if (!splitType) return;

    split.forEach((entry, index) => {
      if (!entry.member) {
        ctx.addIssue({
          path: ["split", index, "member"],
          message: "Member is required",
          code: "custom",
        });
        return;
      }
      const userId = entry.member.value;

      if (seen.has(userId)) {
        ctx.addIssue({
          path: ["split", index, "member"],
          message: "This member is already selected",
          code: z.ZodIssueCode.custom,
        });
      } else {
        seen.add(userId);
      }
      /* EQUAL */
      if (splitType === "Equal") {
        if (entry.amount != null || entry.percentage != null) {
          ctx.addIssue({
            path: ["split", index],
            message: "Equal split should not include amount or percentage",
            code: "custom",
          });
        }
      }

      /* PERCENTAGE */
      if (splitType === "Percentage") {
        if (entry.percentage == null) {
          ctx.addIssue({
            path: ["split", index, "percentage"],
            message: "Percentage is required",
            code: "custom",
          });
        }

        if (entry.amount != null) {
          ctx.addIssue({
            path: ["split", index, "amount"],
            message: "Amount should not be provided for percentage split",
            code: "custom",
          });
        }

        if (
          entry.percentage != null &&
          (entry.percentage <= 0 || entry.percentage > 100)
        ) {
          ctx.addIssue({
            path: ["split", index, "percentage"],
            message: "Percentage must be between 1 and 100",
            code: "custom",
          });
        }
      }

      /* AMOUNT */
      if (splitType === "Amount") {
        if (entry.amount == null) {
          ctx.addIssue({
            path: ["split", index, "amount"],
            message: "Amount is required",
            code: "custom",
          });
        }

        if (entry.percentage != null) {
          ctx.addIssue({
            path: ["split", index, "percentage"],
            message: "Percentage should not be provided for amount split",
            code: "custom",
          });
        }
      }
    });

    /* OPTIONAL: percentage sum must be 100 */
    if (splitType === "Percentage") {
      const totalPercentage = split.reduce(
        (sum, s) => sum + (s.percentage ?? 0),
        0,
      );

      if (totalPercentage !== 100) {
        ctx.addIssue({
          path: ["split"],
          message: "Percentages must add up to 100",
          code: "custom",
        });
      }
    }
  });

export default function AddBill({
  open,
  onOpenChange,
  planId,
  onClose,
}: AddBillProps) {
  type CreateBillForm = z.infer<typeof createBillSchema>;
  const form = useForm<CreateBillForm>({
    initialValues: {
      planId,
      title: "",
      taskId: undefined,
      amount: 0,
      category: "",
      attachmentUrl: "",
      splitType: "Equal",
      paidBy: undefined,
      split: [
        {
          member: null as any,
        },
      ],
    },
    validate: (values) => {
      const result = createBillSchema.safeParse(values);
      if (result.success) return {};
      return result.error.flatten().fieldErrors;
    },
  });

  const { data: members } = useGetMembers(planId);

  const selectedMemberIds = new Set(
    form.values.split
      .map((s) => s.member?.value)
      .filter((v): v is string => !!v),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-[50%] min-w-[40%] px-8 py-12 overflow-scroll">
        <div className="flex gap-3 items-center">
          <h3 className="pup-body-xl-700 text-neutral-black">
            {form.values.title || "New Bill"}
          </h3>
        </div>
        <CustomInput label="Name" {...form.getInputProps("title")} />
        <CustomInput label="Category" {...form.getInputProps("category")} />
        <CustomInput label="Task" />
        <MemberSelect
          data={members?.data ?? null}
          label="Paid by"
          selectedMember={form.values.paidBy ?? null}
          setSelectedMember={(member) => form.setFieldValue("paidBy", member)}
        />
        <SimpleSelect
          label="Split Type"
          items={["Equal", "Percentage", "Amount"]}
          value={form.values.splitType}
          onValueChange={(value) => {
            form.setFieldValue("splitType", value);
          }}
        />
        {(form.values.splitType === "Equal" ||
          form.values.splitType === "Percentage") && (
          <CustomInput label="Total" />
        )}
        <div>
          <label className="pup-body-md-500 block text-neutral-black mb-1.5">
            Split between
          </label>
          {form.values.split.map((_, index) => (
            <div key={index} className="flex gap-2 mb-1.5">
              <MemberSelect
                data={members?.data ?? null}
                selectedMember={form.values.split[index].member}
                setSelectedMember={(member) =>
                  form.setFieldValue(`split.${index}.member`, member)
                }
                disabledMemberIds={selectedMemberIds}
                className="flex-1"
              />

              {form.values.splitType !== "Equal" && (
                <CustomInput
                  placeholder={
                    form.values.splitType === "Percentage"
                      ? "Percent"
                      : "Amount"
                  }
                  {...form.getInputProps(
                    form.values.splitType === "Percentage"
                      ? `split.${index}.percentage`
                      : `split.${index}.amount`,
                  )}
                />
              )}

              <button
                type="button"
                className="cursor-pointer disabled:cursor-not-allowed"
                disabled={form.values.split.length === 1}
                onClick={() => {
                  form.removeListItem("split", index);
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className="pup-body-md-500 py-1 text-dark-blue"
            onClick={() => form.insertListItem("split", { member: null })}
          >
            + Add member
          </button>
        </div>
        <SheetFooter>
          <PrimaryButton
            type="submit"
            title="Save changes"
            // onClick={handleSubmit}
            // isLoading={createTaskMutation.isPending}
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
