import { useAuth } from "@/auth/useAuth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/my-plans/")({
  component: Index,
});

function Index() {
  const { user } = useAuth();
  return <div>Hello from my-plans {user?.email}</div>;
}
