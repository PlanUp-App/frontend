import { PrimaryButton } from "@/components/Button/primary-filled";
import { Navigation } from "@/components/Navigation";
import { createFileRoute, Link } from "@tanstack/react-router";
import PlanCard from "@/components/PlanCard";
import { useGetPublicPlans } from "./public-plans/-queries";

import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});
const FEATURES = [
  {
    title: "Visual Timeline",
    description:
      "Plan, organize, and track every step of your trip or event with a clear, interactive timeline view.",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: "Expense Tracking",
    description:
      "Easily record, split, and monitor shared costs to keep everyone transparent and on budget throughout the plan.",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "In-app Chat",
    description:
      "Coordinate effortlessly with group members, share updates instantly, and make quick decisions.",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: "Notifications",
    description:
      "Stay informed with timely alerts about new messages, expense updates, and approaching tasks.",
    icon: (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

function RouteComponent() {
  const { data: publicPlansData, isLoading: isPublicPlansLoading } =
    useGetPublicPlans({ limit: 3 });
  const publicPlans = publicPlansData?.data;

  return (
    <>
      <Navigation />
      <div className="text-neutral-900 bg-neutral-50 overflow-x-hidden font-sans">
        {/* HERO */}
        <section className="relative min-h-[calc(100vh-80px)] flex items-center pb-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="hero.png"
              alt="Hero background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-transparent" />
          </div>

          <div className="container relative z-10 px-6 lg:px-16 max-w-7xl mx-auto">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
                <span className="text-white/90 text-sm font-medium tracking-wide">
                  The New Standard for Planning
                </span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                Plan Up.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">
                  Live More.
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-neutral-200 mb-10 leading-relaxed font-light max-w-xl">
                Create your first plan, invite your friends, and make organizing
                group activities effortlessly simple and beautifully clear.
              </p>
              <div className="flex items-center gap-4">
                <PrimaryButton
                  title="Get Started Now"
                  link="/sign-up"
                  className="w-fit px-8 py-4 rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform hover:-translate-y-1"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="container mx-auto px-6 lg:px-16 py-32 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-orange-500 font-semibold uppercase tracking-wider text-sm mb-3">
              Product Overview
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
              Make Group Activities <br />
              <span className="font-light">Easier than Ever</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f, _) => (
              <div
                key={f.title}
                className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 border border-neutral-100 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center text-white mb-8 shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="font-bold text-xl text-neutral-900 mb-4">
                  {f.title}
                </h3>
                <p className="text-neutral-500 leading-relaxed group-hover:text-neutral-600 transition-colors">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* PUBLIC PLANS */}
        <section className="py-32 bg-neutral-50 relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-16">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <p className="text-orange-500 font-semibold uppercase tracking-wider text-sm mb-3">
                  Community
                </p>
                <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight">
                  Discover{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                    Public Plans
                  </span>
                </h2>
                <p className="mt-4 text-lg text-neutral-500 font-light">
                  Get inspired by how others are organizing their activities.
                  Join existing plans or learn from their structures.
                </p>
              </div>
              <Link
                to="/public-plans"
                className="inline-flex items-center gap-2 text-orange-500 font-medium hover:text-orange-600 transition-colors group mb-2"
              >
                View all plans
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isPublicPlansLoading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-3xl p-4 shadow-sm border border-neutral-100 h-[400px] animate-pulse"
                  />
                ))
              ) : publicPlans && publicPlans.length > 0 ? (
                publicPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    linkTo={`/public-plans/${plan.id}`}
                    id={plan.id}
                    name={plan.name}
                    coverImage={plan.coverImage ?? "placeholder.png"}
                    memberCount={plan._count.members}
                    isPublic={plan.visibility === "PUBLIC"}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-neutral-200">
                  <p className="text-neutral-400">
                    No public plans available at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* COLLABORATE */}
        <section className="py-32 bg-white relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-16">
            <div className="flex flex-col-reverse lg:grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="rounded-3xl overflow-hidden shadow-xl shadow-neutral-200/80 group">
                <img
                  src="collaborate.png"
                  alt="Collab 2"
                  className="w-full max-h-full object-fit group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="max-w-xl">
                <p className="text-orange-500 font-semibold uppercase tracking-wider text-sm mb-3">
                  Seamless Collaboration
                </p>
                <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 leading-tight mb-8">
                  Collaborate with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">
                    absolute ease
                  </span>
                </h2>
                <p className="text-lg text-neutral-500 leading-relaxed mb-10 font-light">
                  Stay connected with real-time updates, instant chat, and smart
                  notifications. Coordinate effortlessly, share ideas, and keep
                  everyone in sync—ensuring smooth collaboration from planning
                  to completion.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 lg:px-16 py-32 mb-20">
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="absolute inset-0">
              <img
                src="friends.jpg"
                alt="CTA background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-sm" />
            </div>

            <div className="relative z-10 py-24 px-10 text-center max-w-3xl mx-auto">
              <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                Make Plans Come to Life
              </h2>
              <p className="text-xl text-neutral-300 mb-10 font-light">
                Turn every idea into action — plan, track, and collaborate
                instantly. Join thousands of users who are organizing their
                group activities with PlanUp.
              </p>
              <PrimaryButton
                title="Create Your First Plan Free"
                link="/sign-up"
                className="w-fit mx-auto px-10 py-5 text-lg rounded-full shadow-lg shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-1"
              />
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <Footer />
      </div>
    </>
  );
}
