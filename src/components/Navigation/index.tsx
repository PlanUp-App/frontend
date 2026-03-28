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
        {authData.isAuthenticated ? (
          <div>
            <NavDropdown />
          </div>
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
    </nav>
  );
}
