import { useAuth } from "@/auth/useAuth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Index,
});

function Index() {
  const { user } = useAuth();
  console.log(user);
  return <div>Hello {user?.email}</div>;
}
