// main.tsx
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import "./styles/_typography.scss";

const router = createRouter({
  routeTree,
});

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
