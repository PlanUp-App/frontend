import { useAuth } from "@/auth/useAuth";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatBubble } from "@/components/ChatBubble";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useGetMyRole } from "../-queries";
import NavDropdown from "@/components/Navigation/nav-dropdown";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$planId/_layout",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { planId: planId } = Route.useParams();
  const { user, isAuthenticated } = useAuth();
  const token = localStorage.getItem("auth_token");
  useGetMyRole(planId);
  if (!user || !isAuthenticated || !token) return;
  return (
    <SidebarProvider>
      <AppSidebar planId={planId} />
      <SidebarInset>
        <header className="flex items-center justify-end px-16 py-4">
          <NavDropdown />
        </header>
        <main className="px-16">
          <div className="p-8 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
        <ChatBubble planId={planId} currentUserId={user?.id} token={token} />
      </SidebarInset>
    </SidebarProvider>
  );
}
