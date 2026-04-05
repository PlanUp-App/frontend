import NavDropdown from "./nav-dropdown";
import { NotificationTray } from "./notification-tray";

export function UserMenu() {
    return (
        <div className="flex items-center gap-4">
            <NotificationTray />
            <NavDropdown />
        </div>
    )
}