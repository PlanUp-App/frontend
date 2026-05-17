import { PrimaryButton } from "@/components/Button/primary-filled";
import { CustomInput } from "@/components/CustomInput/input";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Navigation } from "@/components/Navigation";
import { useForgotPassword } from "./-queries";

export const Route = createFileRoute("/forgot-password/")({
  component: Index,
});

const forgotPasswordSchema = z.object({
  email: z.email("Invalid Email"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const { getInputProps, onSubmit } = useForm<ForgotPasswordForm>({
    initialValues: { email: "" },
    validate: zod4Resolver(forgotPasswordSchema),
    validateInputOnBlur: true,
  });

  const handleSubmit = async ({ email }: ForgotPasswordForm) => {
    setIsLoading(true);
    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: (data) => {
          toast.success(data.message || "Password reset link sent successfully");
          setIsSubmitted(true);
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
                Forgot Password
              </h1>
              <p className="pup-body-md-400 text-neutral-black text-center">
                {isSubmitted
                  ? "We've sent a password reset link to your email. Please check your inbox (and spam folder)."
                  : "Enter your email address and we will send you a link to reset your password."}
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={onSubmit(handleSubmit)}>
                <CustomInput
                  className="mb-8"
                  label="Email Address"
                  type="text"
                  placeholder="user@example.com"
                  inputProps={getInputProps("email")}
                />
                <PrimaryButton
                  isLoading={isLoading}
                  title="Send Reset Link"
                  className="uppercase w-full"
                  type="submit"
                />
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <PrimaryButton
                  title="Back to Login"
                  className="uppercase w-full"
                  link="/login"
                />
              </div>
            )}

            <div className="flex gap-1 justify-center">
              <p className="pup-body-md-400 text-neutral-black">
                Remember your password?
              </p>
              <Link to="/login" className="pup-body-md-500 text-primary-orange hover:underline">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
