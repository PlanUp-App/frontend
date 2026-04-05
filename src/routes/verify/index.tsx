import {
  createFileRoute,
  Link,
  redirect,
} from "@tanstack/react-router";
import { useVerifyEmail } from "./-queries";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { router } from "@/main";

export const Route = createFileRoute("/verify/")({
  validateSearch: (
    search: Record<string, unknown>
  ): { verificationToken?: string } => {
    return {
      verificationToken: search.verificationToken as string | undefined,
    };
  },
  beforeLoad: ({ search }) => {
    if (!search.verificationToken) {
      throw redirect({
        to: "/login",
        search: { redirect: "dashboard" },
      });
    }
  },
  component: Index,
});

function Index() {
  const { verificationToken: token } = Route.useSearch();

  const verifyEmailMutation = useVerifyEmail({
    onSuccess: () => {
      toast.success(`Email successfully verified.`);
      router.navigate({ to: "/login" });
    },
  });

  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate({ token });
    }
  }, [token]);

  return (
    <div className="container">
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="w-120 pt-2 pb-6 flex flex-col gap-8 h-fit">
          <div>
            <h1 className="pup-heading-two mb-6 text-neutral-black text-center">
              Verify Email
            </h1>

            {verifyEmailMutation.isPending && (
              <div className="flex justify-center">
                <Spinner className="size-10" />
              </div>
            )}
            {verifyEmailMutation.isError && (
              <p className="pup-body-md-400 text-neutral-black text-center">
                {((
                  verifyEmailMutation.error?.response?.data as {
                    message: string;
                  }
                )?.message ||
                  verifyEmailMutation.error?.message ||
                  "Error verifying email") + ". Please try again."}
              </p>
            )}
          </div>
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
