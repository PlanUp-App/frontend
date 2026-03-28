import { createFileRoute, Link } from "@tanstack/react-router";
import { Spinner } from "@/components/ui/spinner";
import { ProfileAvatar } from "@/components/PreviewImage";
import { cn } from "@/lib/utils";
import {
  MdReceiptLong,
  MdCheckCircle,
  MdPending,
  MdTrendingUp,
  MdTrendingDown,
  MdRemove,
  MdArrowBack,
  MdArrowUpward,
  MdArrowDownward,
  MdSentimentVerySatisfied,
  MdAccountBalanceWallet,
  MdPayments,
  MdArrowForward,
} from "react-icons/md";
import { useGetDashboard } from "./-queries";
import { useAuth } from "@/auth/useAuth";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$planId/_layout/bills/report/",
)({
  component: ReportPage,
});

const fmt = (n: number) =>
  `Rs. ${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const COLORS: { bg: string; text: string; bar: string }[] = [
  { bg: "bg-orange-50", text: "text-primary-orange", bar: "bg-primary-orange" },
  { bg: "bg-blue-50", text: "text-blue-500", bar: "bg-blue-500" },
  { bg: "bg-green-50", text: "text-green-500", bar: "bg-green-500" },
  { bg: "bg-purple-50", text: "text-purple-500", bar: "bg-purple-500" },
  { bg: "bg-amber-50", text: "text-amber-500", bar: "bg-amber-500" },
  { bg: "bg-rose-50", text: "text-rose-500", bar: "bg-rose-500" },
  { bg: "bg-teal-50", text: "text-teal-500", bar: "bg-teal-500" },
  { bg: "bg-indigo-50", text: "text-indigo-500", bar: "bg-indigo-500" },
];
const c = (i: number) => COLORS[i % COLORS.length];

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
        <p className="pup-body-xl-400 text-neutral-black leading-none mb-1">
          {value}
        </p>
        <p className="pup-body-sm-400 text-neutral-grey">{label}</p>
        {sub && <p className="text-xs text-neutral-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white border border-off-white rounded-2xl p-6",
        className,
      )}
    >
      <h2 className="pup-body-xl-400 text-neutral-black mb-5">{title}</h2>
      {children}
    </div>
  );
}

function MiniBar({
  value,
  max,
  barClass,
}: {
  value: number;
  max: number;
  barClass: string;
}) {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          barClass,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function monthShort(month: string) {
  const [y, m] = month.split("-");
  return new Date(+y, +m - 1).toLocaleString("default", { month: "short" });
}

function ReportPage() {
  const { planId } = Route.useParams();
  const { data, isLoading } = useGetDashboard(planId);
  const { user: me } = useAuth();

  if (isLoading)
    return (
      <div className="flex justify-center mt-24">
        <Spinner />
      </div>
    );

  if (!data) return null;

  const {
    summary,
    owedByMe,
    owedToMe,
    expenditureByCategory,
    monthlyTrend,
    topSpenders,
  } = data;

  const maxCategory = Math.max(0, ...expenditureByCategory.map((x) => x.total));
  const maxMonthly = Math.max(0, ...monthlyTrend.map((x) => x.total));
  const netPositive = summary.netBalance > 0;
  const netNeutral = summary.netBalance === 0;

  return (
    <div className="flex flex-col gap-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/my-plans/$planId/bills"
          params={{ planId }}
          className="w-9 h-9 rounded-xl border border-off-white bg-white flex items-center justify-center hover:bg-neutral-50 transition-colors"
        >
          <MdArrowBack size={18} className="text-neutral-400" />
        </Link>
        <h1 className="pup-heading-three">Expenses Summary</h1>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        <StatCard
          label="Plan Total"
          value={fmt(summary.planTotalExpenditure)}
          icon={<MdReceiptLong size={20} className="text-blue-500" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Your Net Balance"
          value={
            netNeutral
              ? "—"
              : `${netPositive ? "+ " : "- "}${fmt(Math.abs(summary.netBalance))}`
          }
          icon={
            netNeutral ? (
              <MdRemove size={20} className="text-neutral-400" />
            ) : netPositive ? (
              <MdTrendingUp size={20} className="text-green-500" />
            ) : (
              <MdTrendingDown size={20} className="text-red-400" />
            )
          }
          iconBg={
            netNeutral
              ? "bg-neutral-50"
              : netPositive
                ? "bg-green-50"
                : "bg-red-50"
          }
        />
        <StatCard
          label="Already Settled Amount"
          value={fmt(summary.planSettledTotal)}
          icon={<MdCheckCircle size={20} className="text-green-500" />}
          iconBg="bg-green-50"
        />
        <StatCard
          label="Unsettled Amount"
          value={fmt(summary.planUnsettledTotal)}
          icon={<MdPending size={20} className="text-amber-500" />}
          iconBg="bg-amber-50"
        />
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left — col-span-2 */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Minimum Transactions to Settle Bill */}
          {data.minTransactions.length > 0 && (
            <SectionCard title="Settle All Expenses">
              <p className="pup-body-sm-400 text-neutral-grey -mt-2 mb-5">
                Minimum transfers to clear all debts
              </p>
              <div className="flex flex-col gap-1">
                {data.minTransactions.map((tx, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-neutral-50 transition-colors"
                  >
                    <ProfileAvatar
                      src={tx.from.profilePicture ?? null}
                      alt={tx.from.name}
                      size="md"
                    />
                    <p className="pup-body-md-400 text-neutral-black shrink-0">
                      {tx.from.id === me?.id ? "Me" : tx.from.name}
                    </p>
                    <div className="flex-1 flex items-center gap-1 px-2">
                      <div className="flex-1 h-px bg-neutral-light-grey" />
                      <MdArrowForward
                        size={14}
                        className="text-neutral-dark-grey shrink-0"
                      />
                      <div className="flex-1 h-px bg-neutral-light-grey" />
                    </div>
                    <p className="pup-body-md-400 text-neutral-black shrink-0">
                      {tx.to.id === me?.id ? "Me" : tx.to.name}
                    </p>
                    <ProfileAvatar
                      src={tx.to.profilePicture ?? null}
                      alt={tx.to.name}
                      size="md"
                    />
                    <span className="ml-2 px-3 py-1 rounded-full bg-orange-50 pup-body-sm-400 text-primary-orange shrink-0">
                      {fmt(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
          {/* You Owe */}
          <SectionCard title="You Owe">
            {owedByMe.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MdSentimentVerySatisfied
                  size={36}
                  className="text-neutral-200 mb-2"
                />
                <p className="pup-body-md-400 text-neutral-grey">
                  Nothing outstanding!
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  {owedByMe.map((item) => (
                    <div
                      key={item.billId}
                      className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-neutral-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                        <MdArrowUpward size={16} className="text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="pup-body-md-400 text-neutral-black truncate">
                          {item.title}
                        </p>
                        <p className="pup-body-sm-400 text-neutral-grey truncate">
                          To {item.paidBy?.name ?? "Unknown"}
                          {item.category ? ` · ${item.category}` : ""}
                        </p>
                      </div>
                      <p className="pup-body-md-400 text-red-500 shrink-0">
                        {fmt(item.amount)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-off-white flex justify-between items-center">
                  <p className="pup-body-sm-400 text-neutral-grey">
                    Total you owe
                  </p>
                  <p className="pup-body-lg-500 text-red-500">
                    {fmt(summary.myTotalOwed)}
                  </p>
                </div>
              </>
            )}
          </SectionCard>

          {/* Owed To You */}
          <SectionCard title="Owed to You">
            {owedToMe.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MdAccountBalanceWallet
                  size={36}
                  className="text-neutral-200 mb-2"
                />
                <p className="pup-body-md-400 text-neutral-grey">
                  No pending collections.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  {owedToMe.map((item) => (
                    <div
                      key={item.billId + item.debtor?.id}
                      className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-neutral-50 transition-colors"
                    >
                      <ProfileAvatar
                        src={item.debtor?.profilePicture ?? null}
                        alt={item.debtor?.name ?? "Unknown"}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="pup-body-md-400 text-neutral-black truncate">
                          {item.debtor?.name ?? "Unknown"}
                        </p>
                        <p className="pup-body-sm-400 text-neutral-grey truncate">
                          {item.title}
                          {item.category ? ` · ${item.category}` : ""}
                        </p>
                      </div>
                      <p className="pup-body-md-400 text-green-500 shrink-0">
                        {fmt(item.amount)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-off-white flex justify-between items-center">
                  <p className="pup-body-sm-400 text-neutral-grey">
                    Total owed to you
                  </p>
                  <p className="pup-body-lg-500 text-green-500">
                    {fmt(summary.myTotalOwedToMe)}
                  </p>
                </div>
              </>
            )}
          </SectionCard>

          {/* Monthly Trend */}
          {monthlyTrend.length > 1 && (
            <SectionCard title="Monthly Spending">
              <div className="flex items-end gap-2" style={{ height: 120 }}>
                {monthlyTrend.map((m) => {
                  const pct =
                    maxMonthly === 0 ? 0 : (m.total / maxMonthly) * 100;
                  return (
                    <div
                      key={m.month}
                      className="flex flex-col items-center gap-1.5 flex-1 group"
                    >
                      <div
                        className="w-full flex items-end rounded-t-lg overflow-hidden"
                        style={{ height: 88 }}
                      >
                        <div
                          className="w-full bg-orange-100 group-hover:bg-primary-orange transition-colors duration-200 rounded-t-lg"
                          style={{ height: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                      <p className="pup-body-sm-400 text-neutral-grey">
                        {monthShort(m.month)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          {/* By Category */}
          {expenditureByCategory.length > 0 && (
            <div className="bg-white border border-off-white rounded-2xl p-6">
              <h2 className="pup-body-xl-400 text-neutral-black mb-5">
                By Category
              </h2>
              <div className="flex flex-col gap-4">
                {expenditureByCategory.map((cat, i) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", c(i).bar)} />
                        <span className="pup-body-sm-400 text-neutral-black">
                          {cat.category}
                        </span>
                      </div>
                      <span className="pup-body-sm-400 text-neutral-grey">
                        {fmt(cat.total)}
                      </span>
                    </div>
                    <MiniBar
                      value={cat.total}
                      max={maxCategory}
                      barClass={c(i).bar}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Spenders */}
          {topSpenders.length > 0 && (
            <div className="bg-white border border-off-white rounded-2xl p-6">
              <h2 className="pup-body-xl-400 text-neutral-black mb-5">
                Top Spenders
              </h2>
              <div className="flex flex-col gap-4">
                {topSpenders.map((s, i) => (
                  <div key={s.user.id} className="flex items-center gap-3">
                    <span className="pup-body-sm-400 text-neutral-300 w-4 shrink-0">
                      {i + 1}
                    </span>
                    <ProfileAvatar
                      src={s.user.profilePicture ?? null}
                      alt={s.user.name}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="pup-body-md-400 text-neutral-black truncate">
                          {s.user.name}
                        </p>
                        <p
                          className={cn(
                            "pup-body-sm-400 shrink-0 ml-2",
                            c(i).text,
                          )}
                        >
                          {fmt(s.totalPaid)}
                        </p>
                      </div>
                      <MiniBar
                        value={s.totalPaid}
                        max={topSpenders[0].totalPaid}
                        barClass={c(i).bar}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Summary */}
          <div className="bg-white border border-off-white rounded-2xl p-6">
            <h2 className="pup-body-xl-400 text-neutral-black mb-5">
              Your Summary
            </h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: <MdPayments size={16} className="text-blue-500" />,
                  iconBg: "bg-blue-50",
                  label: "Settled Amount",
                  value: fmt(summary.myTotalPaidSettled),
                  valueColor: "text-blue-500",
                },
                {
                  icon: <MdArrowUpward size={16} className="text-red-400" />,
                  iconBg: "bg-red-50",
                  label: "You owe",
                  value: fmt(summary.myTotalOwed),
                  valueColor: "text-red-500",
                },
                {
                  icon: (
                    <MdArrowDownward size={16} className="text-green-500" />
                  ),
                  iconBg: "bg-green-50",
                  label: "Owed to you",
                  value: fmt(summary.myTotalOwedToMe),
                  valueColor: "text-green-500",
                },
              ].map(({ icon, iconBg, label, value, valueColor }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      iconBg,
                    )}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="pup-body-sm-400 text-neutral-grey">{label}</p>
                  </div>
                  <p className={cn("pup-body-md-400 shrink-0", valueColor)}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
