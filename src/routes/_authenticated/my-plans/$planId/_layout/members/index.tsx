import { PrimaryButton } from "@/components/Button/primary-filled";
import { AddMemberDialog } from "@/components/Modals/add-member";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGetMembers } from "./-queries";
import { Spinner } from "@/components/ui/spinner";
import MemberCard from "@/components/MemberCard";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$planId/_layout/members/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { planId: planId } = Route.useParams();
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
      <div className="flex justify-between content-center mb-12 py-4 sticky top-0 bg-white">
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
