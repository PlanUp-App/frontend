import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { CustomInput } from "../CustomInput/input";
import z from "zod";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { PrimaryButton } from "../Button/primary-filled";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios/axiosInstance";
import { queryClient } from "@/utils/queryclient/queryClient";
import { toast } from "sonner";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon, X, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import TextEditor from "../TextEditor";

interface CreatePlanDialog {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePlanDialog({ open, onOpenChange }: CreatePlanDialog) {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);

  const [description, setDescription] = useState("");

  const createPlanSchema = z.object({
    name: z
      .string()
      .nonempty()
      .min(2, { message: "Name must be atleast 2 characters" }),
  });
  type CreatePlanForm = z.infer<typeof createPlanSchema>;

  const { getInputProps, onSubmit, reset } = useForm<CreatePlanForm>({
    initialValues: { name: "" },
    validate: zod4Resolver(createPlanSchema),
    validateInputOnBlur: true,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  }, []);

  const {
    getRootProps,
    getInputProps: getDropzoneInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
  });

  const removeCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCoverImage(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
  };

  const createPlanMutation = useMutation({
    mutationFn: async (data: CreatePlanForm) => {
      let coverImageUrl: string | undefined;

      // upload cover image if provided
      if (coverImage) {
        const formData = new FormData();
        formData.append("file", coverImage);
        const uploadResponse = await axiosInstance.post(
          "/plans/upload/cover",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        coverImageUrl = uploadResponse.data.url;
      }

      // create the plan
      const response = await axiosInstance.post("/plans", {
        name: data.name,
        description,
        visibility: isPublic ? "PUBLIC" : "PRIVATE",
        ...(coverImageUrl && { coverImage: coverImageUrl }),
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPlans"] });
      toast.success("Plan Created Successfully");
      onOpenChange(false);
      reset();
      setCoverImage(null);
      setCoverPreview(null);
      setIsPublic(false);
      setDescription("");
    },
    onError: (error) => {
      toast.error("Failed to create plan");
      console.error(error);
    },
  });

  const handleSubmit = onSubmit((values) => {
    // console.log("Submit called", values);
    createPlanMutation.mutate(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="mb-2">
          <h3 className="pup-heading-three">Create New Plan</h3>
          <p className="pup-body-sm-400 text-neutral-dark-grey">
            You can always change this information later!
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Cover Image Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-neutral-200 hover:border-primary/50 hover:bg-neutral-50",
              coverPreview && "border-transparent hover:border-transparent",
            )}
          >
            <input {...getDropzoneInputProps()} />

            {coverPreview ? (
              <>
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-400">
                <ImageIcon size={28} />
                <span className="pup-body-sm-400">
                  {isDragActive ? "Drop image here" : "Upload cover image"}
                </span>
                <span className="text-xs text-neutral-300">
                  Drag & drop or click to browse
                </span>
              </div>
            )}
          </div>

          {/* Name */}
          <CustomInput
            type="text"
            label="Plan Name"
            placeholder="Plan Name"
            inputProps={getInputProps("name")}
          />

          {/* Description */}
          <div>
            <label className="pup-body-md-500 block text-neutral-black mb-1.5">
              Description
            </label>
            <TextEditor content={description} setContent={setDescription} />
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Globe size={16} className="text-neutral-dark-grey" />
              ) : (
                <Lock size={16} className="text-neutral-dark-grey" />
              )}
              <span className="pup-body-sm-400 text-neutral-dark-grey">
                {isPublic ? "Public" : "Private"}
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic((prev) => !prev)}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                isPublic ? "bg-primary-orange" : "bg-neutral-200",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  isPublic && "translate-x-5",
                )}
              />
            </button>
          </div>

          <PrimaryButton
            title="Create"
            className="uppercase w-full mt-2"
            type="submit"
            isLoading={createPlanMutation.isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
