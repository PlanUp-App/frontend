"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Command,
} from "cmdk";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineCheck,
  MdOutlinePersonOutline,
} from "react-icons/md";
import { PrimaryButton } from "../Button/primary-filled";
import { OutlineButton } from "../Button/outline";
import { CustomInput } from "../CustomInput/input";
import z from "zod";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useForm } from "@mantine/form";
import { DatePicker } from "../DatePicker";

const members = [
  {
    value: "Shlok Dhital",
    label: "Shlok Dhital",
  },
  {
    value: "Test User",
    label: "Test user",
  },
];

function MemberSelect() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <div className="w-full">
      <label className="pup-body-md-500 block text-neutral-black mb-1.5">
        Assignee
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between ${value ? "text-neutral-black" : "text-neutral-grey"} px-3.5 py-2.5 radius-[8px]`}
          >
            <span className="flex gap-1 items-center">
              <MdOutlinePersonOutline className="size-5" />
              <span className="pup-body-md-400">
                {value
                  ? members.find((member) => member.value === value)?.label
                  : "Select team member"}
              </span>
            </span>
            <MdOutlineKeyboardArrowDown className="text-neutral-grey" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="min-w-full px-4 py-2">
          <Command>
            <CommandInput
              placeholder="Search member..."
              className="h-9 mb-2 w-full px-2"
            />
            <CommandList>
              <CommandEmpty>No member found.</CommandEmpty>
              <CommandGroup>
                {members.map((member) => (
                  <CommandItem
                    className="flex px-2 justify-center h-9 items-center cursor-pointer hover:bg-off-white mb-2"
                    key={member.value}
                    value={member.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {member.label}
                    <MdOutlineCheck
                      className={cn(
                        "ml-auto",
                        value === member.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const schema = z.object({
  name: z.string().nonempty("Name is required").min(2, "Name too short"),
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
  const { getInputProps, onSubmit, values, setValues } = useForm<AddTaskForm>({
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
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-[50%] min-w-[40%] px-8 py-12">
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
          <EditorContent editor={editor} className="border p-2 rounded" />
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
