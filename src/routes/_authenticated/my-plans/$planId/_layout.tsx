import { useAuth } from "@/auth/useAuth";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatBubble } from "@/components/ChatBubble";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$planId/_layout",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { planId: planId } = Route.useParams();
  const { user, isAuthenticated } = useAuth();
  if (!user || !isAuthenticated) return;
  const token = localStorage.getItem("token");
  return (
    <SidebarProvider>
      <AppSidebar planId={planId} />
      <SidebarInset>
        <main className="px-16">
          <Outlet />
        </main>
        <ChatBubble planId={planId} currentUserId={user?.id} token={""} />
      </SidebarInset>
    </SidebarProvider>
  );
}
