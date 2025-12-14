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
import { useUpdateAccount } from "./-queries";
import { AxiosError } from "axios";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useForm } from "@mantine/form";

export const Route = createFileRoute("/_authenticated/my-account/")({
  component: Index,
});

const updateSchema = z.object({
  name: z.string().min(2, { message: "Name must be atleast 2 characters" }),
  email: z.email(),
});

type UpdateForm = z.infer<typeof updateSchema>;

function Index() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getInputProps, onSubmit, setValues } = useForm<UpdateForm>({
    validate: zod4Resolver(updateSchema),
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (user?.name) {
      setValues({ name: user.name, email: user.email });
    }
  }, [user]);

  const updateAccountMutation = useUpdateAccount();

  const handleSubmit = async ({ name }: UpdateForm) => {
    updateAccountMutation.mutate(
      { name },
      {
        onSuccess: (data) => {
          toast.success("Update Successful");
          updateUser(data);
        },
        onError: (err: unknown) => {
          let message = "Something went wrong";
          if (err instanceof AxiosError) {
            message = err.response?.data?.message ?? err.message;
          } else if (err instanceof Error) {
            message = err.message;
          }
          console.log(err);
          toast.error(message);
        },
      }
    );
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await axiosInstance.post(
        "/users/profile-picture",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      updateUser({ profilePicture: data.user.profilePicture });
      toast.success("Profile Picture Updated");
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      toast.error(error.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Upload
    uploadMutation.mutate(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="container">
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="w-120 py-8 flex flex-col gap-8 h-fit px-8 shadow-lg rounded-lg">
          {/* Profile Picture Section */}
          <div className="flex justify-center -mt-4">
            <div>
              <h1 className="pup-heading-two text-neutral-black text-center">
                Edit Profile
              </h1>
            </div>
          </div>
          <div className="flex justify-center -mt-4">
            <div className="relative inline-block">
              <div className="relative group">
                {/* Profile Picture */}
                <ProfileAvatar
                  src={user?.profilePicture}
                  alt="Shlok Test"
                  size="xl"
                />

                {/* Loading Overlay */}
                {uploadMutation.isPending && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                  </div>
                )}

                {/* Hover Overlay */}
                {!uploadMutation.isPending && (
                  <div
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 
                      transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={handleButtonClick}
                  >
                    <Camera className="text-white" size={24} />
                  </div>
                )}
              </div>

              {/* Edit Button */}
              <button
                type="button"
                onClick={handleButtonClick}
                disabled={uploadMutation.isPending}
                className="w-10 h-10 absolute bottom-0 right-0 bg-primary-orange
                 text-white rounded-full 
                 shadow-lg flex items-center justify-center
                 disabled:bg-gray-400 disabled:cursor-not-allowed
                 transition-colors border-4 border-white"
              >
                <Pencil size={16} />
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <form onSubmit={onSubmit(handleSubmit)}>
            <CustomInput
              className="mb-6"
              label="Name"
              type="text"
              placeholder="John Doe"
              inputProps={getInputProps("name")}
            />
            <CustomInput
              className="mb-6"
              label="Email"
              type="text"
              placeholder="user@example.com"
              disabled
              inputProps={getInputProps("email")}
            />
            <PrimaryButton
              title="Update"
              className="uppercase w-full"
              type="submit"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
