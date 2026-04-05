import { createFileRoute } from "@tanstack/react-router";
import { Spinner } from "@/components/ui/spinner";
import { Crown, Shield, Users, Calendar, Globe } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PrimaryButton } from "@/components/Button/primary-filled";
import { Navigation } from "@/components/Navigation";
import { useGetPublicPlan, useRequestToJoin } from "./-queries";
import { useAuth } from "@/auth/useAuth";
import { ProfileAvatar } from "@/components/PreviewImage";
import { RichTextParser } from "@/components/RichTextParser";

export const Route = createFileRoute("/public-plans/$planId/")({
  component: RouteComponent,
});

function roleIcon(role: "OWNER" | "ADMIN" | "MEMBER") {
  if (role === "OWNER")
    return <Crown size={12} className="text-primary-orange" />;
  if (role === "ADMIN") return <Shield size={12} className="text-blue-500" />;
  return null;
}

function roleOrder(role: "OWNER" | "ADMIN" | "MEMBER") {
  return role === "OWNER" ? 0 : role === "ADMIN" ? 1 : 2;
}

function RouteComponent() {
  const { planId } = Route.useParams();
  const { data: plan, isLoading, isError } = useGetPublicPlan(planId);
  const { isAuthenticated } = useAuth();
  const {
    mutate: requestToJoin,
    isPending,
    isSuccess,
    isError: isRequestError,
    reset,
  } = useRequestToJoin(planId);

  if (isLoading)
    return (
      <div className="flex justify-center mt-24">
        <Spinner />
      </div>
    );

  if (isError || !plan)
    return (
      <div className="flex flex-col items-center justify-center mt-24 gap-2">
        <p className="pup-body-md-400 text-neutral-grey">
          Plan not found or is private.
        </p>
      </div>
    );

  const sorted = [...plan.members].sort(
    (a, b) => roleOrder(a.role) - roleOrder(b.role),
  );
  const owner = sorted.find((m) => m.role === "OWNER");


  const canJoin =
    plan.config.acceptJoinRequest ||
    plan._count.members < plan.config.maxMembers;

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-16 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-100">
              Public
            </span>
          </div>
          <h1 className="pup-heading-two text-neutral-black">{plan.name}</h1>
          <div className="flex items-center gap-4 pup-body-sm-400 text-neutral-grey">
            {owner && <span>by {owner.user.name}</span>}
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {format(new Date(plan.createdAt), "MMM d, yyyy")}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Users size={13} />
              {plan._count.members}{" "}
              {plan.config ? `/ ${plan.config.maxMembers}` : ""} member
              {plan.members.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Cover */}
        {plan.coverImage ? (
          <img
            src={plan.coverImage}
            alt={plan.name}
            className="w-full object-cover rounded-2xl"
          />
        ) : (
          <div className="w-full h-48 rounded-2xl bg-neutral-100 flex items-center justify-center">
            <Globe size={40} className="text-neutral-300" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="mb-5 bg-white border border-off-white rounded-2xl p-6">
              <h2 className="pup-heading-three text-neutral-black mb-5">
                Description
              </h2>
              <RichTextParser
                html={plan.description || "This plan has no description"}
              />
            </div>

            {/* Join CTA */}
            <div className="bg-white border border-off-white rounded-2xl p-6 flex items-center justify-between gap-4">
              <div>
                <p className="pup-body-md-500 text-neutral-black">
                  Want to join this plan?
                </p>
                <p className="pup-body-sm-400 text-neutral-grey mt-0.5">
                  {!isAuthenticated
                    ? "Log in now and send a request to join."
                    : canJoin
                      ? "Send a request and wait for the owner to approve."
                      : "This plan is no longer accepting join requests."}
                </p>
              </div>
              {isAuthenticated && canJoin ? (
                <PrimaryButton
                  title={
                    isSuccess
                      ? "Request Sent"
                      : isError
                        ? "Retry Request"
                        : "Request to Join"
                  }
                  onClick={() => {
                    if (isRequestError) reset();
                    requestToJoin();
                  }}
                  isLoading={isPending}
                  disabled={isSuccess}
                  className={cn("shrink-0", isSuccess && "opacity-60")}
                />
              ) : (
                <PrimaryButton
                  disabled={!isAuthenticated}
                  title="Request to Join"
                />
              )}
            </div>
          </div>

          {/* Members */}
          <div className="bg-white border border-off-white rounded-2xl p-6 h-fit">
            <h2 className="pup-heading-three text-neutral-black mb-5">
              Members
            </h2>
            <div className="flex flex-col gap-3">
              {sorted.map((member) => (
                <div key={member.user.id} className="flex items-center gap-3">
                  <ProfileAvatar
                    src={member.user.profilePicture}
                    alt={member.user.name}
                  />
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <p className="pup-body-md-400 text-neutral-black truncate">
                      {member.user.name}
                    </p>
                    {roleIcon(member.role)}
                  </div>
                  <span className="pup-body-sm-400 text-neutral-grey capitalize">
                    {member.role.toLowerCase()}
                  </span>
                </div>
              ))}
              {plan._count.members - sorted.length > 0 && (
                <div className="pl-13 pup-body-sm-400 text-neutral-grey">
                  + {plan._count.members - sorted.length} others
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
