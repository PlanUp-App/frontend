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
import { ProfileAvatar } from "../PreviewImage";
import type { Members } from "@/routes/_authenticated/my-plans/$plan-id/_layout/members/-queries";

export interface MemberOption {
  value: string;
  label: string;
  email?: string;
  profilePicture?: string | null;
}

const transformMembers = (data: Members | null): MemberOption[] => {
  if (data === null || !data) return [];

  const owner: MemberOption = {
    value: data.owner.id,
    label: data.owner.name,
    email: data.owner.email,
    profilePicture: data.owner.profilePicture,
  };

  const members: MemberOption[] = data.members.map((m) => ({
    value: m.user.id,
    label: m.user.name,
    email: m.user.email,
    profilePicture: m.user.profilePicture,
  }));

  return [owner, ...members];
};

interface MemberSelectProps {
  data: Members | null;
  selectedMember: MemberOption | null;
  setSelectedMember: (member: MemberOption | null) => void;
}

export default function MemberSelect({
  data,
  selectedMember,
  setSelectedMember,
}: MemberSelectProps) {
  const [open, setOpen] = useState(false);
  const members = transformMembers(data);

  const [searchQuery, setSearchQuery] = useState("");
  const filteredMembers = members.filter(
    (member) =>
      member.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  console.log(filteredMembers);
  return (
    <div className="w-full">
      <label className="pup-body-md-500 block text-neutral-black mb-1.5">
        Assignee
      </label>
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full pup-body-md-400 justify-between h-12 cursor-pointer ${selectedMember?.value ? "text-neutral-black" : "text-neutral-grey"} px-3.5 py-2.5 radius-[8px]`}
          >
            <span className="flex gap-1 items-center">
              {selectedMember?.value ? (
                <div className="flex items-center gap-2">
                  <ProfileAvatar
                    src={selectedMember.profilePicture}
                    alt={selectedMember.label}
                  />
                  {selectedMember.label}
                </div>
              ) : (
                <>
                  <MdOutlinePersonOutline className="size-5" />
                  <span className="pup-body-md-400">
                    {selectedMember?.value
                      ? selectedMember.label
                      : "Select team member"}
                  </span>
                </>
              )}
            </span>
            <MdOutlineKeyboardArrowDown className="text-neutral-grey" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="py-2 px-2">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search member..."
              className="h-9 mb-2 w-full rounded-[8px] px-2 border border-neutral-light-grey"
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList
              className="max-h-64 overflow-auto"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <CommandEmpty>No member found.</CommandEmpty>
              <CommandGroup>
                {filteredMembers.map((member) => (
                  <CommandItem
                    className="flex px-2 py-2 justify-center items-center cursor-pointer hover:bg-off-white mb-2"
                    key={member.value}
                    value={member.value}
                    onSelect={() => {
                      setSelectedMember(
                        selectedMember?.value !== member.value ? member : null,
                      );
                      setOpen(false);
                    }}
                  >
                    <ProfileAvatar
                      src={member.profilePicture}
                      alt={member.label}
                      className="mr-2"
                    />
                    {member.label}
                    <MdOutlineCheck
                      className={cn(
                        "ml-auto",
                        selectedMember?.value === member.value
                          ? "opacity-100"
                          : "opacity-0",
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
