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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useState } from "react";
import { Button } from "../ui/button";

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

export default function MemberSelect() {
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
