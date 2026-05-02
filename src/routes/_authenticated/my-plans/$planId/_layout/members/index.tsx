import { PrimaryButton } from "@/components/Button/primary-filled";
import { OutlineButton } from "@/components/Button/outline";
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
  useLeavePlan,
  useRemoveMember,
} from "./-queries";
import { cn } from "@/lib/utils";
import JoinRequestCard from "@/components/MemberCard/join-request-card";
import { toast } from "sonner";
import { router } from "@/main";
import { DeleteMemberDialog } from "@/components/Modals/delete-member";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$planId/_layout/members/",
)({
  component: RouteComponent,
});

type Tab = "members" | "requests";

function RouteComponent() {
  const { planId } = Route.useParams();
  const [addMemberModalIsOpen, setAddMemberModalIsOpen] = useState(false);
  const role = localStorage.getItem(`plan_role_${planId}`);
  const isOwner = role === "OWNER";
  const [activeTab, setActiveTab] = useState<Tab>("members");

  const { data: members, isLoading: membersLoading } = useGetMembers(planId);
  const {
    data: requests,
    isLoading: requestsLoading,
    error: requestsError,
  } = useGetPendingRequests(planId, isOwner);
  const isForbidden = (requestsError as any)?.response?.status === 403;
  const approveMutation = useApproveJoinRequest(planId);
  const rejectMutation = useRejectJoinRequest(planId);
  const leavePlanMutation = useLeavePlan(planId);
  const removeMemberMutation = useRemoveMember(planId);

  const [deleteMemberModalIsOpen, setDeleteMemberModalIsOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const isLoading =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    removeMemberMutation.isPending;

  const handleLeavePlan = () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave this plan?",
    );
    if (!confirmed) return;

    leavePlanMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("You left the plan");
        router.navigate({ to: "/my-plans" });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ?? "Failed to leave the plan",
        );
      },
    });
  };

  const handleRemoveMember = (id: string, name: string) => {
    setMemberToDelete({ id, name });
    setDeleteMemberModalIsOpen(true);
  };

  const confirmRemoveMember = () => {
    if (!memberToDelete) return;

    removeMemberMutation.mutate(memberToDelete.id, {
      onSuccess: () => {
        toast.success(`${memberToDelete.name} removed from plan`);
        setDeleteMemberModalIsOpen(false);
        setMemberToDelete(null);
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ?? "Failed to remove member",
        );
      },
    });
  };

  const tabs: { label: string; value: Tab }[] = [
    { label: "Members", value: "members" },
    ...(isOwner && !isForbidden
      ? [
        {
          label: `Requests${requests && requests.length > 0 ? ` (${requests.length})` : ""}`,
          value: "requests" as Tab,
        },
      ]
      : []),
  ];

  return (
    <>
      <AddMemberDialog
        open={addMemberModalIsOpen}
        onOpenChange={setAddMemberModalIsOpen}
        planId={planId}
      />
      <DeleteMemberDialog
        open={deleteMemberModalIsOpen}
        onOpenChange={setDeleteMemberModalIsOpen}
        onConfirm={confirmRemoveMember}
        memberName={memberToDelete?.name ?? ""}
        isLoading={removeMemberMutation.isPending}
      />
      <div className="flex justify-between content-center mb-6 py-4 sticky top-0 bg-white">
        <h1 className="pup-heading-three">Members</h1>
        <div className="flex gap-3">
          {!isOwner && (
            <OutlineButton
              title="Leave Plan"
              type="button"
              className="border-red-500 text-red-500 hover:bg-red-50"
              onClick={handleLeavePlan}
              isLoading={leavePlanMutation.isPending}
            />
          )}
          {isOwner && (
            <PrimaryButton
              title="Add Members"
              type="button"
              onClick={() => setAddMemberModalIsOpen(true)}
            />
          )}
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
                onRemove={
                  isOwner && member.role !== "OWNER"
                    ? (id) => handleRemoveMember(id, member.user.name)
                    : undefined
                }
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
