import { useCallback, useMemo, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { PrimaryButton } from "@/components/Button/primary-filled";
import { useUploadFile } from "./-queries";

interface AddFileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
}

const CLOUDINARY_ACCEPTED_TYPES: Record<string, string[]> = {
  "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"],
  "application/pdf": [".pdf"],
};

const CLOUDINARY_ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "svg",
  "pdf",
]);

function isCloudinaryAllowedFile(file: File) {
  const mimeType = file.type?.toLowerCase() ?? "";
  if (mimeType.startsWith("image/")) return true;
  if (Object.keys(CLOUDINARY_ACCEPTED_TYPES).includes(mimeType)) return true;

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return CLOUDINARY_ALLOWED_EXTENSIONS.has(extension);
}

function withOriginalExtension(name: string, originalFileName: string) {
  const trimmedName = name.trim();
  const originalExtension = originalFileName.split(".").pop()?.toLowerCase();
  if (!originalExtension) return trimmedName;

  const hasExtension = /\.[a-z0-9]+$/i.test(trimmedName);
  if (hasExtension) return trimmedName;
  return `${trimmedName}.${originalExtension}`;
}

export default function AddFile({ open, onOpenChange, planId }: AddFileProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const uploadMutation = useUploadFile(planId);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!isCloudinaryAllowedFile(file)) {
      toast.error("Unsupported file type for Cloudinary upload");
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
  }, []);

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const hasFileTypeError = rejections.some((rejection) =>
      rejection.errors.some((error) => error.code === "file-invalid-type"),
    );

    if (hasFileTypeError) {
      toast.error("Only Cloudinary-supported file types are allowed");
      return;
    }

    toast.error("Could not upload selected file");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: CLOUDINARY_ACCEPTED_TYPES,
    maxFiles: 1,
    multiple: false,
  });

  const fileSizeLabel = useMemo(() => {
    if (!selectedFile?.size) return "";
    const mb = selectedFile.size / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }, [selectedFile]);

  const resetState = () => {
    setSelectedFile(null);
    setFileName("");
    uploadMutation.reset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setFileName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!isCloudinaryAllowedFile(selectedFile)) {
      toast.error("Only Cloudinary-supported file types are allowed");
      return;
    }

    const baseName = fileName.trim() || selectedFile.name;
    const resolvedName = withOriginalExtension(baseName, selectedFile.name);

    uploadMutation.mutate(
      { file: selectedFile, name: resolvedName },
      {
        onSuccess: () => {
          toast.success("File uploaded successfully");
          handleOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ?? "Failed to upload file",
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader className="mb-2">
          <h3 className="pup-heading-three">Upload File</h3>
          <p className="pup-body-sm-400 text-neutral-dark-grey">
            Drag and drop your file or click to browse.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div
            {...getRootProps()}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-neutral-200 hover:border-primary/50 hover:bg-neutral-50",
              selectedFile && "border-transparent hover:border-transparent",
            )}
          >
            <input {...getInputProps()} />

            {selectedFile ? (
              <>
                <div className="flex flex-col items-center gap-1 text-neutral-dark-grey">
                  <FileText size={28} />
                  <span className="pup-body-sm-400 max-w-72 truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {fileSizeLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-400">
                <UploadCloud size={28} />
                <span className="pup-body-sm-400">
                  {isDragActive ? "Drop file here" : "Upload file"}
                </span>
                <span className="text-xs text-neutral-300">
                  Allowed: images, PDF
                </span>
              </div>
            )}
          </div>

          {selectedFile && (
            <div>
              <label className="pup-body-md-500 block text-neutral-black mb-1.5">
                File Name
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="File name"
                className="border-neutral-light-grey border pup-body-medium-400 placeholder:text-neutral-grey text-neutral-black rounded-xl px-3.5 py-2.5 w-full"
              />
            </div>
          )}

          <PrimaryButton
            title="Upload"
            className="uppercase w-full mt-2"
            type="submit"
            isLoading={uploadMutation.isPending}
            disabled={!selectedFile}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
