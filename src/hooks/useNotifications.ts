import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios/axiosInstance";
import { useAuth } from "@/auth/useAuth";
import { toast } from "sonner";

export type NotificationType =
  | "TASK_DEADLINE"
  | "UNREAD_CHAT"
  | "MODERATION_ACTION"
  | "PLAN_JOIN_REQUEST"
  | "PLAN_INVITATION"
  | "USER_LEFT_PLAN";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

export function useNotifications() {
  const { user, token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Notification[]>("/notification");
      return data;
    },
    enabled: isAuthenticated,
  });

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.patch(`/notification/${id}/read`);
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData(["notifications"], (prev: Notification[] = []) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.patch("/notification/read-all");
    },
    onSuccess: () => {
      queryClient.setQueryData(["notifications"], (prev: Notification[] = []) =>
        prev.map((n) => ({ ...n, read: true })),
      );
    },
  });

  useEffect(() => {
    if (!isAuthenticated || !token || !user) return;

    // Connect to notifications namespace
    socketRef.current = io(`${import.meta.env.VITE_API_URL}/notifications`, {
      extraHeaders: { authorization: token },
      forceNew: true, // Ensure a fresh connection for each user session
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to notifications namespace");
    });

    socketRef.current.on("newNotification", (notification: Notification) => {
      // Update query cache
      queryClient.setQueryData(
        ["notifications"],
        (prev: Notification[] = []) => [notification, ...prev],
      );

      // Show toast
      toast(notification.title, {
        description: notification.message,
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("newNotification");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, token, user, queryClient]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    isLoading,
    unreadCount,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
  };
}
