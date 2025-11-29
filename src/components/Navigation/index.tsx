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

function NavDropdown({ authData }: { authData: AuthState }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <img
          className="w-11 h-11 object-cover"
          src={
            authData.user?.profilePicture ||
            "https://cdn.vectorstock.com/i/500p/28/66/gray-profile-silhouette-avatar-vector-21542866.jpg"
          }
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{authData.user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={authData.logout}
          className="text-red-400 hover:text-red-400"
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
        <Link to="/">
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
