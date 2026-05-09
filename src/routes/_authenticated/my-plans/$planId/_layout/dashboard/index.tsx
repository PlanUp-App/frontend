import { createFileRoute, Link } from "@tanstack/react-router";
import { Spinner } from "@/components/ui/spinner";
import {
  CheckCircle2,
  Circle,
  Users,
  Clock,
  Receipt,
  ArrowRight,
  Crown,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { ProfileAvatar } from "@/components/PreviewImage";
import { useGetPlanDashboard } from "./-queries";
import { StatCard } from "@/components/StatCard";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$planId/_layout/dashboard/",
)({
  component: RouteComponent,
});

function formatDueDate(date: string | null) {
  if (!date) return null;
  const d = new Date(date);
  if (isPast(d) && !isToday(d))
    return { label: "Overdue", className: "text-red-500" };
  if (isToday(d)) return { label: "Today", className: "text-primary-orange" };
  if (isTomorrow(d)) return { label: "Tomorrow", className: "text-amber-500" };
  return { label: format(d, "MMM d"), className: "text-neutral-400" };
}

function roleIcon(role: "OWNER" | "ADMIN" | "MEMBER") {
  if (role === "OWNER")
    return <Crown size={11} className="text-primary-orange" />;
  if (role === "ADMIN") return <Shield size={11} className="text-blue-500" />;
  return null;
}

function RouteComponent() {
  const { planId } = Route.useParams();
  const { data, isLoading } = useGetPlanDashboard(planId);

  if (isLoading)
    return (
      <div className="flex justify-center mt-24">
        <Spinner />
      </div>
    );

  if (!data) return null;

  const { stats, members, upcomingTasks, recentBills } = data;
  const completionPct =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-8 pb-24">
      <h1 className="pup-heading-three text-2xl md:text-3xl">Welcome to {data.plan.name}</h1>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Members"
          value={stats.memberCount}
          icon={<Users size={20} className="text-blue-500" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Tasks Complete"
          value={`${stats.completedTasks} / ${stats.totalTasks}`}
          icon={<CheckCircle2 size={20} className="text-green-500" />}
          iconBg="bg-green-50"
        />
        <StatCard
          label="Pending Tasks"
          value={stats.pendingTasks}
          icon={<Clock size={20} className="text-amber-500" />}
          iconBg="bg-amber-50"
        />
        <StatCard
          label="Total Plan Expense"
          value={`Rs. ${stats.totalExpense.toFixed(2)}`}
          icon={<Receipt size={20} className="text-red-400" />}
          iconBg="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Progress bar */}
          <div className="bg-white border border-off-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="pup-heading-three text-neutral-black">
                Overall Progress
              </h2>
              <span className="pup-body-sm-400 text-neutral-grey">
                {completionPct}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-orange rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-neutral-300">
                {stats.completedTasks} completed
              </span>
              <span className="text-xs text-neutral-300">
                {stats.pendingTasks} remaining
              </span>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white border border-off-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="pup-heading-three text-neutral-black">
                Upcoming Tasks
              </h2>
              <Link
                to={`/my-plans/${planId}/phases`}
                className="flex items-center gap-1 pup-body-sm-400 text-primary-orange hover:opacity-70 transition-opacity"
              >
                View phases <ArrowRight size={14} />
              </Link>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 size={28} className="text-neutral-200 mb-2" />
                <p className="pup-body-md-400 text-neutral-grey">
                  No upcoming tasks.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {upcomingTasks.map((task) => {
                  const due = formatDueDate(task.dueDate);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-neutral-50 transition-colors"
                    >
                      {task.isComplete ? (
                        <CheckCircle2
                          size={17}
                          className="text-green-500 shrink-0"
                        />
                      ) : (
                        <Circle
                          size={17}
                          className="text-neutral-300 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "pup-body-md-400 text-neutral-black truncate",
                            task.isComplete && "line-through text-neutral-grey",
                          )}
                        >
                          {task.name}
                        </p>
                        {task.phase && (
                          <p className="pup-body-sm-400 text-neutral-grey truncate">
                            {task.phase.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {task.assignee && (
                          <ProfileAvatar
                            src={task.assignee.profilePicture}
                            alt={task.assignee.name}
                            size="sm"
                          />
                        )}
                        {due && (
                          <span
                            className={cn("pup-body-sm-400", due.className)}
                          >
                            {due.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Bills */}
          <div className="bg-white border border-off-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="pup-heading-three text-neutral-black">
                Recent Bills
              </h2>
              <Link
                to={`/my-plans/${planId}/bills`}
                className="flex items-center gap-1 pup-body-sm-400 text-primary-orange hover:opacity-70 transition-opacity"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {recentBills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Receipt size={28} className="text-neutral-200 mb-2" />
                <p className="pup-body-md-400 text-neutral-grey">
                  No bills yet.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {recentBills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-neutral-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-neutral-50 border border-off-white flex items-center justify-center shrink-0">
                      <Receipt size={15} className="text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="pup-body-md-400 text-neutral-black truncate">
                        {bill.title}
                      </p>
                      <p className="pup-body-sm-400 text-neutral-grey truncate">
                        Added by {bill.createdBy.name}
                        {bill.category ? ` · ${bill.category}` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="pup-body-md-400 text-neutral-black">
                        Rs. {bill.amount.toFixed(2)}
                      </p>
                      <p
                        className={cn(
                          "pup-body-sm-400",
                          bill.isSettled ? "text-green-500" : "text-red-400",
                        )}
                      >
                        {bill.isSettled ? "Settled" : "Unsettled"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Members */}
        <div className="bg-white border border-off-white rounded-2xl p-6 h-fit">
          <div className="flex items-center justify-between mb-5">
            <h2 className="pup-heading-three text-neutral-black">Members</h2>
            <Link
              to={`/my-plans/${planId}/members`}
              className="flex items-center gap-1 pup-body-sm-400 text-primary-orange hover:opacity-70 transition-opacity"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <ProfileAvatar
                  src={member.user.profilePicture}
                  alt={member.user.name}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="pup-body-md-400 text-neutral-black truncate">
                      {member.user.name}
                    </p>
                    {roleIcon(member.role)}
                  </div>
                  <p className="pup-body-sm-400 text-neutral-grey capitalize">
                    {member.role.toLowerCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
