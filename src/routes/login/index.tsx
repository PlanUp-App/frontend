import { PrimaryButton } from "@/components/Button/primary-filled";
import { CustomInput } from "@/components/CustomInput";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const Route = createFileRoute("/login/")({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/dashboard",
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect });
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
  const navigate = Route.useNavigate();
  const { redirect } = Route.useSearch();
  const [isLoading, setIsLoading] = useState(false);

  const { getInputProps, onSubmit } = useForm<LoginForm>({
    initialValues: { email: "", password: "" },
    validate: zod4Resolver(loginSchema),
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values: LoginForm) => {
    setIsLoading(true);
    try {
      await auth.login(values.email, values.password);
      toast.success("Login Successful");
      navigate({ to: redirect });
    } catch (err) {
      let message = "Something went wrong";
      if (err instanceof AxiosError) {
        message = err.response?.data?.message ?? err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      console.log(err);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            <CustomInput
              className="mb-8"
              label="Password"
              type="password"
              inputProps={getInputProps("password")}
            />
            <PrimaryButton
              isLoading={isLoading}
              title="Log In"
              className="uppercase w-full"
              type="submit"
            />
          </form>
          <div className="flex gap-1 justify-center">
            <p className="pup-body-md-400 text-neutral-black">
              Don't have an account?
            </p>
            <Link to="/sign-up" className="pup-body-md-500 text-primary-orange">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
