import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/my-plans/$plan-id/")({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/my-plans/$planId/dashboard",
      params: { planId: params["plan-id"] },
    });
  },
});

function RouteComponent() {
  return <div>Hello "/_authenticated/my-plans/$plan-id/"!</div>;
}
