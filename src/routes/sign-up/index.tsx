import { PrimaryButton } from "@/components/Button/primary-filled";
import { CustomInput } from "@/components/CustomInput/input";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useSignUp } from "./-queries";
import { censorEmail } from "@/lib/utils";

export const Route = createFileRoute("/sign-up/")({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "",
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect });
    }
  },
  component: Index,
});

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+[\]{};:'"\\|,.<>/?`~]).{8,}$/;

const signUpSchema = z
  .object({
    name: z
      .string()
      .nonempty()
      .min(2, { message: "Name must be atleast 2 characters" }),
    email: z.email("Invalid Email"),
    password: z
      .string()
      .min(6, { message: "Password must be atleast 6 characters" })
      .regex(
        strongPasswordRegex,
        "Password must contain upper, lower, number and special character"
      ),
    confirmPassword: z.string().nonempty(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password != confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

type SignUpForm = z.infer<typeof signUpSchema>;

function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const signUpMutation = useSignUp();

  const { getInputProps, onSubmit, reset } = useForm<SignUpForm>({
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validate: zod4Resolver(signUpSchema),
    validateInputOnBlur: true,
  });

  const handleSubmit = async (values: SignUpForm) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...rest } = values;
    setIsLoading(true);
    setError("");
    try {
      const data = await signUpMutation.mutateAsync(rest);
      const censoredEmail = censorEmail(data.email);
      toast.success(`Verification email sent to ${censoredEmail}`);
      reset();
    } catch (err) {
      let message = "Something went wrong";
      if (err instanceof AxiosError) {
        message = err.response?.data?.message ?? err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      console.log(err);
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="w-120 py-20 flex flex-col gap-8 h-fit">
          <div>
            <h1 className="pup-heading-two mb-6 text-neutral-black text-center">
              Sign Up
            </h1>
            <p className="pup-body-md-400 text-neutral-black text-center">
              Create a new account and get started with planning!
            </p>
          </div>
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
              inputProps={getInputProps("email")}
            />
            <CustomInput
              className="mb-8"
              label="Password"
              type="password"
              inputProps={getInputProps("password")}
            />
            <CustomInput
              className="mb-8"
              label="Confirm Password"
              type="password"
              inputProps={getInputProps("confirmPassword")}
            />
            <PrimaryButton
              isLoading={isLoading}
              title="Sign Up"
              className="uppercase w-full"
              type="submit"
            />
          </form>
          <div className="flex gap-1 justify-center">
            <p className="pup-body-md-400 text-neutral-black">
              Already have an account?
            </p>
            <Link to="/login" className="pup-body-md-500 text-primary-orange">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
