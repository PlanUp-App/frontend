import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { router } from "@/main";
import { MdOutlineNotificationsNone } from "react-icons/md";

export function NotificationTray() {
  const { notifications, unreadCount, markRead, markAllRead, isLoading } =
    useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markRead(notification.id);
    }
    if (notification.link) {
      router.navigate({ to: notification.link });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="cursor-pointer relative p-2 text-neutral-black hover:text-primary-orange transition-colors">
          <MdOutlineNotificationsNone className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-orange text-[10px] font-bold text-white outline outline-2 outline-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 sm:w-96" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <h4 className="pup-h4 text-neutral-black">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllRead()}
              className="text-primary-orange hover:text-primary-orange/80 h-auto p-0 pup-body-sm-500"
            >
              Mark all read
            </Button>
          )}
        </div>
        <Separator className="my-2" />
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <MdOutlineNotificationsNone className="w-12 h-12 text-neutral-300 mb-2" />
              <p className="pup-body-md-400 text-neutral-400">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex flex-col gap-1 p-4 transition-colors hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-0",
                    !notification.read && "bg-primary-orange/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "pup-body-md-600 line-clamp-1",
                        !notification.read ? "text-primary-orange" : "text-neutral-black"
                      )}
                    >
                      {notification.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 whitespace-nowrap mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="pup-body-sm-400 text-neutral-600 line-clamp-2">
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
