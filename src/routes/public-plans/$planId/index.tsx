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
import { Footer } from "@/components/Footer";

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
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center">
        <Spinner className="w-12 h-12 text-orange-500" />
        <p className="mt-4 text-neutral-500 animate-pulse">Fetching plan details...</p>
      </div>
    );

  if (isError || !plan)
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <Globe size={40} className="text-rose-300" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Plan not found</h2>
        <p className="text-neutral-500 mb-8 max-w-sm">
          This plan may have been removed or set to private by its owner.
        </p>
        <PrimaryButton title="Back to Directory" link="/public-plans" className="rounded-full px-8" />
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
      <div className="min-h-screen bg-neutral-50 font-sans pb-24">
        {/* HERO SECTION */}
        <div className="relative h-[400px] lg:h-[500px] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={plan.coverImage || "placeholder.png"}
              alt={plan.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
          </div>

          <div className="container relative z-10 mx-auto px-6 lg:px-16 h-full flex flex-col justify-end pb-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-4 py-1 rounded-full bg-orange-500 text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-orange-500/30">
                Public Activity
              </span>
              <span className="px-4 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                {plan.config.maxMembers - plan._count.members} Slots Left
              </span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl">
              {plan.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-neutral-300">
              {owner && (
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                  <ProfileAvatar src={owner.user.profilePicture} alt={owner.user.name} className="w-8 h-8 ring-2 ring-orange-500/50" />
                  <div className="text-sm">
                    <p className="text-white font-medium leading-none mb-1">{owner.user.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400">Host</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-orange-400" />
                <span className="text-sm font-medium">{format(new Date(plan.createdAt), "MMMM d, yyyy")}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users size={18} className="text-orange-400" />
                <span className="text-sm font-medium">{plan._count.members} / {plan.config.maxMembers} Members</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="container mx-auto px-6 lg:px-16 mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* LEFT COLUMN: DESCRIPTION */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-neutral-100 transition-all duration-300 hover:shadow-xl hover:shadow-neutral-200/50">
                <h2 className="text-2xl font-bold text-neutral-900 mb-8">About this Plan</h2>
                <div className="prose prose-orange max-w-none">
                  <RichTextParser html={plan.description || "This plan has no description"} />
                </div>
              </div>

              {/* JOIN CTA */}
              <div className="relative rounded-[2rem] overflow-hidden p-10 bg-neutral-900 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-[100px] rounded-full -mr-20 -mt-20" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="max-w-md">
                    <h3 className="text-3xl font-bold mb-4">Want to participate?</h3>
                    <p className="text-neutral-400 font-light leading-relaxed">
                      {!isAuthenticated
                        ? "Join our community today to send a request and start collaborating on this activity."
                        : plan.userStatus === "MEMBER"
                          ? "You are already a member of this plan. Collaborate with your team in the dashboard."
                          : plan.userStatus === "PENDING"
                            ? "Your request to join this plan is currently pending approval from the host."
                            : canJoin
                              ? "Send a request to the host and wait for their approval to join the team."
                              : "This activity is currently full, but stay tuned for future openings!"}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {!isAuthenticated ? (
                      <PrimaryButton
                        title="Sign Up to Join"
                        link="/sign-up"
                        className="px-10 py-5 rounded-full text-lg shadow-xl bg-orange-500 hover:bg-orange-600 shadow-orange-500/30"
                      />
                    ) : plan.userStatus === "MEMBER" ? (
                      <PrimaryButton
                        title="Go to Dashboard"
                        link={`/my-plans/${plan.id}/dashboard`}
                        className="px-10 py-5 rounded-full text-lg shadow-xl bg-neutral-100 text-neutral-900 hover:bg-neutral-200 shadow-neutral-200/50"
                      />
                    ) : plan.userStatus === "PENDING" ? (
                      <PrimaryButton
                        title="Request Pending"
                        disabled
                        className="px-10 py-5 rounded-full text-lg opacity-80"
                      />
                    ) : canJoin ? (
                      <PrimaryButton
                        title={
                          isSuccess
                            ? "Request Sent Successfully"
                            : isError
                              ? "Try Again"
                              : "Request to Join"
                        }
                        onClick={() => {
                          if (isRequestError) reset();
                          requestToJoin();
                        }}
                        isLoading={isPending}
                        disabled={isSuccess}
                        className={cn(
                          "px-10 py-5 rounded-full text-lg shadow-xl transition-all duration-300",
                          isSuccess
                            ? ""
                            : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/30",
                        )}
                      />
                    ) : (
                      <PrimaryButton
                        disabled
                        title="Activity Full"
                        className="px-10 py-5 rounded-full text-lg opacity-80"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: MEMBERS */}
            <div className="space-y-8">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100 sticky top-24">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-neutral-900">Team Members</h2>
                  <span className="px-3 py-1 rounded-full bg-neutral-50 text-neutral-500 text-xs font-bold">
                    {plan._count.members} Total
                  </span>
                </div>

                <div className="space-y-5">
                  {sorted.map((member) => (
                    <div key={member.user.id} className="group flex items-center gap-4 p-2 rounded-2xl hover:bg-neutral-50 transition-colors duration-200">
                      <div className="relative">
                        <ProfileAvatar
                          src={member.user.profilePicture}
                          alt={member.user.name}
                          className="w-12 h-12 ring-2 ring-transparent group-hover:ring-orange-500/20 transition-all"
                        />
                        <div className="absolute -bottom-1 -right-1">
                          {roleIcon(member.role) && (
                            <div className="bg-white p-1 rounded-full shadow-sm border border-neutral-100">
                              {roleIcon(member.role)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-neutral-900 truncate group-hover:text-orange-500 transition-colors">
                          {member.user.name}
                        </p>
                        <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium">
                          {member.role.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  ))}

                  {plan._count.members - sorted.length > 0 && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 text-neutral-500 text-sm font-medium">
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center">
                        <Users size={16} />
                      </div>
                      <span>+ {plan._count.members - sorted.length} more contributors</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
