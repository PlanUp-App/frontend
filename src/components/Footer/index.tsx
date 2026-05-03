import { Link } from "@tanstack/react-router";

export const SOCIALS = [
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

export const Logo = () => (
  <Link to="/" className="flex items-center gap-2 no-underline">
    <img src="/planup-logo.svg" alt="PlanUp" className="h-9 w-auto" />
  </Link>
);

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-100 pt-20 pb-10">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
          <div>
            <Logo />
            <p className="mt-4 text-neutral-500 max-w-sm">
              Making group activities effortlessly simple and beautifully clear. Plan, track, and collaborate.
            </p>
          </div>
          <div className="flex flex-wrap gap-8">
            <Link
              to="/public-plans"
              className="text-neutral-600 hover:text-orange-500 font-medium transition-colors"
            >
              Public Plans
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-neutral-100">
          <p className="text-sm text-neutral-400">
            © 2026 PlanUp. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-500 hover:bg-orange-50 hover:text-orange-500 transition-all duration-300 transform hover:-translate-y-1"
              >
                {s.icon}
              </a>
            ))}
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-neutral-400 hover:text-orange-500 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-neutral-400 hover:text-orange-500 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
