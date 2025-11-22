import { RouterProvider } from "@tanstack/react-router";
import { useAuth } from "./auth/useAuth";
import { router } from "./main";

export default function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}
