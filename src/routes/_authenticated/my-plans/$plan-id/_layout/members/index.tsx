import { PrimaryButton } from "@/components/Button/primary-filled";
import { AddMemberDialog } from "@/components/Modals/add-member";
import { ProfileAvatar } from "@/components/PreviewImage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MdOutlineMoreVert } from "react-icons/md";
import { useGetMembers } from "./-queries";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$plan-id/_layout/members/"
)({
  component: RouteComponent,
});

type MemberCardProps = {
  id: string;
  name: string;
  email: string;
  profilePicture?: string | null;
  isOwner?: boolean;
};

function MemberCard({
  id,
  name,
  email,
  profilePicture,
  isOwner = false,
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
    </div>
  );
}

function RouteComponent() {
  const { "plan-id": planId } = Route.useParams();
  const [addMemberModalIsOpen, setAddMemberModalIsOpen] = useState(false);
  const { data, isLoading } = useGetMembers(planId);
  console.log();
  return (
    <>
      <AddMemberDialog
        open={addMemberModalIsOpen}
        onOpenChange={setAddMemberModalIsOpen}
        planId={planId}
      />
      <div className="flex justify-between mb-12">
        <h1 className="pup-heading-three">Members</h1>
        <div className="flex gap-3">
          <PrimaryButton
            title="Add Members"
            type="button"
            onClick={() => setAddMemberModalIsOpen(true)}
          />
        </div>
      </div>
      <div>
        {isLoading ? (
          <Spinner />
        ) : data ? (
          <>
            <MemberCard
              id={data?.data.owner.id}
              name={data?.data.owner.name}
              email={data?.data.owner.email}
              profilePicture={data?.data.owner.profilePicture}
              isOwner
            />
            {data.data.members.length > 0 &&
              data.data.members.map((member) => {
                return (
                  <MemberCard
                    id={member.user.id}
                    name={member.user.name}
                    email={member.user.email}
                    profilePicture={member.user.profilePicture}
                    key={member.user.id}
                  />
                );
              })}
          </>
        ) : (
          <p>Something went wrong.</p>
        )}
      </div>
    </>
  );
}
