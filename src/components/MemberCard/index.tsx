import { MdOutlineMoreVert } from "react-icons/md";
import { ProfileAvatar } from "../PreviewImage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type MemberCardProps = {
  id: string;
  name: string;
  email?: string;
  profilePicture?: string | null;
  isOwner?: boolean;
  hasOptions?: boolean;
};

export default function MemberCard({
  id,
  name,
  email,
  profilePicture,
  isOwner = false,
  hasOptions = true,
}: MemberCardProps) {
  return (
    <div className="py-3 flex justify-between w-full border-b border-b-off-white">
      <div className="flex gap-4">
        <ProfileAvatar src={profilePicture} alt={name} className="w-14 h-14" />
        <div>
          <h3 className="pup-body-xl-400 text-neutral-black">{`${name}${isOwner ? " (Owner)" : ""}`}</h3>
          <span className="pup-body-sm-400 text-neutral-grey">{email}</span>
        </div>
      </div>
      {hasOptions && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MdOutlineMoreVert size={24} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="text-red-400 pup-body-md-400 hover:cursor-pointer hover:text-red-400"
              // onClick={() => onClick(id)}
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
