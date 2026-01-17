"use client";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
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
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useForm } from "@mantine/form";
import { DatePicker } from "../DatePicker";
import TextEditor from "../TextEditor";
import MemberSelect from "../MemberSelect";

const schema = z.object({
  name: z
    .string()
    .refine((val) => val.trim().length > 0, { message: "Name is required" })
    .refine((val) => val.trim().length >= 2, { message: "Name too short" })
    .default(""),
});
type AddTaskForm = z.infer<typeof schema>;

export default function TaskDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [content, setContent] = useState("<p></p>");
  const { getInputProps, values } = useForm<AddTaskForm>({
    validate: zod4Resolver(schema),
    validateInputOnBlur: true,
  });
  const [date, setDate] = useState<string | undefined>(() => {
    const now = new Date();
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(now);
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-[50%] min-w-[40%] px-8 py-12 overflow-scroll">
        <div className="flex gap-3 items-center">
          <h3 className="pup-body-xl-700 text-neutral-black">
            {values.name ? values.name : "New Task"}
          </h3>
          <span>•</span>
          <span className="pup-body-xl-400 text-neutral-grey">{date}</span>
        </div>
        <CustomInput label="Task Name" inputProps={getInputProps("name")} />
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
          <TextEditor content={content} setContent={setContent} />
        </div>
        <MemberSelect />
        <SheetFooter>
          <PrimaryButton type="submit" title="Save changes" />
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
