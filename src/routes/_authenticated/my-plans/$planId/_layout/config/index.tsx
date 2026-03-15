import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { ImageIcon, X, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PrimaryButton } from "@/components/Button/primary-filled";
import { CustomInput } from "@/components/CustomInput/input";
import TextEditor from "@/components/TextEditor";
import axiosInstance from "@/utils/axios/axiosInstance";
import { queryClient } from "@/utils/queryclient/queryClient";
import { useGetPlan } from "./-queries";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$planId/_layout/config/",
)({
  component: RouteComponent,
});

// ── Schemas ───────────────────────────────────────────────────────────────────

const settingsSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  maxMembers: z
    .number({ error: "Must be a number" })
    .int()
    .min(1, { message: "Must be at least 1" })
    .optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

// ── Component ─────────────────────────────────────────────────────────────────

function RouteComponent() {
  const { planId } = Route.useParams();
  const { data: plan, isLoading } = useGetPlan(planId);

  const [description, setDescription] = useState(plan?.description ?? "");
  const [isPublic, setIsPublic] = useState(plan?.visibility === "PUBLIC");
  const [acceptJoinRequest, setAcceptJoinRequest] = useState(
    plan?.config?.acceptJoinRequest ?? false,
  );

  // Cover image
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setCoverFile(file);
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
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
  };

  const form = useForm<SettingsForm>({
    initialValues: {
      name: plan?.name ?? "",
      maxMembers: plan?.config?.maxMembers ?? 100,
    },
    validate: zod4Resolver(settingsSchema),
    validateInputOnBlur: true,
  });

  const updateMutation = useMutation({
    mutationFn: async (values: SettingsForm) => {
      let coverImageUrl: string | undefined;

      if (coverFile) {
        const formData = new FormData();
        formData.append("file", coverFile);
        const uploadRes = await axiosInstance.post(
          "/plans/upload/cover",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        coverImageUrl = uploadRes.data.url;
      }

      const res = await axiosInstance.patch(`/plans/${planId}`, {
        name: values.name,
        description,
        visibility: isPublic ? "PUBLIC" : "PRIVATE",
        ...(coverImageUrl && { coverImage: coverImageUrl }),
        config: {
          maxMembers: values.maxMembers,
          acceptJoinRequest,
        },
      });

      return res.data;
    },
    onSuccess: () => {
      toast.success("Plan updated successfully");
      queryClient.invalidateQueries({ queryKey: ["plan", planId] });
      setCoverFile(null);
      setCoverPreview(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    updateMutation.mutate(values);
  });

  if (isLoading) return <span>Loading...</span>;
  if (!plan) return null;

  const currentCover = coverPreview ?? plan.coverImage;

  return (
    <form onSubmit={handleSubmit} className="mb-80">
      <div className="flex justify-between items-center mb-12">
        <h1 className="pup-heading-three">Settings</h1>
        <PrimaryButton
          title="Save Changes"
          type="submit"
          isLoading={updateMutation.isPending || isLoading}
        />
      </div>
      <div className="flex flex-col gap-10 max-w-2xl">
        {/* Cover Image */}
        <div>
          <label className="pup-body-md-500 block text-neutral-black mb-1.5">
            Cover Image
          </label>
          <div
            {...getRootProps()}
            className={cn(
              "relative flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
              isDragActive
                ? "border-primary-orange bg-orange-50"
                : "border-neutral-200 hover:border-primary-orange/50 hover:bg-neutral-50",
              currentCover && "border-transparent hover:border-transparent",
            )}
          >
            <input {...getDropzoneInputProps()} />
            {currentCover ? (
              <>
                <img
                  src={currentCover}
                  alt="Cover"
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
        </div>

        {/* Name */}
        <CustomInput
          label="Plan Name"
          type="text"
          placeholder="Plan Name"
          inputProps={form.getInputProps("name", { mode: "controlled" })}
        />

        {/* Description */}
        <div>
          <label className="pup-body-md-500 block text-neutral-black mb-1.5">
            Description
          </label>
          <TextEditor content={description} setContent={setDescription} />
        </div>

        <div className="border-t border-off-white" />

        {/* Visibility */}
        <div>
          <p className="pup-body-md-500 text-neutral-black mb-4">Visibility</p>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Globe size={16} className="text-neutral-dark-grey" />
              ) : (
                <Lock size={16} className="text-neutral-dark-grey" />
              )}
              <span className="pup-body-sm-400 text-neutral-dark-grey">
                {isPublic
                  ? "Public — anyone can find this plan"
                  : "Private — only members can access"}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic((prev) => !prev)}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors focus-visible:outline-none",
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
        </div>

        <div className="border-t border-off-white" />

        {/* Config */}
        <div>
          <p className="pup-body-md-500 text-neutral-black mb-6">
            Member Settings
          </p>
          <div className="flex flex-col gap-6">
            <CustomInput
              label="Max Members"
              type="number"
              placeholder="100"
              inputProps={form.getInputProps("maxMembers", {
                mode: "controlled",
              })}
            />

            {isPublic && (
              <div className="flex items-center justify-between px-1">
                <div>
                  <p className="pup-body-md-400 text-neutral-black">
                    Accepting Join Requests
                  </p>
                  <p className="pup-body-sm-400 text-neutral-grey mt-0.5">
                    Other users can send join requests. Only applicable for
                    public plans.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={acceptJoinRequest}
                  onClick={() => setAcceptJoinRequest((prev) => !prev)}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors focus-visible:outline-none shrink-0",
                    acceptJoinRequest ? "bg-primary-orange" : "bg-neutral-200",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      acceptJoinRequest && "translate-x-5",
                    )}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
