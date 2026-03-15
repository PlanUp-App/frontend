import axiosInstance from "@/utils/axios/axiosInstance";
import { queryClient } from "@/utils/queryclient/queryClient";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; name: string; profilePicture: string | null };
  createdAt: string;
}

export function useChat(
  planId: string,
  token: string,
  currentUserId: string,
  isOpen: boolean,
) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    queryClient
      .fetchQuery({
        queryKey: ["unread-count", planId],
        queryFn: async () => {
          const { data } = await axiosInstance.get(
            `/chat/${planId}/unread-counts`,
          );
          return data as number;
        },
        staleTime: Infinity,
      })
      .then((count) => setUnreadCount(count))
      .catch(() => {});
  }, [planId, token]);

  useEffect(() => {
    socketRef.current = io("http://localhost:7001", {
      extraHeaders: { authorization: token },
    });

    socketRef.current.on("connect", () => {
      setConnected(true);
      socketRef.current?.emit("joinPlanChat", { planId });
    });

    socketRef.current.on("chatHistory", (history: Message[]) => {
      setMessages(history);
    });

    socketRef.current.on("newMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);

      if (message.senderId !== currentUserId) {
        if (isOpen) {
          // user is looking at the chat, mark as seen immediately
          socketRef.current?.emit("markSeen", {
            planId,
            messageIds: [message.id],
          });
        } else {
          // user hasn't opened the chat, increment the badge
          setUnreadCount((prev) => prev + 1);
        }
      }
    });

    socketRef.current.on(
      "messagesSeen",
      ({ userId }: { userId: string; messageIds: string[] }) => {
        if (userId === currentUserId) {
          setUnreadCount(0);
        }
      },
    );

    socketRef.current.on("disconnect", () => setConnected(false));

    return () => {
      socketRef.current?.emit("leavePlanChat", { planId });
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      setMessages([]);
    };
  }, [planId, token, currentUserId]);

  // when the user opens the chat, mark all unseen messages as seen
  useEffect(() => {
    if (!isOpen || !socketRef.current) return;

    const unseenIds = messages
      .filter((m) => m.senderId !== currentUserId)
      .map((m) => m.id);

    if (unseenIds.length > 0) {
      socketRef.current.emit("markSeen", { planId, messageIds: unseenIds });
    }

    setUnreadCount(0);
  }, [isOpen]);

  const sendMessage = (content: string) => {
    socketRef.current?.emit("sendMessage", { planId, content });
  };

  return { messages, sendMessage, connected, unreadCount, setUnreadCount };
}
