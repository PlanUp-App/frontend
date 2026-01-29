import AddBill from "@/components/Bills/add-bill";
import { PrimaryButton } from "@/components/Button/primary-filled";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$plan-id/_layout/bills/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { "plan-id": planId } = Route.useParams();
  const [addBillIsOpen, setAddBillIsOpen] = useState(true);
  return (
    <>
      <div className="flex justify-between mb-12">
        <h1 className="pup-heading-three">Bills</h1>
        <div className="flex gap-3">
          <PrimaryButton
            title="Add Bill"
            type="button"
            onClick={() => setAddBillIsOpen(true)}
          />
        </div>
      </div>
      <AddBill
        open={addBillIsOpen}
        onOpenChange={setAddBillIsOpen}
        planId={planId}
      />
    </>
  );
}
