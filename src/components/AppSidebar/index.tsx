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
import { Link, useLocation } from "@tanstack/react-router";
import {
  MdOutlineAttachMoney,
  MdOutlineDashboard,
  MdOutlinePeopleAlt,
  MdChevronRight,
  MdOutlineLayers,
  MdOutlineSettings,
} from "react-icons/md";
import {
  useGetPhases,
  type Phase,
} from "@/routes/_authenticated/my-plans/$planId/_layout/phases/-queries";

function NavItem({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: any;
  label: string;
}) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        data-active={isActive}
        className="flex gap-3 px-4 py-2 h-10 [&>svg]:size-6! rounded-2 text-neutral-black data-[active=true]:bg-white data-[active=true]:text-dark-blue data-[active=true]:shadow-[1px_2px_5px_rgba(0,0,0,0.08)]"
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
  const location = useLocation();
  const isActive = location.pathname.includes(
    `/my-plans/${planId}/phases/${phaseId}`,
  );

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        className={cn(
          "h-10 py-2 pup-body-md-400 text-neutral-dark-grey",
          isActive && "text-neutral-black pup-body-md-500",
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
  const { data: phases, isLoading } = useGetPhases(planId);

  const location = useLocation();
  const isPhasesActive = location.pathname.includes(
    `/my-plans/${planId}/phases`,
  );

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="bg-off-white">
        <div className="my-4 mx-6">
          <Link to={"/my-plans"}>
            <img src="/planup-logo.svg" width="100px" />
          </Link>
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
            <Collapsible
              defaultOpen={true}
              className="group/collapsible"
              // open={isPhasesActive}
            >
              <div
                className={cn(
                  "rounded-[8px] flex items-center gap-3 px-4 py-2 h-10 rounded-2 cursor-pointer",
                  isPhasesActive &&
                    "bg-white text-dark-blue shadow-[1px_2px_5px_rgba(0,0,0,0.08)]",
                )}
              >
                <Link
                  to="/my-plans/$planId/phases"
                  params={{ planId }}
                  className="flex items-center gap-3 flex-1"
                >
                  <MdOutlineLayers className="size-6" />
                  <span className="pup-body-md-500">Phases</span>
                </Link>

                <CollapsibleTrigger asChild>
                  <button className="p-0">
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
                  ) : phases?.data && phases.data.length > 0 ? (
                    phases.data.map((phase: Phase) => (
                      <PhaseSubItem
                        key={phase.id}
                        planId={planId}
                        phaseId={phase.id}
                        label={phase.name}
                      />
                    ))
                  ) : (
                    <div>Add a phase</div>
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
          <NavItem
            to={`/my-plans/${planId}/config`}
            icon={MdOutlineSettings}
            label="Configurations"
          />
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
