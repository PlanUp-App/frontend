import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { CustomInput } from "../CustomInput/input";
import MemberSelect from "../MemberSelect";
import { PrimaryButton } from "../Button/primary-filled";
import { OutlineButton } from "../Button/outline";
import { SimpleSelect } from "../Select";
import { useGetMembers } from "@/routes/_authenticated/my-plans/$plan-id/_layout/members/-queries";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { BillSplitType, useCreateBill } from "./-queries";
import { useEffect } from "react";

export interface AddBillProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  onClose?: () => void;
}

const BillSplitTypeEnum = z.enum(BillSplitType);

const SPLIT_TYPE_ITEMS = [
  { value: BillSplitType.EQUAL, label: "Equal" },
  { value: BillSplitType.PERCENTAGE, label: "Percentage" },
  { value: BillSplitType.AMOUNT, label: "Amount" },
] as const;

const memberOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  email: z.string().optional(),
  profilePicture: z.string().nullable().optional(),
});

const billSplitSchema = z.object({
  member: memberOptionSchema.nullable(),
  amount: z.coerce.number().positive("Amount must be positive").optional(),
  percentage: z.coerce
    .number()
    .positive("Percentage must be positive")
    .optional(),
});

const createBillSchema = z
  .object({
    planId: z.string().nonempty(),
    taskId: z.string().optional(),
    title: z
      .string()
      .min(1, { error: "Name is required" })
      .nonempty({ error: "Name is required" }),
    amount: z.coerce.number().positive({ error: "Amount must be positive" }),
    category: z.string().optional(),
    attachmentUrl: z.url().optional(),
    splitType: BillSplitTypeEnum,
    paidBy: z
      .union([memberOptionSchema, z.null(), z.undefined()])
      .refine((val) => val != null, { message: "Member is required" }),
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
          code: "custom",
        });
      } else {
        seen.add(userId);
      }
      // equal
      if (splitType === BillSplitType.EQUAL) {
        if (entry.amount != null || entry.percentage != null) {
          ctx.addIssue({
            path: ["split", index],
            message: "Equal split should not include amount or percentage",
            code: "custom",
          });
        }
      }

      // percentage
      if (splitType === BillSplitType.PERCENTAGE) {
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

      // amount
      if (splitType === BillSplitType.AMOUNT) {
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

    // percentage sum 100
    if (splitType === BillSplitType.PERCENTAGE) {
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
      splitType: BillSplitType.EQUAL,
      paidBy: undefined,
      split: [
        {
          member: null as any,
          amount: 0,
          percentage: 0,
        },
      ],
    },
    validate: (values) => {
      const result = createBillSchema.safeParse(values);
      if (result.success) return {};

      const errors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      });

      return errors;
    },
  });

  const { data: members } = useGetMembers(planId);

  const selectedMemberIds = new Set(
    form.values.split
      .map((s) => s.member?.value)
      .filter((v): v is string => !!v),
  );
  const createBillMutation = useCreateBill(planId);

  const onSubmit = form.onSubmit((values) => {
    const payload = {
      planId: values.planId,
      taskId: values.taskId,
      title: values.title,
      amount: values.amount,
      category: values.category || undefined,
      attachmentUrl: values.attachmentUrl || undefined,
      splitType: values.splitType,
      paidById: values.paidBy?.value,

      split: values.split.map((s) => ({
        userId: s.member!.value,
        amount: s.amount,
        percentage: s.percentage,
      })),
    };

    createBillMutation.mutate(payload);
  });

  useEffect(() => {
    if (form.values.splitType === BillSplitType.AMOUNT) {
      const total = form.values.split.reduce(
        (sum, s) => sum + (s.amount ?? 0),
        0,
      );
      if (form.values.amount !== total) {
        form.setFieldValue("amount", total);
      }
    }
  }, [form.values.split, form.values.splitType]);

  console.log(form.values);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-[50%] min-w-[40%] px-8 py-12 overflow-scroll">
        <div className="flex gap-3 items-center">
          <h3 className="pup-body-xl-700 text-neutral-black">
            {form.values.title || "New Bill"}
          </h3>
        </div>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-4">
            <CustomInput
              label="Name"
              inputProps={form.getInputProps("title")}
            />
            <CustomInput
              label="Category"
              inputProps={form.getInputProps("category")}
            />
            <CustomInput label="Task" />
            <MemberSelect
              data={members?.data ?? null}
              label="Paid by"
              selectedMember={form.values.paidBy ?? null}
              setSelectedMember={(member) =>
                form.setFieldValue("paidBy", member)
              }
              error={form.errors["paidBy"] as string | undefined}
            />

            <SimpleSelect
              label="Split Type"
              items={SPLIT_TYPE_ITEMS}
              value={form.values.splitType}
              onValueChange={(value) => {
                form.setFieldValue("splitType", value);
              }}
            />
            <CustomInput
              label="Total"
              inputProps={form.getInputProps("amount")}
              disabled={form.values.splitType === BillSplitType.AMOUNT}
            />
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
                    error={
                      form.errors[`split.${index}.member`] as string | undefined
                    }
                  />

                  {form.values.splitType !== BillSplitType.EQUAL && (
                    <CustomInput
                      type="number"
                      placeholder={
                        form.values.splitType === BillSplitType.PERCENTAGE
                          ? "Percent"
                          : "Amount"
                      }
                      inputProps={form.getInputProps(
                        form.values.splitType === BillSplitType.PERCENTAGE
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
              {form.errors.split && (
                <p className="text-red-500 pup-body-sm-400">
                  {form.errors.split}
                </p>
              )}
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
                isLoading={createBillMutation.isPending}
              />
              <SheetClose asChild>
                <OutlineButton
                  title="Close"
                  className="border-primary-orange text-primary-orange"
                />
              </SheetClose>
            </SheetFooter>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
