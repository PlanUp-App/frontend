// main.tsx
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import "./styles/_typography.scss";
import { queryClient } from "./utils/queryclient/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

const router = createRouter({
  routeTree,
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);
