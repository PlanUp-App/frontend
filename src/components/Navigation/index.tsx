import { Link } from "@tanstack/react-router";
import { OutlineButton } from "../Button/outline";
import { PrimaryButton } from "../Button/primary-filled";

export function Navigation() {
  return (
    <nav className="w-full bg-white border-2 h-20 flex items-center z-50">
      <div className="container flex justify-between">
        <Link to="/">
          <img src="/public/planup-logo.svg" />
        </Link>
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
      </div>
    </nav>
  );
}
