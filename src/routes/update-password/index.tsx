import { PrimaryButton } from "@/components/Button/primary-filled";
import { CustomInput } from "@/components/CustomInput/input";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Navigation } from "@/components/Navigation";
import { useResetPassword } from "./-queries";
import { router } from "@/main";

export const Route = createFileRoute("/update-password/")({
  validateSearch: (search: Record<string, unknown>): { token?: string } => {
    return {
      token: search.token as string | undefined,
    };
  },
  beforeLoad: ({ search }) => {
    if (!search.token) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: Index,
});

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function Index() {
  const { token } = Route.useSearch();
  const [isLoading, setIsLoading] = useState(false);
  const resetPasswordMutation = useResetPassword();

  const { getInputProps, onSubmit } = useForm<ResetPasswordForm>({
    initialValues: { password: "", confirmPassword: "" },
    validate: zod4Resolver(resetPasswordSchema),
    validateInputOnBlur: true,
  });

  const handleSubmit = async ({ password }: ResetPasswordForm) => {
    if (!token) return;
    setIsLoading(true);
    resetPasswordMutation.mutate(
      { token, newPassword: password },
      {
        onSuccess: (data) => {
          toast.success(data.message || "Password updated successfully");
          router.navigate({ to: "/login" });
          setIsLoading(false);
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
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <>
      <Navigation />
      <div className="container">
        <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="w-120 pt-2 pb-6 flex flex-col gap-8 h-fit">
            <div>
              <h1 className="pup-heading-two mb-6 text-neutral-black text-center">
                Reset Password
              </h1>
              <p className="pup-body-md-400 text-neutral-black text-center">
                Please enter and confirm your new password below.
              </p>
            </div>

            <form onSubmit={onSubmit(handleSubmit)}>
              <CustomInput
                className="mb-6"
                label="New Password"
                type="password"
                placeholder="••••••••"
                inputProps={getInputProps("password")}
              />
              <CustomInput
                className="mb-8"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                inputProps={getInputProps("confirmPassword")}
              />
              <PrimaryButton
                isLoading={isLoading}
                title="Reset Password"
                className="uppercase w-full"
                type="submit"
              />
            </form>

            <div className="flex gap-1 justify-center">
              <p className="pup-body-md-400 text-neutral-black">
                Remember your password?
              </p>
              <Link
                to="/login"
                className="pup-body-md-500 text-primary-orange hover:underline"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
