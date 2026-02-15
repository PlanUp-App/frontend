import { useState, useEffect, useRef } from "react";
import { MdClose, MdSend, MdChatBubbleOutline } from "react-icons/md";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/useChat";

interface ChatBubbleProps {
  planId: string;
  currentUserId: string;
  token: string;
}

export function ChatBubble({ planId, currentUserId, token }: ChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage, connected } = useChat(planId, token);
  const [input, setInput] = useState("");
  // const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  //   useEffect(() => {
  //     if (isOpen) {
  //       // Fetch messages
  //       // fetchMessages(planId).then(setMessages);
  //       // Setup WebSocket or polling for real-time updates
  //       // const ws = new WebSocket(`ws://your-server/chat/${planId}`);
  //       // ws.onmessage = (event) => {
  //       //   const newMessage = JSON.parse(event.data);
  //       //   setMessages(prev => [...prev, newMessage]);
  //       // };
  //       // return () => ws.close();
  //     }
  //   }, [isOpen, planId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
    setInput("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isConsecutiveMessage = (index: number) => {
    if (index === 0) return false;
    const current = messages[index];
    const previous = messages[index - 1];
    return current.senderId === previous.senderId;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-dark-blue text-white px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="pup-body-lg-700">Group Chat</h3>
              <p className="text-sm opacity-80">Plan Discussion</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 rounded-full p-1 transition-colors cursor-pointer"
            >
              <MdClose className="size-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-neutral-grey pup-body-sm-400">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwn = message.sender.id === currentUserId;
                const showAvatar = !isConsecutiveMessage(index);
                const isLastFromUser =
                  index === messages.length - 1 ||
                  messages[index + 1].sender.id !== message.sender.id;

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      isOwn ? "flex-row-reverse" : "flex-row",
                      !showAvatar && "ml-10",
                    )}
                  >
                    {/* Avatar */}
                    {showAvatar && !isOwn && (
                      <div className="flex-shrink-0 mt-1">
                        {message.sender.profilePicture ? (
                          <img
                            src={message.sender.profilePicture}
                            alt={message.sender.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-orange text-white flex items-center justify-center text-xs font-medium">
                            {getInitials(message.sender.name)}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={cn("flex flex-col", isOwn && "items-end")}>
                      {/* Name (only for first message in sequence) */}
                      {showAvatar && !isOwn && (
                        <span className="text-xs text-neutral-dark-grey mb-1 ml-1 pup-body-sm-500">
                          {message.sender.name}
                        </span>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={cn(
                          "max-w-[280px] rounded-2xl px-4 py-2",
                          isOwn
                            ? "bg-dark-blue text-white"
                            : "bg-neutral-light-grey text-neutral-black",
                          showAvatar
                            ? isOwn
                              ? "rounded-tr-sm"
                              : "rounded-tl-sm"
                            : "",
                        )}
                      >
                        <p className="pup-body-sm-400 break-words">
                          {message.content}
                        </p>
                      </div>

                      {/* Timestamp (only for last message in sequence) */}
                      {isLastFromUser && (
                        <span className="text-xs text-neutral-grey mt-1 px-1">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator
          {typingUsers.size > 0 && (
            <div className="px-4 py-2 text-xs text-neutral-grey pup-body-sm-400">
              {Array.from(typingUsers).join(", ")}{" "}
              {typingUsers.size === 1 ? "is" : "are"} typing...
            </div>
          )} */}

          {/* Input */}
          <div className="border-t border-neutral-light-grey p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-neutral-grey rounded-full focus:outline-none focus:border-dark-blue pup-body-sm-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-dark-blue text-white rounded-full py-2 px-2.5 hover:bg-dark-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdSend className="size-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "bg-dark-blue text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all relative cursor-pointer",
          isOpen && "hidden",
        )}
      >
        <MdChatBubbleOutline className="size-6" />
        {/* Unread Badge */}
        {/* {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-primary-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount}
          </div>
        )} */}
      </button>
    </div>
  );
}
