import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios/axiosInstance";
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

export const Route = createFileRoute(
  "/_authenticated/my-plans/$planId/_layout/dashboard/",
)({
  component: RouteComponent,
});

// ── Types ─────────────────────────────────────────────────────────────────────

type PlanDashboard = {
  stats: {
    memberCount: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    totalBills: number;
    unpaidAmount: number;
  };
  members: {
    id: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    joinedAt: string;
    user: {
      id: string;
      name: string;
      profilePicture: string | null;
    };
  }[];
  recentTasks: {
    id: string;
    name: string;
    dueDate: string | null;
    completed: boolean;
    phase: { id: string; name: string } | null;
    assignee: {
      id: string;
      name: string;
      profilePicture: string | null;
    } | null;
  }[];
  recentBills: {
    id: string;
    title: string;
    amount: number;
    category: string | null;
    paidAt: string | null;
    createdBy: { id: string; name: string };
    paidBy: { id: string; name: string } | null;
  }[];
};

const DUMMY_DASHBOARD: PlanDashboard = {
  stats: {
    memberCount: 6,
    totalTasks: 24,
    completedTasks: 14,
    pendingTasks: 10,
    totalBills: 8,
    unpaidAmount: 142.5,
  },
  members: [
    {
      id: "m1",
      role: "OWNER",
      joinedAt: "2025-01-01T00:00:00Z",
      user: { id: "u1", name: "Shlok Dhital", profilePicture: null },
    },
    {
      id: "m2",
      role: "ADMIN",
      joinedAt: "2025-01-02T00:00:00Z",
      user: { id: "u2", name: "Rina Maharjan", profilePicture: null },
    },
    {
      id: "m3",
      role: "MEMBER",
      joinedAt: "2025-01-03T00:00:00Z",
      user: { id: "u3", name: "Arjun Thapa", profilePicture: null },
    },
    {
      id: "m4",
      role: "MEMBER",
      joinedAt: "2025-01-04T00:00:00Z",
      user: { id: "u4", name: "Priya Shrestha", profilePicture: null },
    },
    {
      id: "m5",
      role: "MEMBER",
      joinedAt: "2025-01-05T00:00:00Z",
      user: { id: "u5", name: "Dev Karki", profilePicture: null },
    },
    {
      id: "m6",
      role: "MEMBER",
      joinedAt: "2025-01-06T00:00:00Z",
      user: { id: "u6", name: "Meera Lama", profilePicture: null },
    },
  ],
  recentTasks: [
    {
      id: "t1",
      name: "Book venue for the trip",
      dueDate: new Date().toISOString(),
      completed: false,
      phase: { id: "p1", name: "Planning" },
      assignee: { id: "u1", name: "Shlok Dhital", profilePicture: null },
    },
    {
      id: "t2",
      name: "Confirm headcount",
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      completed: false,
      phase: { id: "p1", name: "Planning" },
      assignee: { id: "u2", name: "Rina Maharjan", profilePicture: null },
    },
    {
      id: "t3",
      name: "Create packing list",
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      completed: true,
      phase: { id: "p1", name: "Planning" },
      assignee: { id: "u3", name: "Arjun Thapa", profilePicture: null },
    },
    {
      id: "t4",
      name: "Research accommodation options",
      dueDate: new Date(Date.now() - 86400000).toISOString(),
      completed: false,
      phase: { id: "p2", name: "Research" },
      assignee: { id: "u4", name: "Priya Shrestha", profilePicture: null },
    },
    {
      id: "t5",
      name: "Set budget per person",
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      completed: true,
      phase: { id: "p2", name: "Research" },
      assignee: null,
    },
    {
      id: "t6",
      name: "Book transport",
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      completed: false,
      phase: { id: "p3", name: "Booking" },
      assignee: { id: "u5", name: "Dev Karki", profilePicture: null },
    },
  ],
  recentBills: [
    {
      id: "b1",
      title: "Hotel deposit",
      amount: 80.0,
      category: "Accommodation",
      paidAt: null,
      createdBy: { id: "u1", name: "Shlok Dhital" },
      paidBy: null,
    },
    {
      id: "b2",
      title: "Bus tickets",
      amount: 45.0,
      category: "Transport",
      paidAt: new Date().toISOString(),
      createdBy: { id: "u2", name: "Rina Maharjan" },
      paidBy: { id: "u2", name: "Rina Maharjan" },
    },
    {
      id: "b3",
      title: "Group dinner",
      amount: 62.5,
      category: "Food",
      paidAt: null,
      createdBy: { id: "u3", name: "Arjun Thapa" },
      paidBy: null,
    },
    {
      id: "b4",
      title: "Activity passes",
      amount: 120.0,
      category: "Activities",
      paidAt: new Date().toISOString(),
      createdBy: { id: "u1", name: "Shlok Dhital" },
      paidBy: { id: "u1", name: "Shlok Dhital" },
    },
  ],
};

