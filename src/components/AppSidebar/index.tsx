import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Link, useMatchRoute } from "@tanstack/react-router";
import {
  MdOutlineAttachMoney,
  MdOutlineDashboard,
  MdOutlinePeopleAlt,
  MdChevronRight,
  MdOutlineLayers,
} from "react-icons/md";
import { useQuery } from "@tanstack/react-query";

function NavItem({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: any;
  label: string;
}) {
  const matchRoute = useMatchRoute();
  const isActive = !!matchRoute({ to });

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={cn(
          "flex gap-3 px-4 py-2 h-10 [&>svg]:size-6! rounded-2 text-neutral-black",
          isActive &&
            "bg-white text-dark-blue shadow-[1px_2px_5px_rgba(0,0,0,0.08)]"
        )}
        asChild
      >
        <Link to={to}>
          <Icon className="size-6" />
          <span className="pup-body-md-500">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function PhaseSubItem({
  planId,
  phaseId,
  label,
}: {
  planId: string;
  phaseId: string;
  label: string;
}) {
  const matchRoute = useMatchRoute();
  // const isActive = !!matchRoute({
  //   to: "/my-plans/$planId/phases/$phaseId",
  //   params: { planId, phaseId },
  // });
  const isActive = !true;

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        className={cn(
          "h-10 py-2 pup-body-md-400 text-neutral-dark-grey",
          isActive &&
            "bg-white text-dark-blue shadow-[1px_2px_5px_rgba(0,0,0,0.08)]"
        )}
        asChild
      >
        <Link
          to="/my-plans/$planId/phases/$phaseId"
          params={{ planId, phaseId }}
        >
          <span>{label}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

export function AppSidebar({ planId }: { planId: string }) {
  const { data: phases, isLoading } = useQuery({
    queryKey: ["phases", planId],
    queryFn: async () => {
      const res = await fetch(`/api/plans/${planId}/phases`);
      return res.json();
    },
  });

  const matchRoute = useMatchRoute();
  const isPhasesActive = !!matchRoute({
    to: "/my-plans/$planId/phases",
    params: { planId },
  });

  return (
    <Sidebar>
      <SidebarHeader className="bg-off-white">
        <div className="my-4 mx-6">
          <img src="/planup-logo.svg" width="100px" />
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-off-white px-4">
        <SidebarMenu className="gap-2">
          <NavItem
            to={`/my-plans/${planId}/dashboard`}
            icon={MdOutlineDashboard}
            label="Dashboard"
          />
          <SidebarMenuItem>
            <Collapsible defaultOpen className="group/collapsible">
              <div className="flex items-center">
                {/* Clickable link that takes most of the space */}
                <SidebarMenuButton
                  className={cn(
                    "flex-1 flex gap-3 px-4 py-2 h-10 [&>svg]:size-6! rounded-2",
                    isPhasesActive &&
                      "bg-white text-dark-blue shadow-[1px_2px_5px_rgba(0,0,0,0.08)]"
                  )}
                  asChild
                >
                  <Link to="/my-plans/$planId/phases" params={{ planId }}>
                    <MdOutlineLayers className="size-6" />
                    <span className="pup-body-md-500">Phases</span>
                  </Link>
                </SidebarMenuButton>

                {/* Collapsible trigger for the chevron only */}
                <CollapsibleTrigger asChild>
                  <button className="px-2 py-2">
                    <MdChevronRight className="size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <SidebarMenuSub className="ml-9">
                  {isLoading ? (
                    <SidebarMenuSubItem>
                      <span className="text-sm text-muted-foreground px-4">
                        Loading...
                      </span>
                    </SidebarMenuSubItem>
                  ) : (
                    phases?.map((phase: any) => (
                      <PhaseSubItem
                        key={phase.id}
                        planId={planId}
                        phaseId={phase.id}
                        label={phase.name}
                      />
                    ))
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
          <NavItem
            to={`/my-plans/${planId}/bills`}
            icon={MdOutlineAttachMoney}
            label="Bills"
          />
          <NavItem
            to={`/my-plans/${planId}/members`}
            icon={MdOutlinePeopleAlt}
            label="Members"
          />
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
