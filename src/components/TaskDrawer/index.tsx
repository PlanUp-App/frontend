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
import { useCreateTask } from "./-queries";
import { toast } from "sonner";

const schema = z.object({
  name: z
    .string()
    .refine((val) => val.trim().length > 0, { message: "Name is required" })
    .refine((val) => val.trim().length >= 2, { message: "Name too short" })
    .default(""),
});

const dateFormat = (date: string) => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export default function TaskDrawer({
  open,
  onOpenChange,
  planId,
  phaseId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  phaseId: string;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("<p></p>");
  const [assignee, setAssignee] = useState<MemberOption | null>(null);
  const [errors, setErrors] = useState<string>("");

  const { data, isLoading } = useGetMembers(planId);
  const [date, setDate] = useState<string>(() => {
    const now = new Date();
    return dateFormat(now.toISOString());
  });

  const createTaskMutation = useCreateTask(planId, phaseId);

  const handleSubmit = () => {
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
      createTaskMutation.mutate(
        {
          name: name,
          dueDate: date,
          assigneeId: assignee?.value,
          description,
        },
        {
          onSuccess: () => {
            toast.success(`Task created successfully`);
            setName("");
            setErrors("");
            setAssignee(null);
            onOpenChange(false);
          },
          onError: (data) => {
            toast.error(`Task could not be created: ${data.message}`);
          },
        },
      );
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
