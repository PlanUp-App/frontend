// hooks/useChat.ts
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; name: string; profilePicture: string | null };
  createdAt: string;
}

export function useChat(planId: string, token: string) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);

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
    });

    socketRef.current.on("disconnect", () => setConnected(false));

    return () => {
      socketRef.current?.emit("leavePlanChat", { planId });
      socketRef.current?.disconnect();
    };
  }, [planId, token]);

  const sendMessage = (content: string) => {
    socketRef.current?.emit("sendMessage", { planId, content });
  };

  return { messages, sendMessage, connected };
}
