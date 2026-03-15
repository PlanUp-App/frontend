import { MdOutlineMoreVert } from "react-icons/md";
import { ProfileAvatar } from "../PreviewImage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { PlanRole } from "@/routes/_authenticated/my-plans/$planId/_layout/members/-queries";
import { Link } from "@tanstack/react-router";

type MemberCardProps = {
  id: string;
  name: string;
  email?: string;
  profilePicture?: string | null;
  role?: PlanRole;
  isOwner?: boolean;
  hasOptions?: boolean;
};

export default function MemberCard({
  id,
  name,
  email,
  profilePicture,
  role,
  isOwner = false,
  hasOptions = true,
}: MemberCardProps) {
  // const roleLabel = isOwner ? "Owner" : role === "ADMIN" ? "Admin" : "Member";

  return (
    <div className="py-3 flex justify-between w-full border-b border-b-off-white">
      <div className="flex gap-4">
        <ProfileAvatar src={profilePicture} alt={name} className="w-14 h-14" />
        <div>
          <Link to={`/profile/${id}`}>
            <h3 className="pup-body-xl-400 text-neutral-black">
              {name}{" "}
              <span className="text-neutral-grey">{isOwner && "(Owner)"}</span>
            </h3>
          </Link>
          <span className="pup-body-sm-400 text-neutral-grey">{email}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {hasOptions && !isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MdOutlineMoreVert size={24} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className="text-red-400 pup-body-md-400 hover:cursor-pointer hover:text-red-400">
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
