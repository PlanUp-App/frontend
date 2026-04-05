// main.tsx
import { createRoot } from "react-dom/client";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import "./styles/_typography.scss";
import { queryClient } from "./utils/queryclient/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./auth/auth";
import InnerApp from "./App";

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  },
});

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </QueryClientProvider>
  );
}
