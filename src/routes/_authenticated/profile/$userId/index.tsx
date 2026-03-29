import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios/axiosInstance";
import { Camera, Pencil } from "lucide-react";
import { ProfileAvatar } from "@/components/PreviewImage";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";

export const Route = createFileRoute("/_authenticated/profile/$userId/")({
  component: Index,
});

import { OutlineButton } from "@/components/Button/outline";
import PlanCard from "@/components/PlanCard";
import { Spinner } from "@/components/ui/spinner";
import { EditProfileDialog } from "@/components/Modals/edit-profile";
import { queryClient } from "@/utils/queryclient/queryClient";
import { useGetProfile } from "./-queries";
import { ReportButton } from "@/components/Button/report-button";
import { Navigation } from "@/components/Navigation";

export default function Index() {
  const { userId } = Route.useParams();
  const { user, updateUser } = useAuth();

  const isSelf = userId === user?.id;
  const { data, isLoading } = useGetProfile(userId);

  const [editOpen, setEditOpen] = useState(false);
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const profilePicMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profilePicture", file);
      const res = await axiosInstance.post("/users/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      updateUser({ profilePicture: data.user.profilePicture });
      toast.success("Profile picture updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const coverImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("coverImage", file);
      const res = await axiosInstance.post("/users/cover-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Cover image updated");
      // refetch profile to show new cover
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleFileSelect = (
    mutation: typeof profilePicMutation,
    file: File | undefined,
  ) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    mutation.mutate(file);
  };

  if (isLoading)
    return (
      <div className="flex justify-center mt-24">
        <Spinner />
      </div>
    );
  if (!data) return null;
  if (!userId || !user) return null;

  return (
    <>
      <Navigation />
      <div>
        {/* Cover Image */}
        <div className="relative h-80 overflow-hidden bg-neutral-900 bg-linear-to-r from-orange-200 via-orange-400 to-orange-600 group">
          {data.coverImage && (
            <img
              src={data.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}

          {/* Cover upload overlay — isSelf only */}
          {isSelf && (
            <div
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
              transition-opacity flex items-center justify-center cursor-pointer gap-2"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverImageMutation.isPending ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              ) : (
                <>
                  <Camera className="text-white" size={20} />
                  <span className="text-white text-sm font-medium">
                    Change cover photo
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="container bg-white border border-off-white rounded-b-2xl px-8 pb-8">
          <div className="flex items-end justify-between">
            {/* Avatar with upload overlay */}
            <div className="-mt-16 z-10 relative group/avatar">
              <ProfileAvatar
                src={data.profilePicture}
                alt={data.name}
                size="xl"
              />

              {isSelf && (
                <>
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100
                    transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => profilePicInputRef.current?.click()}
                  >
                    {profilePicMutation.isPending ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    ) : (
                      <Camera className="text-white" size={20} />
                    )}
                  </div>

                  {/* Pencil badge */}
                  {!profilePicMutation.isPending && (
                    <button
                      type="button"
                      onClick={() => profilePicInputRef.current?.click()}
                      className="w-8 h-8 absolute bottom-0 right-0 bg-primary-orange text-white
                      rounded-full shadow-lg flex items-center justify-center
                      transition-colors border-2 border-white hover:bg-orange-600"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                </>
              )}
            </div>

            {isSelf ? (
              <>
                <OutlineButton
                  title="Edit Profile"
                  className="border-neutral-light-grey text-neutral-dark-grey"
                  onClick={() => setEditOpen(true)}
                />
                <EditProfileDialog
                  open={editOpen}
                  onOpenChange={setEditOpen}
                  defaultValues={{
                    name: data.name,
                    bio: data.bio || "",
                  }}
                />
              </>
            ) : (
              <ReportButton userId={userId} userName={data.name} />
            )}
          </div>

          <div className="mt-3 mb-6">
            <h1 className="pup-heading-three text-neutral-black">
              {data.name}
            </h1>
            {data.bio && (
              <p className="pup-body-md-400 text-neutral-dark-grey mt-3 max-w-[50%] leading-relaxed">
                {data.bio}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-12">
            <div className="bg-neutral-50 rounded-xl p-4 text-center">
              <p className="pup-heading-two text-neutral-black">
                {data.totalPlansCreated}
              </p>
              <p className="pup-body-sm-400 text-neutral-grey mt-1">
                Plans owned
              </p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-4 text-center">
              <p className="pup-heading-two text-neutral-black">
                {data.totalPlansJoined}
              </p>
              <p className="pup-body-sm-400 text-neutral-grey mt-1">
                Plans joined
              </p>
            </div>
          </div>

          <div className="border-t border-off-white mb-12" />

          <div>
            <h2 className="pup-heading-three text-neutral-black mb-8">
              Public plans
            </h2>
            {data.publicPlans.length === 0 ? (
              <p className="pup-body-md-400 text-neutral-grey">
                No public plans yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6">
                {data.publicPlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    id={plan.id}
                    linkTo={`/public-plans/${plan.id}`}
                    coverImage={plan.coverImage || undefined}
                    name={plan.name}
                    isPublic={plan.visibility === "PUBLIC"}
                    memberCount={plan.memberCount}
                    members={[]}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={profilePicInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) =>
            handleFileSelect(profilePicMutation, e.target.files?.[0])
          }
        />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) =>
            handleFileSelect(coverImageMutation, e.target.files?.[0])
          }
        />
      </div>
    </>
  );
}
