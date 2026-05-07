import axiosInstance from "@/utils/axios/axiosInstance";
import { queryClient } from "@/utils/queryclient/queryClient";
import { type PlanFile } from "@/components/Files/-queries";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface MessageSeen {
  userId: string;
  seenAt: string;
  user: { id: string; name: string; profilePicture: string | null };
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; name: string; profilePicture: string | null };
  createdAt: string;
  messageSeens: MessageSeen[];
  files?: PlanFile[];
  tempId?: string;
  status?: "sending" | "sent" | "error";
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
      .catch(() => { });
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

    socketRef.current.on("newMessage", (message: Message & { tempId?: string }) => {

      setMessages((prev) => {
        // check if message sent already
        if (prev.some((m) => m.id === message.id)) return prev;


        // if temp id, replace message with sent message
        if (message.tempId) {
          const index = prev.findIndex((m) => m.tempId === message.tempId);
          if (index !== -1) {
            const newMessages = [...prev];
            newMessages[index] = { ...message, status: "sent" };
            return newMessages;
          }
        }

        // 3. If no optimistic message was found to replace, just add the new message
        if (message.tempId && prev.some((m) => m.tempId === message.tempId)) {
          return prev;
        }

        return [...prev, { ...message, status: "sent" }];
      });

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
      ({ user, messageIds }: { user: any; messageIds: string[] }) => {
        setMessages((prev) =>
          prev.map((m) => {
            if (messageIds.includes(m.id)) {
              const alreadySeen = m.messageSeens?.some(
                (s) => s.userId === user.id,
              );
              if (alreadySeen) return m;

              return {
                ...m,
                messageSeens: [
                  ...(m.messageSeens || []),
                  { userId: user.id, seenAt: new Date().toISOString(), user },
                ],
              };
            }
            return m;
          }),
        );

        if (user.id === currentUserId) {
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
    if (!isOpen || !socketRef.current || messages.length === 0) return;

    const unseenIds = messages
      .filter(
        (m) =>
          m.senderId !== currentUserId &&
          m.status !== "sending" &&
          !m.messageSeens?.some((s) => s.userId === currentUserId),
      )
      .map((m) => m.id);

    if (unseenIds.length > 0) {
      socketRef.current.emit("markSeen", { planId, messageIds: unseenIds });
    }

    setUnreadCount(0);
  }, [isOpen, messages.length]);

  const sendMessage = (content: string, fileIds?: string[], files?: PlanFile[]) => {
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: Message = {
      id: tempId,
      tempId,
      content,
      senderId: currentUserId,
      sender: { id: currentUserId, name: "You", profilePicture: null },
      createdAt: new Date().toISOString(),
      messageSeens: [],
      files: files || [],
      status: "sending",
    };
    setMessages((prev) => {
      if (prev.some((m) => m.tempId === tempId)) return prev; // only guard on tempId
      return [...prev, optimisticMessage];
    });

    socketRef.current?.emit("sendMessage", { planId, content, fileIds, tempId });
  };

  return { messages, sendMessage, connected, unreadCount, setUnreadCount };
}
