import { PrimaryButton } from "@/components/Button/primary-filled";
import { CustomInput } from "@/components/CustomInput/input";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { GoogleButton } from "@/components/Button/google-button";
import { Navigation } from "@/components/Navigation";

export const Route = createFileRoute("/login/")({
  validateSearch: (search) => ({
    redirect: search.redirect as string,
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || "/my-plans" });
    }
  },
  component: Index,
});

const loginSchema = z.object({
  email: z.email("Invalid Email"),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginForm = z.infer<typeof loginSchema>;

function Index() {
  const { auth } = Route.useRouteContext();
  const redirect = Route.useSearch().redirect || "/my-plans";
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`;
    console.log("Redirecting to google...");
  };

  const { getInputProps, onSubmit } = useForm<LoginForm>({
    initialValues: { email: "", password: "" },
    validate: zod4Resolver(loginSchema),
    validateInputOnBlur: true,
  });

  const handleSubmit = async ({ email, password }: LoginForm) => {
    setIsLoading(true);
    auth.loginMutation.mutate(
      { email, password, redirectTo: redirect },
      {
        onSuccess: () => {
          toast.success("Login Successful");
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
                Login
              </h1>
              <p className="pup-body-md-400 text-neutral-black text-center">
                Login now to access your account and start planning
              </p>
            </div>
            <form onSubmit={onSubmit(handleSubmit)}>
              <CustomInput
                className="mb-6"
                label="Email"
                type="text"
                placeholder="user@example.com"
                inputProps={getInputProps("email")}
              />
              <div className="mb-8 flex flex-col gap-1.5">
                <CustomInput
                  label="Password"
                  type="password"
                  inputProps={getInputProps("password")}
                />
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="pup-body-sm-500 text-primary-orange hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
              <PrimaryButton
                isLoading={isLoading}
                title="Log In"
                className="uppercase w-full"
                type="submit"
              />
            </form>
            <GoogleButton className="w-full" onClick={handleGoogleLogin} />
            <div className="flex gap-1 justify-center">
              <p className="pup-body-md-400 text-neutral-black">
                Don't have an account?
              </p>
              <Link
                to="/sign-up"
                className="pup-body-md-500 text-primary-orange"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
