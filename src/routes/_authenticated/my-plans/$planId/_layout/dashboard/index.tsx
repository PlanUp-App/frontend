import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$planId/_layout/dashboard/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <div className="pup-heading-three">Dashboard - TODO</div>;
}
