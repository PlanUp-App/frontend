import { PrimaryButton } from "@/components/Button/primary-filled";
import { CustomInput } from "@/components/CustomInput/input";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/utils/axios/axiosInstance";
import { Camera, Pencil } from "lucide-react";
import { ProfileAvatar } from "@/components/PreviewImage";
import { toast } from "sonner";
import { useAuth } from "@/auth/useAuth";
import z from "zod";
import { useGetProfile, useUpdateAccount } from "./-queries";
import { AxiosError } from "axios";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useForm } from "@mantine/form";

export const Route = createFileRoute("/_authenticated/profile/$userId/")({
  component: Index,
});

const updateSchema = z.object({
  name: z.string().min(2, { message: "Name must be atleast 2 characters" }),
  email: z.email(),
});

type UpdateForm = z.infer<typeof updateSchema>;

// function Index() {
//   const { user, updateUser } = useAuth();
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const { getInputProps, onSubmit, setValues } = useForm<UpdateForm>({
//     validate: zod4Resolver(updateSchema),
//     validateInputOnBlur: true,
//   });

//   useEffect(() => {
//     if (user?.name) {
//       setValues({ name: user.name, email: user.email });
//     }
//   }, [user]);

//   const updateAccountMutation = useUpdateAccount();

//   const handleSubmit = async ({ name }: UpdateForm) => {
//     updateAccountMutation.mutate(
//       { name },
//       {
//         onSuccess: (data) => {
//           toast.success("Update Successful");
//           updateUser(data);
//         },
//         onError: (err: unknown) => {
//           let message = "Something went wrong";
//           if (err instanceof AxiosError) {
//             message = err.response?.data?.message ?? err.message;
//           } else if (err instanceof Error) {
//             message = err.message;
//           }
//           console.log(err);
//           toast.error(message);
//         },
//       }
//     );
//   };

//   const uploadMutation = useMutation({
//     mutationFn: async (file: File) => {
//       const formData = new FormData();
//       formData.append("profilePicture", file);

//       const response = await axiosInstance.post(
//         "/users/profile-picture",
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );
//       return response.data;
//     },
//     onSuccess: (data) => {
//       updateUser({ profilePicture: data.user.profilePicture });
//       toast.success("Profile Picture Updated");
//     },
//     onError: (error) => {
//       console.error("Upload failed:", error);
//       toast.error(error.message);
//     },
//   });

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Validate file type
//     if (!file.type.startsWith("image/")) {
//       alert("Please select an image file");
//       return;
//     }

//     // Validate file size (5MB max)
//     if (file.size > 5 * 1024 * 1024) {
//       alert("File size must be less than 5MB");
//       return;
//     }

//     // Upload
//     uploadMutation.mutate(file);
//   };

//   const handleButtonClick = () => {
//     fileInputRef.current?.click();
//   };

//   return (
//     <div className="container">
//       <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
//         <div className="w-120 py-8 flex flex-col gap-8 h-fit px-8 shadow-lg rounded-lg">
//           {/* Profile Picture Section */}
//           <div className="flex justify-center -mt-4">
//             <div>
//               <h1 className="pup-heading-two text-neutral-black text-center">
//                 Edit Profile
//               </h1>
//             </div>
//           </div>
//           <div className="flex justify-center -mt-4">
//             <div className="relative inline-block">
//               <div className="relative group">
//                 {/* Profile Picture */}
//                 <ProfileAvatar
//                   src={user?.profilePicture}
//                   alt="Shlok Test"
//                   size="xl"
//                 />

//                 {/* Loading Overlay */}
//                 {uploadMutation.isPending && (
//                   <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
//                   </div>
//                 )}

//                 {/* Hover Overlay */}
//                 {!uploadMutation.isPending && (
//                   <div
//                     className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100
//                       transition-opacity flex items-center justify-center cursor-pointer"
//                     onClick={handleButtonClick}
//                   >
//                     <Camera className="text-white" size={24} />
//                   </div>
//                 )}
//               </div>

//               {/* Edit Button */}
//               <button
//                 type="button"
//                 onClick={handleButtonClick}
//                 disabled={uploadMutation.isPending}
//                 className="w-10 h-10 absolute bottom-0 right-0 bg-primary-orange
//                  text-white rounded-full
//                  shadow-lg flex items-center justify-center
//                  disabled:bg-gray-400 disabled:cursor-not-allowed
//                  transition-colors border-4 border-white"
//               >
//                 <Pencil size={16} />
//               </button>
//             </div>
//           </div>

//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             className="hidden"
//           />

//           <form onSubmit={onSubmit(handleSubmit)}>
//             <CustomInput
//               className="mb-6"
//               label="Name"
//               type="text"
//               placeholder="John Doe"
//               inputProps={getInputProps("name")}
//             />
//             <CustomInput
//               className="mb-6"
//               label="Email"
//               type="text"
//               placeholder="user@example.com"
//               disabled
//               inputProps={getInputProps("email")}
//             />
//             <PrimaryButton
//               title="Update"
//               className="uppercase w-full"
//               type="submit"
//             />
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

import { OutlineButton } from "@/components/Button/outline";
import PlanCard from "@/components/PlanCard";
import { Spinner } from "@/components/ui/spinner";

export default function Index() {
  const { userId } = Route.useParams();
  const { user } = useAuth();
  if (!userId || !user) return;

  const isSelf = userId === user?.id;
  const { data, isLoading } = useGetProfile(userId);

  if (isLoading)
    return (
      <div className="flex justify-center mt-24">
        <Spinner />
      </div>
    );
  if (!data) return null;

  return (
    <div>
      {/* Cover Image */}
      <div className="relative h-80 overflow-hidden bg-neutral-900 bg-linear-to-r from-orange-200 via-orange-400 to-orange-600">
        {data.coverImage && (
          <img
            src={data.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Card */}
      <div className="container bg-white border border-off-white rounded-b-2xl px-8 pb-8">
        <div className="flex items-end justify-between">
          <div className="-mt-16 z-10">
            <ProfileAvatar
              src={data.profilePicture}
              alt={data.name}
              size="xl"
            />
          </div>
          {isSelf && (
            <OutlineButton
              title="Edit Profile"
              className="border-neutral-light-grey text-neutral-dark-grey"
            />
          )}
        </div>

        <div className="mt-3 mb-6">
          <h1 className="pup-heading-three text-neutral-black">{data.name}</h1>
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
                  coverImage={plan.coverImage || undefined}
                  name={plan.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
