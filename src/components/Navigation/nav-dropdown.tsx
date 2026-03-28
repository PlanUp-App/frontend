import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { router } from "@/main";
import { ProfileAvatar } from "../PreviewImage";
import { useAuth } from "@/auth/useAuth";

export default function NavDropdown() {
  const authData = useAuth();
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
          onClick={() => router.navigate({ to: `/my-plans` })}
          className="pup-body-md-400 hover:cursor-pointer"
        >
          My Plans
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            router.navigate({ to: `/profile/${authData.user?.id}` })
          }
          className="pup-body-md-400 hover:cursor-pointer"
        >
          My Profile
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
