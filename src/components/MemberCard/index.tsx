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
  type?: "lg" | "sm";
};

export default function MemberCard({
  id,
  name,
  email,
  profilePicture,
  role,
  isOwner = false,
  hasOptions = true,
  type = "lg",
  onRemove,
}: MemberCardProps & { onRemove?: (id: string) => void }) {
  // const roleLabel = isOwner ? "Owner" : role === "ADMIN" ? "Admin" : "Member";

  if (type === "lg")
    return (
      <div className="py-3 flex justify-between w-full border-b border-b-off-white">
        <div className="flex gap-4">
          <ProfileAvatar
            src={profilePicture}
            alt={name}
            className="w-14 h-14"
          />
          <div>
            <Link to={`/profile/${id}`}>
              <h3 className="pup-body-xl-400 text-neutral-black">
                {name}{" "}
                <span className="text-neutral-grey">
                  {isOwner && "(Owner)"}
                </span>
              </h3>
            </Link>
            <span className="pup-body-sm-400 text-neutral-grey">{email}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasOptions && !isOwner && onRemove && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <MdOutlineMoreVert size={24} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="text-red-400 pup-body-md-400 hover:cursor-pointer hover:text-red-400"
                  onClick={() => onRemove(id)}
                >
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );

  return (
    <div key={id} className="flex items-center gap-3">
      <ProfileAvatar src={profilePicture} alt={name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="pup-body-md-400 text-neutral-black truncate">{name}</p>
        </div>
        {role && (
          <p className="pup-body-sm-400 text-neutral-grey capitalize">
            {role.toLowerCase()}
          </p>
        )}
      </div>
    </div>
  );
}
