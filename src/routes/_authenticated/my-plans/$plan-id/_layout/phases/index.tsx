import { OutlineButton } from "@/components/Button/outline";
import { PrimaryButton } from "@/components/Button/primary-filled";
import { CreatePhaseDialog } from "@/components/Modals/create-phase";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MdOutlineMoreVert } from "react-icons/md";
import { useDeletePhase, useGetPhases } from "./-queries";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$plan-id/_layout/phases/"
)({
  component: RouteComponent,
});

function PhaseCard({
  id,
  order,
  name,
  onClick,
}: {
  id: string;
  order: number;
  name: string;
  onClick: (id: string) => unknown;
}) {
  return (
    <div className="flex justify-between items-center border-b border-b-off-white py-3">
      <div className="flex gap-4 items-center">
        <div className="flex justify-center items-center h-14 w-14 rounded-[4px] pup-body-xl-700 shadow-[1px_2px_5px_rgba(0,0,0,0.18)] bg-white">
          {order}
        </div>
        <h3 className="pup-body-xl-400">{name}</h3>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MdOutlineMoreVert size={24} />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="pup-body-md-400 hover:cursor-pointer">
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-400 pup-body-md-400 hover:cursor-pointer hover:text-red-400"
            onClick={() => onClick(id)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function RouteComponent() {
  const { "plan-id": planId } = Route.useParams();
  const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
  const { data: phases, isLoading } = useGetPhases(planId);
  const deletePhaseMutation = useDeletePhase(planId);

  return (
    <>
      <div className="flex justify-between mb-12">
        <CreatePhaseDialog
          open={createModalIsOpen}
          onOpenChange={setCreateModalIsOpen}
          planId={planId}
        />
        <h1 className="pup-heading-three">Phases</h1>
        <div className="flex gap-3">
          <OutlineButton
            title="Reorder"
            className="border-primary-orange text-primary-orange"
          />
          <PrimaryButton
            title="Add New Phase"
            type="button"
            onClick={() => setCreateModalIsOpen(true)}
          />
        </div>
      </div>
      <div>
        {isLoading ? (
          <span>Loading...</span>
        ) : phases?.data && phases.data.length > 0 ? (
          phases.data.map((phase, index) => {
            return (
              <PhaseCard
                id={phase.id}
                name={phase.name}
                key={phase.id}
                order={index + 1}
                onClick={deletePhaseMutation.mutate}
              />
            );
          })
        ) : (
          <span>No Phases. Create a new phase and get started</span>
        )}
      </div>
    </>
  );
}
