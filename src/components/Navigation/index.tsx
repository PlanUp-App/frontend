import { Link } from "@tanstack/react-router";
import { OutlineButton } from "../Button/outline";
import { PrimaryButton } from "../Button/primary-filled";
import { useAuth } from "@/auth/useAuth";
import NavDropdown from "./nav-dropdown";

export function Navigation() {
  const authData = useAuth();

  return (
    <nav className="w-full bg-white h-20 flex items-center z-50">
      <div className="container flex justify-between">
        <Link to={authData.user ? "/my-plans" : "/"}>
          <img src="/planup-logo.svg" />
        </Link>
        <div className="flex items-center gap-6">
          <Link
            to="/public-plans"
            className="text-sm font-medium text-neutral-black hover:text-primary-orange transition-colors"
          >
            Public Plans
          </Link>
          {authData.isAuthenticated ? (
            <NavDropdown />
          ) : (
            <div className="flex gap-4">
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
      </div>
    </nav>
  );
}
