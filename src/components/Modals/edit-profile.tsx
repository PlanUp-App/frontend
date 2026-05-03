import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { CustomInput } from "../CustomInput/input";
import z from "zod";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { PrimaryButton } from "../Button/primary-filled";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateAccount } from "@/routes/profile/$userId/-queries";
import { useAuth } from "@/auth/useAuth";
import { AxiosError } from "axios";
import axiosInstance from "@/utils/axios/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/utils/queryclient/queryClient";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: {
    name: string;
    email?: string;
    bio?: string;
  };
}

type Tab = "profile" | "password";

// ── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  bio: z
    .string()
    .max(200, { message: "Bio must be under 200 characters" })
    .optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

// ── Component ─────────────────────────────────────────────────────────────────

export function EditProfileDialog({
  open,
  onOpenChange,
  defaultValues,
}: EditProfileDialogProps) {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");
  // Profile form
  const profileForm = useForm<ProfileForm>({
    initialValues: { name: defaultValues.name, bio: defaultValues.bio ?? "" },
    validate: zod4Resolver(profileSchema),
    validateInputOnBlur: true,
  });

  // Password form
  const passwordForm = useForm<PasswordForm>({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: zod4Resolver(passwordSchema),
    validateInputOnBlur: true,
  });

  // Sync if defaultValues change (e.g. after a refetch)
  useEffect(() => {
    profileForm.setValues({
      name: defaultValues.name,
      bio: defaultValues.bio ?? "",
    });
  }, [defaultValues.name, defaultValues.bio]);

  // Reset forms + tab on close
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      profileForm.reset();
      passwordForm.reset();
      setTab("profile");
    }
    onOpenChange(next);
  };

  // ── Mutations ───────────────────────────────────────────────────────────────
  if (!user) return;
  const updateAccountMutation = useUpdateAccount(user?.id);

  const handleProfileSubmit = profileForm.onSubmit(({ name, bio }) => {
    updateAccountMutation.mutate(
      { name, bio },
      {
        onSuccess: (data) => {
          updateUser(data.user);
          toast.success("Profile updated");
          handleOpenChange(false);
          queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
        },
        onError: (err: unknown) => {
          const message =
            err instanceof AxiosError
              ? (err.response?.data?.message ?? err.message)
              : err instanceof Error
                ? err.message
                : "Something went wrong";
          toast.error(message);
        },
      },
    );
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      const response = await axiosInstance.post("/users/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password changed");
      handleOpenChange(false);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof AxiosError
          ? (err.response?.data?.message ?? err.message)
          : err instanceof Error
            ? err.message
            : "Something went wrong";
      toast.error(message);
    },
  });

  const handlePasswordSubmit = passwordForm.onSubmit((values) => {
    changePasswordMutation.mutate(values);
  });

  // ── Render ──────────────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User size={15} /> },
    { id: "password", label: "Password", icon: <Lock size={15} /> },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-0 gap-0 overflow-hidden max-w-lg">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-neutral-100">
          <h3 className="pup-heading-three">Edit Profile</h3>
          <p className="pup-body-sm-400 text-neutral-dark-grey">
            Changes are saved immediately.
          </p>
        </DialogHeader>

        {/* Tab bar */}
        <div className="flex border-b border-neutral-100">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 pup-body-sm-400 transition-colors border-b-2 -mb-px",
                tab === t.id
                  ? "border-primary-orange text-primary-orange"
                  : "border-transparent text-neutral-400 hover:text-neutral-700",
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Profile */}
        {tab === "profile" && (
          <form
            onSubmit={handleProfileSubmit}
            className="flex flex-col gap-4 px-6 py-6"
          >
            <CustomInput
              label="Name"
              type="text"
              placeholder="John Doe"
              inputProps={profileForm.getInputProps("name", {
                mode: "controlled",
              })}
            />
            <CustomInput
              label="Email"
              type="text"
              placeholder={user.email}
              disabled
            />
            <div>
              <label className="pup-body-md-500 block text-neutral-black mb-1.5">
                Bio
              </label>
              <textarea
                placeholder="Tell people a little about yourself…"
                maxLength={200}
                rows={3}
                className={cn(
                  "w-full rounded-xl border border-neutral-200 px-4 py-3",
                  "pup-body-md-400 text-neutral-black placeholder:text-neutral-300",
                  "resize-none focus:outline-none focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange",
                  "transition-colors",
                )}
                {...profileForm.getInputProps("bio")}
              />
              <div className="flex justify-between mt-1">
                {profileForm.errors.bio ? (
                  <p className="text-xs text-red-500">
                    {profileForm.errors.bio}
                  </p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-neutral-300 ml-auto">
                  {(profileForm.values.bio ?? "").length}/200
                </p>
              </div>
            </div>

            <PrimaryButton
              title="Save Changes"
              className="uppercase w-full mt-2"
              type="submit"
              isLoading={updateAccountMutation.isPending}
            />
          </form>
        )}

        {/* Tab: Password */}
        {tab === "password" && (
          <form
            onSubmit={handlePasswordSubmit}
            className="flex flex-col gap-4 px-6 py-6"
          >
            <CustomInput
              label="Current Password"
              type="password"
              inputProps={passwordForm.getInputProps("currentPassword")}
            />
            <CustomInput
              label="New Password"
              type="password"
              inputProps={passwordForm.getInputProps("newPassword")}
            />
            <CustomInput
              label="Confirm New Password"
              type="password"
              inputProps={passwordForm.getInputProps("confirmPassword")}
            />

            <PrimaryButton
              title="Change Password"
              className="uppercase w-full mt-2"
              type="submit"
              isLoading={changePasswordMutation.isPending}
            />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
