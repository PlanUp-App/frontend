import type { AuthState } from "@/auth/AuthContext";
import { Navigation } from "@/components/Navigation";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";

interface MyRouterContext {
  auth: AuthState;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      {/* <Navigation /> */}
      <Outlet />
      <Toaster
        position="top-center"
        toastOptions={{ descriptionClassName: "pup-body-md-400" }}
      />
    </>
  ),
});
