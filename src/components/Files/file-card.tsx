import { ProfileAvatar } from "@/components/PreviewImage";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { PlanFile } from "./-queries";
import { format } from "date-fns";
import { Download, FileText, Trash2, X } from "lucide-react";
import { useState } from "react";

interface FileCardProps {
  file: PlanFile;
  canDelete?: boolean;
  isDeleting?: boolean;
  onDelete?: (fileId: string) => void;
}

function isPreviewableFile(file: PlanFile) {
  const mimeType = file.mimeType?.toLowerCase() ?? "";
  if (mimeType.startsWith("image/")) return true;
  if (mimeType === "application/pdf") return true;

  const source = `${file.name} ${file.url}`.toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg|pdf)(\?|$)/.test(source);
}

function isImageFile(file: PlanFile) {
  const mimeType = file.mimeType?.toLowerCase() ?? "";
  if (mimeType.startsWith("image/")) return true;

  const source = `${file.name} ${file.url}`.toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/.test(source);
}

function sanitizeBaseName(name: string) {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]+/g, "_");
  return cleaned || "download";
}

function getExtensionFromValue(value: string) {
  const match = value.toLowerCase().match(/\.([a-z0-9]+)(\?|#|$)/);
  return match?.[1] ?? "";
}

function extensionFromMime(mimeType: string) {
  const mime = mimeType.toLowerCase();
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/bmp") return "bmp";
  if (mime === "image/svg+xml") return "svg";
  if (mime === "application/pdf") return "pdf";
  if (mime === "text/plain") return "txt";
  if (mime === "text/csv") return "csv";
  if (mime === "application/zip") return "zip";
  return "";
}

function resolveDownloadFileName(file: PlanFile, responseMimeType?: string) {
  const sourceName = sanitizeBaseName(file.name);
  const baseNameWithoutExt = sourceName.replace(/\.[a-z0-9]+$/i, "");

  const nameExt = getExtensionFromValue(sourceName);
  const urlExt = getExtensionFromValue(file.url);
  const mimeExt = extensionFromMime(responseMimeType || file.mimeType || "");

  let resolvedExt = nameExt || mimeExt || urlExt;

  if (resolvedExt === "jpeg" || (resolvedExt === "jfif" && mimeExt === "jpg")) {
    resolvedExt = "jpg";
  }

  if (!resolvedExt) return baseNameWithoutExt || sourceName;
  return `${baseNameWithoutExt || sourceName}.${resolvedExt}`;
}

export default function FileCard({
  file,
  canDelete = false,
  isDeleting = false,
  onDelete,
}: FileCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isImage = isImageFile(file);

  const uploadedAt = new Date(file.createdAt);
  const formattedDate = Number.isNaN(uploadedAt.getTime())
    ? "-"
    : format(uploadedAt, "MMM d, yyyy h:mm a");

  const handleDownload = async () => {
    try {
      const response = await fetch(file.url, { mode: "cors" });
      if (!response.ok) {
        throw new Error("Download request failed");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = resolveDownloadFileName(file, blob.type);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(blobUrl);
      return;
    } catch {
      const anchor = document.createElement("a");
      anchor.href = file.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  };

  const handleOpen = () => {
    if (isImage) {
      setIsPreviewOpen(true);
      return;
    }

    if (isPreviewableFile(file)) {
      window.open(file.url, "_blank", "noopener,noreferrer");
      return;
    }

    void handleDownload();
  };

  return (
    <>
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl p-2 sm:p-4" showCloseButton={false}>
          <button
            type="button"
            onClick={() => setIsPreviewOpen(false)}
            className="cursor-pointer absolute top-2 right-2 p-1 rounded-full bg-neutral-light-grey hover:bg-neutral-light-grey/80 text-neutral-dark-grey transition-colors"
            aria-label="Close image preview"
          >
            <X size={14} />
          </button>
          <img
            src={file.url}
            alt={file.name}
            className="w-full max-h-[80vh] object-contain rounded-lg"
          />
        </DialogContent>
      </Dialog>

      <div
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen();
          }
        }}
        className="group flex w-full items-center justify-between rounded-xl border border-off-white bg-white p-4 gap-4 text-left cursor-pointer hover:bg-off-white/40 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-off-white text-neutral-dark-grey overflow-hidden">
            {isImage ? (
              <img
                src={file.url}
                alt={file.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <FileText size={18} />
            )}
          </div>
          <div className="min-w-0">
            <p className="pup-body-md-500 text-neutral-black truncate">
              {file.name}
            </p>
            <p className="pup-body-sm-400 text-neutral-grey">
              Uploaded: {formattedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {canDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(file.id);
              }}
              disabled={isDeleting}
              className="cursor-pointer inline-flex items-center gap-1 rounded-full border border-red-100 bg-white px-3 py-1.5 pup-body-sm-400 text-red-500 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void handleDownload();
            }}
            className="cursor-pointer inline-flex items-center gap-1 rounded-full border border-off-white bg-white px-3 py-1.5 pup-body-sm-400 text-neutral-dark-grey opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto hover:text-neutral-black"
          >
            <Download size={14} />
            Download
          </button>
          <ProfileAvatar
            src={file.uploader?.profilePicture}
            alt={file.uploader?.name ?? "Uploader"}
            size="sm"
          />
          <span className="pup-body-sm-400 text-neutral-dark-grey max-w-36 truncate">
            {file.uploader?.name ?? "Unknown"}
          </span>
        </div>
      </div>
    </>
  );
}
