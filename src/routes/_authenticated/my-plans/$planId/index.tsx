import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/my-plans/$planId/")({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/my-plans/$planId/dashboard",
      params: { planId: params["planId"] },
    });
  },
});

function RouteComponent() {
  return <div>Loading plan</div>;
}
