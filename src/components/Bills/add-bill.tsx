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
import { BillSplitType, useCreateBill, useUpdateBill, type Bill } from "./-queries";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "../CustomInput/useDebounce";
import { useGetFiles, type PlanFile } from "../Files/-queries";
import AddFile from "../Files/add-file";
import { Paperclip } from "lucide-react";
import AttachmentItem from "../Files/attachment-item";
import { SearchInput } from "../CustomInput/search-input";
import { Spinner } from "../ui/spinner";

export interface AddBillProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  onClose?: () => void;
  initialValues?: Partial<CreateBillForm> & { fileIds?: string[]; files?: PlanFile[] };
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
    fileIds: z.array(z.string()).optional(),
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
      fileIds: [],
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

  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);
  const [attachmentSearch, setAttachmentSearch] = useState("");
  const debouncedAttachmentSearch = useDebounce(attachmentSearch, 300);
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>(
    [],
  );
  const [attachmentMap, setAttachmentMap] = useState<Record<string, PlanFile>>(
    {},
  );
  const [attachmentsInitialized, setAttachmentsInitialized] = useState(false);

  const { data: members } = useGetMembers(planId);
  const isEditing = !!billId;

  const selectedMemberIds = new Set(
    form.values.split
      .map((s) => s.member?.value)
      .filter((v): v is string => !!v),
  );
  const createBillMutation = useCreateBill(planId);
  const updateBillMutation = useUpdateBill(planId);

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

  const addAttachment = (file: PlanFile) => {
    setAttachmentMap((prev) => ({ ...prev, [file.id]: file }));
    setSelectedAttachmentIds((prev) =>
      prev.includes(file.id) ? prev : [...prev, file.id],
    );
    form.setFieldValue("fileIds", [
      ...(form.values.fileIds || []),
      file.id,
    ]);
  };

  const removeAttachment = (fileId: string) => {
    setSelectedAttachmentIds((prev) => prev.filter((id) => id !== fileId));
    form.setFieldValue(
      "fileIds",
      (form.values.fileIds || []).filter((id) => id !== fileId),
    );
  };

  const selectedAttachments = selectedAttachmentIds
    .map((id) => attachmentMap[id])
    .filter(Boolean);

  const visibleSearchFiles =
    searchedFilesResponse?.data.filter(
      (file) => !selectedAttachmentIds.includes(file.id),
    ) ?? [];

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
        fileIds: selectedAttachmentIds,
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

      if (initialValues.files) {
        setAttachmentMap((prev) => {
          const next = { ...prev };
          initialValues.files?.forEach((file) => {
            next[file.id] = file;
          });
          return next;
        });
        setSelectedAttachmentIds(initialValues.files.map((file) => file.id));
        setAttachmentsInitialized(true);
      }
    } else if (open && !initialValues) {
      form.reset();
      setSelectedAttachmentIds([]);
      setAttachmentMap({});
      setAttachmentsInitialized(false);
    }
  }, [open, initialValues]);

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
      <AddFile
        open={isUploadFileOpen}
        onOpenChange={setIsUploadFileOpen}
        planId={planId}
        onUploaded={(uploadedFile) => {
          addAttachment(uploadedFile);
        }}
      />
      <SheetContent className="w-full sm:max-w-[50%] sm:min-w-[40%] px-6 sm:px-8 py-10 sm:py-12 overflow-scroll">
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
