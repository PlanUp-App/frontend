"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { useState } from "react";
import { PrimaryButton } from "../Button/primary-filled";
import { OutlineButton } from "../Button/outline";
import { CustomInput } from "../CustomInput/input";
import z from "zod";
import { DatePicker } from "../DatePicker";
import TextEditor from "../TextEditor";
import MemberSelect, { type MemberOption } from "../MemberSelect";
import { useGetMembers } from "@/routes/_authenticated/my-plans/$plan-id/_layout/members/-queries";
import { Spinner } from "../ui/spinner";
import { useCreateTask, useUpdateTask } from "./-queries";
import { toast } from "sonner";
import { queryClient } from "@/utils/queryclient/queryClient";
import { dateFormat } from "@/lib/utils";

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

  const handleSubmit = () => {
    const payload = {
      name,
      description,
      dueDate: date,
      assigneeId: assignee?.value,
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
            setName("");
            setErrors("");
            setAssignee(null);
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-[50%] min-w-[40%] px-8 py-12 overflow-scroll">
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
            onChange: (e) => setName(e.target.value),
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
            data={data?.data ?? null}
            label="Assignee"
            selectedMember={assignee}
            setSelectedMember={setAssignee}
          />
        )}
        <SheetFooter>
          <PrimaryButton
            type="submit"
            title="Save changes"
            onClick={handleSubmit}
            isLoading={createTaskMutation.isPending}
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
