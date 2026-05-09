import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios/axiosInstance";
import { Camera, Pencil, Users, Globe, ArrowUpRight } from "lucide-react";
import { ProfileAvatar } from "@/components/PreviewImage";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import PlanCard from "@/components/PlanCard";
import { Spinner } from "@/components/ui/spinner";
import { EditProfileDialog } from "@/components/Modals/edit-profile";
import { queryClient } from "@/utils/queryclient/queryClient";
import { useGetProfile } from "./-queries";
import { ReportButton } from "@/components/Button/report-button";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/profile/$userId/")({
  component: Index,
});

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
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center">
        <Spinner className="w-12 h-12 text-orange-500" />
        <p className="mt-4 text-neutral-500 animate-pulse">
          Loading profile...
        </p>
      </div>
    );
  if (!data) return null;
  if (!userId) return null;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-neutral-50 font-sans pb-24">
        {/* HERO COVER SECTION */}
        <div className="relative h-[340px] lg:h-[420px] overflow-hidden group">
          {/* Cover image or gradient fallback */}
          <div className="absolute inset-0 z-0">
            {data.coverImage ? (
              <img
                src={data.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/20 to-transparent" />
          </div>

          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full -mr-32 -mt-32 z-0" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/15 blur-[100px] rounded-full -ml-16 -mb-16 z-0" />

          {/* Cover upload overlay — isSelf only */}
          {isSelf && (
            <div
              className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover:opacity-100
                transition-opacity duration-300 flex items-center justify-center cursor-pointer gap-3"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverImageMutation.isPending ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              ) : (
                <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                  <Camera className="text-white" size={18} />
                  <span className="text-white text-sm font-medium">
                    Change cover photo
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="container mx-auto px-6 lg:px-16 -mt-24 relative z-20">
          {/* Profile Header Card */}
          <div className="bg-white rounded-[2rem] p-8 lg:p-10 shadow-sm border border-neutral-100 mb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              {/* Avatar with upload overlay */}
              <div className="w-fit mx-auto -mt-24 md:-mt-28 relative group/avatar shrink-0">
                <div className="rounded-full ring-4 ring-white shadow-xl">
                  <ProfileAvatar
                    src={data.profilePicture}
                    alt={data.name}
                    size="xl"
                    className="w-36 h-36 lg:w-40 lg:h-40"
                  />
                </div>

                {isSelf && (
                  <>
                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100
                        transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                      onClick={() => profilePicInputRef.current?.click()}
                    >
                      {profilePicMutation.isPending ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                      ) : (
                        <Camera className="text-white" size={22} />
                      )}
                    </div>

                    {/* Pencil badge */}
                    {!profilePicMutation.isPending && (
                      <button
                        type="button"
                        onClick={() => profilePicInputRef.current?.click()}
                        className="w-10 h-10 absolute bottom-1 right-1 bg-orange-500 text-white
                          rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center
                          transition-all duration-300 border-3 border-white hover:bg-orange-600 hover:scale-110 cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Name + bio + actions */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-col items-center text-center md:flex-row md:items-start md:justify-between md:text-left gap-4">
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2 leading-tight">
                      {data.name}
                    </h1>
                    {data.bio && (
                      <p className="text-neutral-500 leading-relaxed max-w-xl text-[15px]">
                        {data.bio}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex justify-center">
                    {isSelf ? (
                      <>
                        <button
                          onClick={() => setEditOpen(true)}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-neutral-200 text-neutral-700
                            font-medium text-sm hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50
                            transition-all duration-300 cursor-pointer"
                        >
                          <Pencil size={14} />
                          Edit Profile
                        </button>
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
                </div>
              </div>
            </div>
          </div>

          {/* Stats + Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: Stats + Plans */}
            <div className="lg:col-span-2 space-y-8">
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-6">
                <div className="group bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100 transition-all duration-300 text-center">
                  <p className="text-4xl font-bold text-neutral-900 mb-1">
                    {data.totalPlansCreated}
                  </p>
                  <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider">
                    Plans Owned
                  </p>
                </div>
                <div className="group bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100 transition-all duration-300 text-center">
                  <p className="text-4xl font-bold text-neutral-900 mb-1">
                    {data.totalPlansJoined}
                  </p>
                  <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider">
                    Plans Joined
                  </p>
                </div>
              </div>

              {/* Public Plans Section */}
              <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-neutral-100">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-neutral-900">
                    Public Plans
                  </h2>
                  {data.publicPlans.length > 0 && (
                    <span className="px-4 py-1.5 rounded-full bg-neutral-50 text-neutral-500 text-xs font-bold">
                      {data.publicPlans.length} Total
                    </span>
                  )}
                </div>
                {data.publicPlans.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-50 flex items-center justify-center">
                      <Globe size={32} className="text-neutral-300" />
                    </div>
                    <p className="text-neutral-500 font-medium mb-1">
                      No public plans yet
                    </p>
                    <p className="text-sm text-neutral-400">
                      {isSelf
                        ? "Create a plan and set it to public to share with the community."
                        : "This user hasn't made any plans public yet."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

            {/* RIGHT COLUMN: Quick Info Sidebar */}
            <div className="space-y-8">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-neutral-100 sticky top-24">
                <h3 className="text-lg font-bold text-neutral-900 mb-6">
                  About
                </h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0">
                      <Users size={16} className="text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium mb-1">
                        Activity
                      </p>
                      <p className="text-sm text-neutral-700">
                        {data.totalPlansCreated + data.totalPlansJoined} total
                        plans
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0">
                      <Globe size={16} className="text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium mb-1">
                        Public Plans
                      </p>
                      <p className="text-sm text-neutral-700">
                        {data.publicPlans.length} shared with community
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick links to public plans */}
                {data.publicPlans.length > 0 && (
                  <>
                    <div className="border-t border-neutral-100 mt-6 pt-6">
                      <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium mb-4">
                        Featured Plans
                      </p>
                      <div className="space-y-3">
                        {data.publicPlans.slice(0, 3).map((plan) => (
                          <Link
                            key={plan.id}
                            to={`/public-plans/${plan.id}`}
                            className="group flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors duration-200"
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-orange-400 to-amber-500">
                              {plan.coverImage && (
                                <img
                                  src={plan.coverImage}
                                  alt={plan.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-orange-500 transition-colors">
                                {plan.name}
                              </p>
                              {plan.memberCount !== undefined && (
                                <p className="text-xs text-neutral-400">
                                  {plan.memberCount}{" "}
                                  {plan.memberCount === 1
                                    ? "member"
                                    : "members"}
                                </p>
                              )}
                            </div>
                            <ArrowUpRight
                              size={14}
                              className="text-neutral-300 group-hover:text-orange-500 transition-colors shrink-0"
                            />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
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
      <Footer />
    </>
  );
}
