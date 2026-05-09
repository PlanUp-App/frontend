import { useState, useEffect, useRef } from "react";
import { MdClose, MdSend, MdChatBubbleOutline, MdKeyboardArrowDown } from "react-icons/md";
import { cn } from "@/lib/utils";
import { useChat, type Message } from "@/hooks/useChat";
import { ProfileAvatar } from "../PreviewImage";
import { Link } from "@tanstack/react-router";
import { MdAttachFile, MdInsertDriveFile, MdDownload, MdSearch } from "react-icons/md";
import AddFile from "../Files/add-file";
import { useGetFiles, type PlanFile } from "../Files/-queries";
import { useDebounce } from "../CustomInput/useDebounce";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Dialog, DialogContent } from "../ui/dialog";
import { X } from "lucide-react";
import { Spinner } from "../ui/spinner";

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

function SeenInfoModal({
  isOpen,
  onClose,
  seenBy,
}: {
  isOpen: boolean;
  onClose: () => void;
  seenBy: Message["messageSeens"];
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-[280px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="px-4 py-3 border-b border-neutral-light-grey flex items-center justify-between bg-neutral-50">
          <h4 className="pup-body-sm-700 text-neutral-black">Seen by</h4>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-light-grey rounded-full transition-colors"
          >
            <MdClose className="size-5 text-neutral-grey" />
          </button>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
          {seenBy.length === 0 ? (
            <p className="text-center py-8 text-neutral-grey pup-body-sm-400">
              No one has seen this yet.
            </p>
          ) : (
            seenBy.map((seen) => (
              <div
                key={seen.userId}
                className="flex items-center gap-3 p-2 hover:bg-neutral-light-grey rounded-xl transition-colors"
              >
                <ProfileAvatar
                  src={seen.user.profilePicture}
                  alt={seen.user.name}
                  size="sm"
                />
                <div className="flex flex-col min-w-0">
                  <span className="pup-body-sm-600 truncate text-neutral-black">
                    {seen.user.name}
                  </span>
                  <span className="text-[10px] text-neutral-grey">
                    {new Date(seen.seenAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PlanFile[]>([]);
  const [fileSearch, setFileSearch] = useState("");
  const [file, setFile] = useState<PlanFile | null>(null);
  const debouncedSearch = useDebounce(fileSearch, 300);

  const { data: filesData, isLoading: isFilesLoading } = useGetFiles({
    planId,
    search: debouncedSearch,
    page: 1,
    limit: 20,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
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
    if (!input.trim() && pendingFiles.length === 0) return;
    sendMessage(
      input,
      pendingFiles.map((f) => f.id),
      pendingFiles,
    );
    setInput("");
    setPendingFiles([]);
  };

  const addPendingFile = (file: PlanFile) => {
    if (pendingFiles.some((f) => f.id === file.id)) return;
    setPendingFiles((prev) => [...prev, file]);
  };

  const removePendingFile = (fileId: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const groupedMessages = groupMessagesByDay(messages);

  return (
    <><Dialog open={!!file} onOpenChange={() => setFile(null)}>
      <DialogContent className="max-w-4xl p-2 sm:p-4" showCloseButton={false}>
        <button
          type="button"
          onClick={() => setFile(null)}
          className="cursor-pointer absolute top-2 right-2 p-1 rounded-full bg-neutral-light-grey hover:bg-neutral-light-grey/80 text-neutral-dark-grey transition-colors"
          aria-label="Close image preview"
        >
          <X size={14} />
        </button>
        {file && <img
          src={file.url}
          alt={file.name}
          className="w-full max-h-[80vh] object-contain rounded-lg" />
        }
      </DialogContent>
    </Dialog>
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
        {isOpen && (
          <div className="mb-4 w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-8rem)] sm:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
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
                <MdKeyboardArrowDown className="size-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!connected ? <div className="flex items-center justify-center h-full">
                <Spinner />
                <p className="text-neutral-grey pup-body-sm-400">
                  Connecting to chat...
                </p>
              </div> : messages.length === 0 ? (
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
                        const isConsecutive = index > 0 &&
                          group.messages[index - 1].senderId ===
                          message.senderId &&
                          new Date(message.createdAt).getTime() -
                          new Date(
                            group.messages[index - 1].createdAt
                          ).getTime() <
                          10 * 60 * 1000;
                        const isLastFromUser = index === group.messages.length - 1 ||
                          group.messages[index + 1].senderId !== message.senderId;

                        return (
                          <div
                            key={message.id}
                            className={cn(
                              "flex gap-2",
                              isOwn ? "flex-row-reverse" : "flex-row",
                              isConsecutive && !isOwn && "ml-12"
                            )}
                          >
                            {!isConsecutive && !isOwn && (
                              <Link to={`/profile/${message.sender.id}`}>
                                <div className="flex-shrink-0 mt-1">
                                  <ProfileAvatar
                                    src={message.sender.profilePicture}
                                    alt={message.sender.name} />
                                </div>
                              </Link>
                            )}

                            <div
                              className={cn(
                                "flex flex-col gap-1",
                                isOwn && "items-end"
                              )}
                            >
                              {!isConsecutive && !isOwn && (
                                <span className="text-xs text-neutral-dark-grey mb-1 ml-1 pup-body-sm-500">
                                  {message.sender.name}
                                </span>
                              )}

                              {/* Images — outside the bubble, Instagram-style */}
                              {message.files && message.files.filter(f => f.mimeType?.startsWith("image/")).length > 0 && (
                                <div className={cn(
                                  "mt-1 max-w-[240px]",
                                  message.files.filter(f => f.mimeType?.startsWith("image/")).length > 1
                                    ? "grid grid-cols-2 gap-1"
                                    : "flex flex-col gap-1"
                                )}>
                                  {message.files
                                    .filter(f => f.mimeType?.startsWith("image/"))
                                    .map((file) => (
                                      <img
                                        key={file.id}
                                        src={file.url}
                                        alt={file.name}
                                        className="w-[240px] max-h-[300px] h-full object-cover rounded-2xl cursor-pointer"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setFile(file);
                                        }}
                                      />
                                    ))}
                                </div>
                              )}

                              {/* Non-image files — also outside the bubble */}
                              {message.files?.filter(f => !f.mimeType?.startsWith("image/")).map((file) => (
                                <a
                                  key={file.id}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "flex items-center gap-2 p-4 rounded-xl border text-xs min-w-0 max-w-[240px] mt-1",
                                    isOwn
                                      ? "bg-dark-blue/10 border-dark-blue/20 text-neutral-black"
                                      : "bg-white border-neutral-light-grey text-neutral-black"
                                  )}
                                >
                                  <MdInsertDriveFile className="shrink-0 size-4 text-neutral-grey" />
                                  <span className="truncate flex-1">{file.name}</span>
                                  <MdDownload className="shrink-0 size-4 opacity-60" />
                                </a>
                              ))}

                              {message.content && (
                                <div
                                  className={cn(
                                    "max-w-[280px] w-fit rounded-2xl px-4 py-2 transition-opacity duration-200",
                                    isOwn
                                      ? "bg-dark-blue text-white"
                                      : "bg-neutral-light-grey text-neutral-black",
                                    !isConsecutive
                                      ? isOwn ? "rounded-tr-sm" : "rounded-tl-sm"
                                      : "",
                                    message.status === "sending" && "opacity-60"
                                  )}
                                >
                                  <p className="pup-body-sm-400 break-words whitespace-pre-wrap">
                                    {message.content}
                                  </p>
                                </div>
                              )}

                              {isLastFromUser && (
                                <div
                                  className={cn(
                                    "flex items-center gap-2 mt-1 px-1",
                                    isOwn && "flex-row-reverse"
                                  )}
                                >
                                  <span className="text-xs text-neutral-grey">
                                    {new Date(message.createdAt).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </span>

                                  {message.messageSeens?.filter(
                                    (s) => s.userId !== currentUserId
                                  ).length > 0 && (
                                      <div
                                        onClick={() => setSelectedMessage(message)}
                                        className={cn(
                                          "flex -space-x-1.5 cursor-pointer hover:opacity-80 transition-opacity items-center",
                                          isOwn ? "mr-1" : "ml-1"
                                        )}
                                      >
                                        {message.messageSeens
                                          .filter((s) => s.userId !== currentUserId)
                                          .slice(0, 5)
                                          .map((seen) => (
                                            <ProfileAvatar
                                              key={seen.userId}
                                              src={seen.user.profilePicture}
                                              alt={seen.user.name}
                                              size="xxs"
                                              className="border-[1.5px] border-white" />
                                          ))}
                                        {message.messageSeens.filter(
                                          (s) => s.userId !== currentUserId
                                        ).length > 5 && (
                                            <span className="text-[10px] text-neutral-grey ml-2 bg-neutral-light-grey rounded-full px-1.5 py-0.5">
                                              +
                                              {message.messageSeens.filter(
                                                (s) => s.userId !== currentUserId
                                              ).length - 5}
                                            </span>
                                          )}
                                      </div>
                                    )}
                                </div>
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

            <SeenInfoModal
              isOpen={!!selectedMessage}
              onClose={() => setSelectedMessage(null)}
              seenBy={selectedMessage?.messageSeens.filter(
                (s) => s.userId !== currentUserId
              ) || []} />

            {/* Input */}
            <div className="border-t border-neutral-light-grey p-4 space-y-3">
              {pendingFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pb-2">
                  {pendingFiles.map((file) => (
                    <div
                      key={file.id}
                      className="relative flex items-center gap-2 p-2 bg-neutral-light-grey rounded-xl group"
                    >
                      {file.mimeType?.startsWith("image/") ? (
                        <img src={file.url} className="size-8 rounded-lg object-cover" />
                      ) : (
                        <MdInsertDriveFile className="size-5 text-neutral-grey" />
                      )}
                      <span className="text-xs max-w-[100px] truncate">{file.name}</span>
                      <button
                        onClick={() => removePendingFile(file.id)}
                        className="shrink-0"
                      >
                        <MdClose size={16} className="text-neutral-grey" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-end">
                <Popover open={isSelectionOpen} onOpenChange={setIsSelectionOpen}>
                  <PopoverTrigger asChild>
                    <button className="p-2 hover:bg-neutral-light-grey rounded-full transition-colors shrink-0 text-neutral-grey cursor-pointer">
                      <MdAttachFile className="size-6" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="top" align="start" className="w-64 p-2">
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setIsUploadOpen(true);
                          setIsSelectionOpen(false);
                        }}
                        className="w-full text-left p-2 hover:bg-neutral-light-grey rounded-lg transition-colors flex items-center gap-2"
                      >
                        <MdAttachFile className="size-5" />
                        <span className="pup-body-sm-500">Upload File</span>
                      </button>
                      <div className="border-t border-neutral-light-grey my-1 pt-1">
                        <div className="px-2 pb-1.5 flex items-center gap-2">
                          <MdSearch className="size-4 text-neutral-grey" />
                          <input
                            type="text"
                            placeholder="Search plan files..."
                            className="w-full text-xs outline-none bg-transparent"
                            value={fileSearch}
                            onChange={(e) => setFileSearch(e.target.value)} />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {isFilesLoading ? (
                            <div className="p-4 text-center text-xs text-neutral-grey">Loading...</div>
                          ) : filesData?.data.length === 0 ? (
                            <div className="p-4 text-center text-xs text-neutral-grey">No files found</div>
                          ) : (
                            filesData?.data.map((file) => (
                              <button
                                key={file.id}
                                onClick={() => {
                                  addPendingFile(file);
                                  setIsSelectionOpen(false);
                                }}
                                className="w-full text-left p-2 hover:bg-neutral-light-grey rounded-lg transition-colors flex items-center gap-2"
                              >
                                <MdInsertDriveFile className="size-4 text-neutral-grey shrink-0" />
                                <span className="text-xs truncate">{file.name}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-neutral-grey rounded-2xl focus:outline-none focus:border-dark-blue pup-body-sm-400 resize-none max-h-32 min-h-[40px] overflow-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-100 [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-thumb]:rounded-full"
                  rows={1} />

                <button
                  onClick={handleSend}
                  disabled={!input.trim() && pendingFiles.length === 0}
                  className="bg-dark-blue text-white rounded-full p-2.5 hover:bg-dark-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                >
                  <MdSend className="ml-[2px] size-5" />
                </button>
              </div>
            </div>

            <AddFile
              open={isUploadOpen}
              onOpenChange={setIsUploadOpen}
              planId={planId}
              onUploaded={addPendingFile} />
          </div>
        )}

        {/* Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "bg-dark-blue text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all relative cursor-pointer",
            isOpen && "hidden"
          )}
        >
          <MdChatBubbleOutline className="size-6" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-primary-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </button>
      </div></>
  );
}
