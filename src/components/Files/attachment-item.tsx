import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileText, X } from "lucide-react";
import { useState } from "react";

type AttachmentFile = {
  id: string;
  name: string;
  url: string;
  mimeType?: string | null;
};

interface AttachmentItemProps {
  file: AttachmentFile;
  onRemove?: (fileId: string) => void;
}

function isImageFile(file: AttachmentFile) {
  const mimeType = file.mimeType?.toLowerCase() ?? "";
  if (mimeType.startsWith("image/")) return true;

  const source = `${file.name} ${file.url}`.toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/.test(source);
}

export default function AttachmentItem({ file, onRemove }: AttachmentItemProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isImage = isImageFile(file);

  const handleOpen = () => {
    if (isImage) {
      setIsPreviewOpen(true);
      return;
    }

    window.open(file.url, "_blank", "noopener,noreferrer");
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
        className="flex items-center justify-between rounded-lg border border-off-white px-3 py-2 cursor-pointer hover:bg-off-white/40 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-off-white text-neutral-dark-grey overflow-hidden">
            {isImage ? (
              <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
            ) : (
              <FileText size={14} />
            )}
          </div>
          <span className="pup-body-sm-400 text-neutral-black truncate">{file.name}</span>
        </div>

        {onRemove && (
          <button
            type="button"
            className="p-1 rounded-full text-neutral-grey hover:text-neutral-black"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(file.id);
            }}
            aria-label={`Remove ${file.name}`}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </>
  );
}
