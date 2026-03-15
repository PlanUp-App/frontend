import { useState, useEffect, useRef } from "react";
import { MdClose, MdSend, MdChatBubbleOutline } from "react-icons/md";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/useChat";
import { ProfileAvatar } from "../PreviewImage";
import { Link } from "@tanstack/react-router";

interface ChatBubbleProps {
  planId: string;
  currentUserId: string;
  token: string;
}

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function groupMessagesByDay(messages: ReturnType<typeof useChat>["messages"]) {
  const groups: { label: string; messages: typeof messages }[] = [];

  for (const message of messages) {
    const label = getDayLabel(message.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.messages.push(message);
    } else {
      groups.push({ label, messages: [message] });
    }
  }

  return groups;
}

export function ChatBubble({ planId, currentUserId, token }: ChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage, connected, unreadCount } = useChat(
    planId,
    token,
    currentUserId,
    isOpen,
  );
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // scroll on new messages
  useEffect(() => {
    const timeout = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timeout);
  }, [messages]);

  // scroll when chat opens (history is already loaded)
  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);
  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const groupedMessages = groupMessagesByDay(messages);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-dark-blue text-white px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="pup-body-lg-700">Group Chat</h3>
              <p className="text-sm opacity-80">
                {connected ? "Plan Discussion" : "Connecting..."}
              </p>
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
              groupedMessages.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-neutral-light-grey" />
                    <span className="text-xs text-neutral-grey pup-body-sm-400 whitespace-nowrap">
                      {group.label}
                    </span>
                    <div className="flex-1 h-px bg-neutral-light-grey" />
                  </div>

                  <div className="space-y-1">
                    {group.messages.map((message, index) => {
                      const isOwn = message.sender.id === currentUserId;
                      const isConsecutive =
                        index > 0 &&
                        group.messages[index - 1].senderId ===
                          message.senderId &&
                        new Date(message.createdAt).getTime() -
                          new Date(
                            group.messages[index - 1].createdAt,
                          ).getTime() <
                          10 * 60 * 1000;
                      const isLastFromUser =
                        index === group.messages.length - 1 ||
                        group.messages[index + 1].senderId !== message.senderId;

                      return (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-2",
                            isOwn ? "flex-row-reverse" : "flex-row",
                            isConsecutive && !isOwn && "ml-12",
                          )}
                        >
                          {!isConsecutive && !isOwn && (
                            <Link to={`/profile/${message.sender.id}`}>
                              <div className="flex-shrink-0 mt-1">
                                <ProfileAvatar
                                  src={message.sender.profilePicture}
                                  alt={message.sender.name}
                                />
                              </div>
                            </Link>
                          )}

                          <div
                            className={cn(
                              "flex flex-col",
                              isOwn && "items-end",
                            )}
                          >
                            {!isConsecutive && !isOwn && (
                              <span className="text-xs text-neutral-dark-grey mb-1 ml-1 pup-body-sm-500">
                                {message.sender.name}
                              </span>
                            )}

                            <div
                              className={cn(
                                "max-w-[280px] rounded-2xl px-4 py-2",
                                isOwn
                                  ? "bg-dark-blue text-white"
                                  : "bg-neutral-light-grey text-neutral-black",
                                !isConsecutive
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

                            {isLastFromUser && (
                              <span className="text-xs text-neutral-grey mt-1 px-1">
                                {new Date(message.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

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
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-primary-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>
    </div>
  );
}
