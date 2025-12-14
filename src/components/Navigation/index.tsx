import { Link } from "@tanstack/react-router";
import { OutlineButton } from "../Button/outline";
import { PrimaryButton } from "../Button/primary-filled";
import { useAuth } from "@/auth/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { AuthState } from "@/auth/AuthContext";
import { router } from "@/main";
import { ProfileAvatar } from "../PreviewImage";

function NavDropdown({ authData }: { authData: AuthState }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <ProfileAvatar
          src={authData.user?.profilePicture}
          alt={authData.user?.name}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="pup-body-md-500">
          {authData.user?.name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.navigate({ to: "/my-account" })}
          className="pup-body-md-400 hover:cursor-pointer"
        >
          My Account
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={authData.logout}
          className="text-red-400 pup-body-md-400 hover:cursor-pointer hover:text-red-400"
        >
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
            <NavDropdown authData={authData} />
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
