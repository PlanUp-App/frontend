import { OutlineButton } from "@/components/Button/outline";
import { PrimaryButton } from "@/components/Button/primary-filled";
import { CreatePhaseDialog } from "@/components/Modals/create-phase";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MdOutlineMoreVert, MdOutlineDragIndicator } from "react-icons/md";
import {
  useDeletePhase,
  useGetPhases,
  useReorderPhase,
  type Phase,
} from "./-queries";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UpdatePhaseDialog } from "@/components/Modals/update-phase";
import { Reorder } from "framer-motion";
import { ConfirmDeleteDialog } from "@/components/Modals/delete-confirmation";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$planId/_layout/phases/",
)({
  component: RouteComponent,
});

function PhaseCard({
  id,
  order,
  name,
  onClick,
  planId,
  isReordering,
  role
}: {
  id: string;
  order: number;
  name: string;
  onClick: (id: string) => unknown;
  planId: string;
  isReordering: boolean;
  role: string | null;
}) {
  const [updateModalIsOpen, setUpdateModalIsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const isOwner = role === "OWNER";
  return (
    <>
      <UpdatePhaseDialog
        phaseName={name}
        phaseId={id}
        open={updateModalIsOpen}
        onOpenChange={setUpdateModalIsOpen}
        planId={planId}
      />
      <div className="flex justify-between items-center border-b border-b-off-white py-3">
        <div className="flex gap-4 items-center">
          <div className="flex justify-center items-center h-14 w-14 rounded-[4px] pup-body-xl-700 shadow-[1px_2px_5px_rgba(0,0,0,0.18)] bg-white">
            {isReordering ? (
              <MdOutlineDragIndicator className="cursor-grab" />
            ) : (
              order
            )}
          </div>
          <Link to={`/my-plans/${planId}/phases/${id}`}>
            <h3 className="pup-body-xl-400">{name}</h3>
          </Link>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MdOutlineMoreVert size={24} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="pup-body-md-400 hover:cursor-pointer"
              onClick={() => setUpdateModalIsOpen(true)}
            >
              Edit
            </DropdownMenuItem>
            {isOwner && (
              <DropdownMenuItem
                className="text-red-400 pup-body-md-400 hover:cursor-pointer hover:text-red-400"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Phase"
        description={`Are you sure you want to delete "${name}"? This will also permanently delete ALL tasks within this phase. This action cannot be undone.`}
        onConfirm={() => {
          onClick(id);
          setDeleteConfirmOpen(false);
          toast.success("Phase deleted successfully");
        }}
      />
    </>
  );
}

function RouteComponent() {
  const { planId: planId } = Route.useParams();
  const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
  const { data: phases, isLoading } = useGetPhases(planId);
  const role = localStorage.getItem(`plan_role_${planId}`);
  const [items, setItems] = useState<Phase[]>([]);
  const deletePhaseMutation = useDeletePhase(planId);
  const [isReordering, setIsReordering] = useState(false);
  const reorderPhaseMutation = useReorderPhase(planId);
  console.log(isReordering ? "Reordering" : "", items);

  const displayItems = items.length > 0 ? items : phases?.data || [];

  const handleSaveOrder = () => {
    reorderPhaseMutation.mutate(items);
    setIsReordering(false);
  };

  const handleStartReordering = () => {
    setItems(phases?.data || []);
    setIsReordering(true);
  };

  const handleCancelReordering = () => {
    setItems([]);
    setIsReordering(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <CreatePhaseDialog
          open={createModalIsOpen}
          onOpenChange={setCreateModalIsOpen}
          planId={planId}
        />
        <h1 className="pup-heading-three text-2xl md:text-3xl">Phases</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          {!isReordering ? (
            <>
              <OutlineButton
                title="Reorder"
                className="flex-1 sm:flex-none border-primary-orange text-primary-orange"
                type="button"
                onClick={handleStartReordering}
              />
              <PrimaryButton
                title="Add New Phase"
                className="flex-1 sm:flex-none"
                type="button"
                onClick={() => setCreateModalIsOpen(true)}
              />
            </>
          ) : (
            <>
              <OutlineButton
                title="Cancel"
                className="flex-1 sm:flex-none border-primary-orange text-primary-orange"
                type="button"
                onClick={handleCancelReordering}
              />
              <PrimaryButton
                title="Save"
                className="flex-1 sm:flex-none"
                type="button"
                onClick={handleSaveOrder}
              />
            </>
          )}
        </div>
      </div>
      <div>
        {isLoading ? (
          <span>Loading...</span>
        ) : displayItems.length > 0 ? (
          isReordering ? (
            <Reorder.Group axis="y" values={items} onReorder={setItems}>
              {items.map((phase, index) => (
                <Reorder.Item key={phase.id} value={phase}>
                  <PhaseCard
                    id={phase.id}
                    name={phase.name}
                    order={index + 1}
                    onClick={deletePhaseMutation.mutate}
                    planId={planId}
                    isReordering={isReordering}
                    role={role}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            displayItems.map((phase, index) => (
              <PhaseCard
                id={phase.id}
                name={phase.name}
                key={phase.id}
                order={index + 1}
                onClick={deletePhaseMutation.mutate}
                planId={planId}
                isReordering={isReordering}
                role={role}
              />
            ))
          )
        ) : (
          <span>No Phases. Create a new phase and get started</span>
        )}
      </div>
    </>
  );
}
