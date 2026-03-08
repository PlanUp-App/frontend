import { OutlineButton } from "@/components/Button/outline";
import { PrimaryButton } from "@/components/Button/primary-filled";
import { createFileRoute } from "@tanstack/react-router";

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

const SOCIALS = [
  {
    label: "Facebook",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  { label: "X", icon: <span className="text-[13px] font-bold">𝕏</span> },
  {
    label: "LinkedIn",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon
          points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
          fill="white"
        />
      </svg>
    ),
  },
];

const ArrowRight = () => (
  <svg
    className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
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
);

const ImagePlaceholder = () => (
  <div className="w-full h-full flex items-center justify-center bg-neutral-200">
    <svg
      className="w-12 h-12 text-neutral-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  </div>
);

const Logo = () => (
  <a href="#" className="flex items-center gap-2 no-underline">
    <div className="w-8 h-8 bg-[#F26419] rounded-lg flex items-center justify-center text-white text-sm font-black">
      P
    </div>
    <span
      className="font-bold text-xl text-[#F26419]"
      style={{ fontFamily: "'Clash Display', sans-serif" }}
    >
      PlanUp
    </span>
  </a>
);
function RouteComponent() {
  return (
    <div className="text-neutral-900 bg-white overflow-x-hidden">
      {/* HERO */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center pb-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-neutral-black opacity-50" />
        <div className="container relative z-10 px-16 max-w-2xl ">
          <h1 className="pup-heading-one text-white mb-6">
            Plan Up.
            <br />
            Live More.
          </h1>
          <p className="pup-body-md-400 text-white mb-8">
            Create your first plan, invite your friends, and make organizing
            group activities effortlessly.
          </p>
          <PrimaryButton
            title="GET STARTED NOW"
            link="/sign-up"
            className="w-fit"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section className="container py-28">
        <div className="mb-16">
          <p className="pup-body-tag text-primary-orange uppercase mb-4">
            Product Overview
          </p>
          <h2 className="pup-heading-two leading-tight text-neutral-black max-w-xl">
            Make Group Activities Easier than Ever
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-10">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="feature-card"
              // ref={(el) => (featureRefs.current[i] = el)}
            >
              <div className="w-10 h-10 bg-[#F26419] rounded-xl flex items-center justify-center text-white mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-lg text-neutral-900 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* COLLABORATE */}
      <section className="container px-16 py-24 bg-neutral-50 grid grid-cols-2 gap-20 items-center">
        <div
          className="grid grid-cols-2 gap-4"
          style={{ gridTemplateRows: "1fr 1fr" }}
        >
          <div className="row-span-2 rounded-2xl overflow-hidden min-h-[380px]">
            <ImagePlaceholder />
          </div>
          <div className="rounded-2xl overflow-hidden min-h-[180px]">
            <ImagePlaceholder />
          </div>
          <div className="rounded-2xl overflow-hidden min-h-[180px]">
            <ImagePlaceholder />
          </div>
        </div>
        <div className="py-5">
          <p className="pup-body-tag text-primary-orange uppercase mb-4">
            Seamless Collaboration
          </p>
          <h2 className="pup-heading-two leading-tight text-neutral-black max-w-xl">
            Collaborate with ease
          </h2>
          <p className="text-[15px] text-neutral-500 leading-relaxed mb-9">
            Stay connected with real-time updates, instant chat, and smart
            notifications. Coordinate effortlessly, share ideas, and keep
            everyone in sync—ensuring smooth collaboration from planning to
            completion.
          </p>
          <OutlineButton
            title="Go To App"
            className="text-primary-orange border-primary-orange"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container relative py-32 text-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1400&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-neutral-black/60" />
        <div className="relative z-10">
          <h2 className="pup-heading-two text-white mb-4">
            Make Plans Come to Life
          </h2>
          <p className="pup-body-md-400 text-white mb-10">
            Turn every idea into action — plan, track, and collaborate
            instantly.
          </p>
          <PrimaryButton
            title="Sign Up Now"
            link="/sign-up"
            className="w-fit mx-auto"
          />
        </div>
      </section>

      {/* FOOTER */}
      {/* <footer className="px-16 py-12 flex items-center justify-between border-t border-neutral-100 flex-wrap gap-6">
        <div className="flex items-center gap-10">
          <Logo />
          <div className="flex gap-7">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href="#"
              aria-label={s.label}
              className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-[#F26419] hover:text-[#F26419] transition-all"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </footer> */}
      {/* <div className="px-16 py-5 flex items-center justify-between border-t border-neutral-100 flex-wrap gap-3">
        <p className="text-xs text-neutral-400">
          © 2025 PlanUp. All rights reserved.
        </p>
        <div className="flex gap-5">
          <a
            href="#"
            className="text-xs text-neutral-400 hover:text-[#F26419] transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-xs text-neutral-400 hover:text-[#F26419] transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </div> */}
    </div>
  );
}
