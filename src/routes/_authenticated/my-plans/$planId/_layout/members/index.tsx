import { PrimaryButton } from "@/components/Button/primary-filled";
import { AddMemberDialog } from "@/components/Modals/add-member";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGetMembers } from "./-queries";
import { Spinner } from "@/components/ui/spinner";
import MemberCard from "@/components/MemberCard";
import {
  useGetPendingRequests,
  useApproveJoinRequest,
  useRejectJoinRequest,
} from "./-queries";
import { cn } from "@/lib/utils";
import JoinRequestCard from "@/components/MemberCard/join-request-card";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$planId/_layout/members/",
)({
  component: RouteComponent,
});

type Tab = "members" | "requests";

function RouteComponent() {
  const { planId } = Route.useParams();
  const [addMemberModalIsOpen, setAddMemberModalIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("members");

  const { data: members, isLoading: membersLoading } = useGetMembers(planId);
  const { data: requests, isLoading: requestsLoading } =
    useGetPendingRequests(planId);
  const approveMutation = useApproveJoinRequest(planId);
  const rejectMutation = useRejectJoinRequest(planId);

  const isLoading = approveMutation.isPending || rejectMutation.isPending;

  const tabs: { label: string; value: Tab }[] = [
    { label: "Members", value: "members" },
    {
      label: `Requests${requests && requests.length > 0 ? ` (${requests.length})` : ""}`,
      value: "requests",
    },
  ];

  return (
    <>
      <AddMemberDialog
        open={addMemberModalIsOpen}
        onOpenChange={setAddMemberModalIsOpen}
        planId={planId}
      />
      <div className="flex justify-between content-center mb-6 py-4 sticky top-0 bg-white">
        <h1 className="pup-heading-three">Members</h1>
        <div className="flex gap-3">
          <PrimaryButton
            title="Add Members"
            type="button"
            onClick={() => setAddMemberModalIsOpen(true)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-off-white mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "pb-3 pup-body-md-400 transition-colors border-b-2 -mb-px",
              activeTab === tab.value
                ? "border-primary-orange text-primary-orange"
                : "border-transparent text-neutral-grey hover:text-neutral-black",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Members Tab */}
      {activeTab === "members" && (
        <div>
          {membersLoading ? (
            <Spinner />
          ) : members && members.length > 0 ? (
            members.map((member) => (
              <MemberCard
                key={member.user.id}
                id={member.user.id}
                name={member.user.name}
                email={member.user.email}
                profilePicture={member.user.profilePicture}
                role={member.role}
                isOwner={member.role === "OWNER"}
              />
            ))
          ) : (
            <p className="pup-body-md-400 text-neutral-grey">
              No members found.
            </p>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <div>
          {requestsLoading ? (
            <Spinner />
          ) : requests && requests.length > 0 ? (
            requests.map((request) => (
              <JoinRequestCard
                key={request.id}
                id={request.id}
                name={request.user.name}
                email={request.user.email}
                isLoading={isLoading}
                onApprove={(id) => approveMutation.mutate(id)}
                onReject={(id) => rejectMutation.mutate(id)}
              />
            ))
          ) : (
            <p className="pup-body-md-400 text-neutral-grey">
              No pending requests.
            </p>
          )}
        </div>
      )}
    </>
  );
}