// ── Hook ──────────────────────────────────────────────────────────────────────

const useGetPlanDashboard = (planId: string) => {
  return useQuery<PlanDashboard>({
    queryKey: ["plan-dashboard", planId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/plans/${planId}/dashboard`);
      return res.data;
    },
    enabled: !!planId,
  });
};

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function Avatar({
  src,
  name,
  size = "sm",
}: {
  src: string | null;
  name: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return src ? (
    <img
      src={src}
      alt={name}
      className={cn("rounded-full object-cover shrink-0", dim)}
    />
  ) : (
    <div
      className={cn(
        "rounded-full bg-orange-100 text-primary-orange font-medium flex items-center justify-center shrink-0",
        dim,
      )}
    >
      {name[0].toUpperCase()}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-off-white rounded-2xl p-5 flex gap-4">
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
          iconBg,
        )}
      >
        {icon}
      </div>
      <div>
        <p className="pup-heading-three text-neutral-black leading-none mb-1">
          {value}
        </p>
        <p className="pup-body-sm-400 text-neutral-grey">{label}</p>
        {sub && <p className="text-xs text-neutral-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

function RouteComponent() {
  const { planId } = Route.useParams();
  const data = DUMMY_DASHBOARD;
  const isLoading = false;
  // const { data, isLoading } = useGetPlanDashboard(planId);

  if (isLoading)
    return (
      <div className="flex justify-center mt-24">
        <Spinner />
      </div>
    );

  if (!data) return null;

  const { stats, members, recentTasks, recentBills } = data;
  const completionPct =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-8 pb-24">
      <div className="flex justify-between mb-12 items-center">
        <h1 className="pup-heading-three">New Plan Created</h1>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          sub={`${completionPct}% done`}
        />
        <StatCard
          label="Pending Tasks"
          value={stats.pendingTasks}
          icon={<Clock size={20} className="text-amber-500" />}
          iconBg="bg-amber-50"
        />
        <StatCard
          label="Unpaid Bills"
          value={`$${stats.unpaidAmount.toFixed(2)}`}
          icon={<Receipt size={20} className="text-red-400" />}
          iconBg="bg-red-50"
          sub={`${stats.totalBills} bill${stats.totalBills !== 1 ? "s" : ""} total`}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="col-span-2 flex flex-col gap-6">
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

          {/* Recent Tasks */}
          <div className="bg-white border border-off-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="pup-heading-three text-neutral-black">
                Recent Tasks
              </h2>
              <Link
                to={`/my-plans/${planId}/phases`}
                className="flex items-center gap-1 pup-body-sm-400 text-primary-orange hover:opacity-70 transition-opacity"
              >
                View phases <ArrowRight size={14} />
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 size={28} className="text-neutral-200 mb-2" />
                <p className="pup-body-md-400 text-neutral-grey">
                  No tasks yet.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {recentTasks.map((task) => {
                  const due = formatDueDate(task.dueDate);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-neutral-50 transition-colors"
                    >
                      {task.completed ? (
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
                            task.completed && "line-through text-neutral-grey",
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
                          <Avatar
                            src={task.assignee.profilePicture}
                            name={task.assignee.name}
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

          {/* Bills */}
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
                        ${bill.amount.toFixed(2)}
                      </p>
                      <p
                        className={cn(
                          "pup-body-sm-400",
                          bill.paidAt ? "text-green-500" : "text-red-400",
                        )}
                      >
                        {bill.paidAt ? "Paid" : "Unpaid"}
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
                <Avatar
                  src={member.user.profilePicture}
                  name={member.user.name}
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
