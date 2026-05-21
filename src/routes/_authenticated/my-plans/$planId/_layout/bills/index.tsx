import { useGetBills } from "@/components/Bills/-queries";
import AddBill from "@/components/Bills/add-bill";
import BillCard from "@/components/Bills/bill-card";
import ViewBill from "@/components/Bills/view-bill";
import { OutlineButton } from "@/components/Button/outline";
import { PrimaryButton } from "@/components/Button/primary-filled";
import { SearchInput } from "@/components/CustomInput/search-input";
import { useDebounce } from "@/components/CustomInput/useDebounce";
import { Spinner } from "@/components/ui/spinner";
import { router } from "@/main";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$planId/_layout/bills/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { planId: planId } = Route.useParams();
  const [addBillIsOpen, setAddBillIsOpen] = useState(false);
  const [viewBillIsOpen, setViewBillIsOpen] = useState(false);
  const [viewBill, setViewBill] = useState("");
  const search = Route.useSearch().search;
  const [searchTerm, setSearchTerm] = useState(search ?? "");
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    router.navigate({
      to: `/my-plans/${planId}/bills`,
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        search: debouncedSearch || undefined, // remove empty param
      }),
    });
  }, [debouncedSearch]);

  const { data, isLoading } = useGetBills({ planId, search });
  return (
    <>
      <AddBill
        open={addBillIsOpen}
        onOpenChange={setAddBillIsOpen}
        planId={planId}
      />
      <ViewBill
        open={viewBillIsOpen}
        onOpenChange={setViewBillIsOpen}
        planId={planId}
        billId={viewBill}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <h1 className="pup-heading-three text-2xl md:text-3xl">Bills</h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <OutlineButton
            className="flex-1 sm:flex-none border-primary-orange text-primary-orange"
            title="View Report"
            type="button"
            onClick={() => {
              router.navigate({ to: `report` });
            }}
          />
          <PrimaryButton
            title="Add Bill"
            className="flex-1 sm:flex-none"
            type="button"
            onClick={() => setAddBillIsOpen(true)}
          />
        </div>
      </div>
      <SearchInput
        placeholder="Search by name or category"
        className="mb-12"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {isLoading ? (
        <div className="flex justify-center mt-24">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {data && data.data.length > 0 ? (
            data.data.map((bill) => (
              <BillCard
                key={bill.id}
                bill={bill}
                onClick={() => {
                  setViewBill(bill.id);
                  setViewBillIsOpen(true);
                }}
              />
            ))
          ) : (
            <p className="text-muted-foreground">No bills found.</p>
          )}
        </div>
      )}
    </>
  );
}
