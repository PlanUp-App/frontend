import { Link } from "@tanstack/react-router";
import { OutlineButton } from "../Button/outline";
import { PrimaryButton } from "../Button/primary-filled";
import { useAuth } from "@/auth/useAuth";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { MdMenu, MdClose } from "react-icons/md";
import { MdPerson, MdSettings, MdLogout, MdMap, MdPublic } from "react-icons/md";
import { useState } from "react";
import { UserMenu } from "./user-menu";

export function Navigation() {
  const authData = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  // Get initials for avatar
  const initials = authData.user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md h-16 flex items-center z-50 sticky top-0 border-b border-neutral-100 shadow-sm">
      <div className="container flex justify-between items-center">
        <Link to={authData.user ? "/my-plans" : "/"}>
          <img src="/planup-logo.svg" className="h-8 md:h-9" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/public-plans"
            className="text-sm font-medium text-neutral-700 hover:text-primary-orange transition-colors"
          >
            Public Plans
          </Link>
          {authData.isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex gap-3">
              <OutlineButton
                className="uppercase border-primary-orange text-primary-orange"
                title="Log In"
                link="/login"
              />
              <PrimaryButton
                className="uppercase"
                title="Sign Up"
                link="/sign-up"
              />
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen} >
            <SheetTrigger asChild>
              <button
                className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <MdMenu size={26} />
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[280px] sm:w-[320px] p-0 flex flex-col"
              showCloseButton={false}
            >
              {/* Sheet Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                <SheetTitle asChild>
                  <Link to={authData.user ? "/my-plans" : "/"} onClick={close}>
                    <img src="/planup-logo.svg" className="h-7" />
                  </Link>
                </SheetTitle>
                <button
                  onClick={close}
                  className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
                  aria-label="Close menu"
                >
                  <MdClose size={20} />
                </button>
              </div>

              <div className="flex flex-col flex-1 px-5 py-4 overflow-y-auto">
                {/* Logged-in: Profile summary */}
                {authData.isAuthenticated && (
                  <div className="flex items-center gap-3 pb-4 mb-2 border-b border-neutral-100">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-sm font-semibold text-primary-orange flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {authData.user?.name ?? "My Account"}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {authData.user?.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Nav Links */}
                <nav className="flex flex-col flex-1">
                  {authData.isAuthenticated && (
                    <MobileNavLink to="/my-plans" icon={<MdMap size={18} />} onClick={close}>
                      My Plans
                    </MobileNavLink>
                  )}
                  <MobileNavLink to="/public-plans" icon={<MdPublic size={18} />} onClick={close}>
                    Public Plans
                  </MobileNavLink>
                  {authData.isAuthenticated && (
                    <MobileNavLink to={`/profile/${authData.user?.id}`} icon={<MdPerson size={18} />} onClick={close}>
                      My Profile
                    </MobileNavLink>
                  )}
                  <div className="flex-1" />

                  {authData.isAuthenticated && (
                    <button
                      onClick={() => { authData.logout?.(); close(); }}
                      className="flex items-center gap-3 py-3 text-sm font-medium text-red-500 hover:text-red-600 transition-colors border-t border-neutral-100 mt-2"
                    >
                      <MdLogout size={18} />
                      Sign out
                    </button>
                  )}

                  {/* Logged-out: CTAs */}
                  {!authData.isAuthenticated && (
                    <div className="pt-4 mt-4 border-t border-neutral-100 flex flex-col gap-3">
                      <p className="text-xs text-neutral-400 text-center mb-1">
                        Start planning smarter today
                      </p>
                      <OutlineButton
                        className="w-full uppercase border-primary-orange text-primary-orange justify-center"
                        title="Log In"
                        link="/login"
                        onClick={close}
                      />
                      <PrimaryButton
                        className="w-full uppercase justify-center"
                        title="Sign Up Free"
                        link="/sign-up"
                        onClick={close}
                      />
                    </div>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

// Helper component for nav links
function MobileNavLink({
  to,
  icon,
  children,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 py-3 text-sm font-medium text-neutral-800 hover:text-primary-orange transition-colors border-b border-neutral-100 last:border-0"
    >
      <span className="text-neutral-400">{icon}</span>
      {children}
    </Link>
  );
}