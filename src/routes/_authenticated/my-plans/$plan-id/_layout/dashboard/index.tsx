import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/my-plans/$plan-id/_layout/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>hello</div>;
}
