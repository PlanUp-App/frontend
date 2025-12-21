import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$plan-id/_layout"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { "plan-id": planId } = Route.useParams();
  return (
    <SidebarProvider>
      <AppSidebar planId={planId} />
      <SidebarInset>
        <main className="px-16">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
