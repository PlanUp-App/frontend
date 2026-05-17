import { redirect, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    const isAuthenticated = context.auth.isAuthenticated;

    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.pathname,
        },
      });
    }
  },
});
