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
import { useGetMembers } from "@/routes/_authenticated/my-plans/$planId/_layout/members/-queries";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { BillSplitType, useCreateBill, useUpdateBill } from "./-queries";
import { useEffect } from "react";
import { toast } from "sonner";

export interface AddBillProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  onClose?: () => void;
  initialValues?: Partial<CreateBillForm>;
  billId?: string;
}

const BillSplitTypeEnum = z.enum(BillSplitType);

const SPLIT_TYPE_ITEMS = [
  { value: BillSplitType.EQUAL, label: "Equal" },
  { value: BillSplitType.PERCENTAGE, label: "Percentage" },
  { value: BillSplitType.EXACT, label: "Amount" },
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
    paidBy: memberOptionSchema.optional(),
    split: z.array(billSplitSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const { splitType, split, paidBy } = data;

    if (!paidBy) {
      ctx.addIssue({
        path: ["paidBy"],
        message: "Member is required",
        code: "custom",
      });
    }

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
      // if (splitType === BillSplitType.EQUAL) {
      //   if (entry.amount != null || entry.percentage != null) {
      //     ctx.addIssue({
      //       path: ["split", index],
      //       message: "Equal split should not include amount or percentage",
      //       code: "custom",
      //     });
      //   }
      // }

      // percentage
      if (splitType === BillSplitType.PERCENTAGE) {
        if (entry.percentage == null) {
          ctx.addIssue({
            path: ["split", index, "percentage"],
            message: "Percentage is required",
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
      if (splitType === BillSplitType.EXACT) {
        if (entry.amount == null) {
          ctx.addIssue({
            path: ["split", index, "amount"],
            message: "Amount is required",
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
type CreateBillForm = z.infer<typeof createBillSchema>;

export default function AddBill({
  open,
  onOpenChange,
  planId,
  initialValues,
  billId,
  onClose,
}: AddBillProps) {
  const form = useForm<CreateBillForm>({
    initialValues: {
      planId,
      title: "",
      taskId: undefined,
      amount: 0,
      category: undefined,
      attachmentUrl: undefined,
      splitType: BillSplitType.EQUAL,
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

      const errors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      });

      return errors;
    },
  });

  const { data: members } = useGetMembers(planId);
  const isEditing = !!billId;

  const selectedMemberIds = new Set(
    form.values.split
      .map((s) => s.member?.value)
      .filter((v): v is string => !!v),
  );
  const createBillMutation = useCreateBill(planId);
  const updateBillMutation = useUpdateBill(planId);

  const onSubmit = form.onSubmit(
    (values) => {
      const payload = {
        planId: values.planId,
        taskId: values.taskId,
        title: values.title,
        amount: Number(values.amount),
        category: values.category || undefined,
        attachmentUrl: values.attachmentUrl || undefined,
        splitType: values.splitType,
        paidById: values.paidBy?.value,

        split: values.split.map((s) => ({
          userId: s.member!.value,
          amount: s.amount ? Number(s.amount) : undefined,
          percentage: s.percentage ? Number(s.percentage) : undefined,
        })),
      };

      if (isEditing && billId) {
        updateBillMutation.mutate(
          { billId, dto: payload },
          {
            onSuccess: () => {
              toast.success("Bill updated successfully");
              form.reset();
              onOpenChange(false);
              onClose?.();
            },
            onError: (data) => {
              toast.error(`Bill could not be updated: ${data.message}`);
            },
          },
        );
      } else {
        createBillMutation.mutate(payload, {
          onSuccess: () => {
            toast.success("Bill created successfully");
            form.reset();
            onOpenChange(false);
            onClose?.();
          },
          onError: (data) => {
            toast.error(`Bill could not be created: ${data.message}`);
          },
        });
      }
    },
    (errors) => {
      console.log("VALIDATION FAILED", errors);
    },
  );

  useEffect(() => {
    if (open && initialValues) {
      form.setValues(initialValues);
    } else if (open && !initialValues) {
      form.reset();
    }
  }, [open, initialValues]);

  useEffect(() => {
    if (form.values.splitType === BillSplitType.EXACT) {
      const total = form.values.split.reduce(
        (sum, s) => sum + (Number(s.amount) || 0),
        0,
      );
      if (form.values.amount !== total) {
        form.setFieldValue("amount", total);
      }
    }
  }, [form.values.split, form.values.splitType]);

  // Reset split amounts/percentages when splitType changes
  // useEffect(() => {
  //   if (!open || !initialValues) return;
  //   form.values.split.forEach((_, index) => {
  //     if (form.values.splitType === BillSplitType.EQUAL) {
  //       // Clear both amount and percentage for EQUAL
  //       form.setFieldValue(`split.${index}.amount`, undefined);
  //       form.setFieldValue(`split.${index}.percentage`, undefined);
  //     } else if (form.values.splitType === BillSplitType.PERCENTAGE) {
  //       // Clear amount for PERCENTAGE
  //       form.setFieldValue(`split.${index}.amount`, undefined);
  //     } else if (form.values.splitType === BillSplitType.EXACT) {
  //       // Clear percentage for EXACT
  //       form.setFieldValue(`split.${index}.percentage`, undefined);
  //     }
  //   });
  // }, [form.values.splitType]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-[50%] min-w-[40%] px-8 py-12 overflow-scroll">
        <div className="flex gap-3 items-center">
          <h3 className="pup-body-xl-700 text-neutral-black">
            {isEditing ? "Edit Bill" : "New Bill"}
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
            {/* <CustomInput label="Task" /> */}
            <MemberSelect
              data={members ?? null}
              label="Paid by"
              selectedMember={form.values.paidBy ?? null}
              setSelectedMember={(member) =>
                form.setFieldValue("paidBy", member ?? undefined)
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
              type="number"
              label="Total"
              inputProps={form.getInputProps("amount")}
              disabled={form.values.splitType === BillSplitType.EXACT}
            />
            <div>
              <label className="pup-body-md-500 block text-neutral-black mb-1.5">
                Split between
              </label>
              {form.values.split.map((_, index) => (
                <div key={index} className="flex gap-2 mb-1.5">
                  <MemberSelect
                    data={members ?? null}
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

                  {form.values.splitType !== BillSplitType.EQUAL &&
                    (form.values.splitType === BillSplitType.PERCENTAGE ? (
                      <CustomInput
                        type="number"
                        placeholder={"Percent"}
                        inputProps={form.getInputProps(
                          `split.${index}.percentage`,
                        )}
                      />
                    ) : (
                      <CustomInput
                        type="number"
                        placeholder={"Amount"}
                        inputProps={form.getInputProps(`split.${index}.amount`)}
                      />
                    ))}

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
                title={isEditing ? "Update Bill" : "Create Bill"}
                isLoading={
                  createBillMutation.isPending || updateBillMutation.isPending
                }
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
