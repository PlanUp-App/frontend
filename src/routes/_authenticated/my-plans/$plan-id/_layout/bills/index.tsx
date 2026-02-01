import { useGetBills } from "@/components/Bills/-queries";
import AddBill from "@/components/Bills/add-bill";
import BillCard from "@/components/Bills/bill-card";
import ViewBill from "@/components/Bills/view-bill";
import { PrimaryButton } from "@/components/Button/primary-filled";
import { SearchInput } from "@/components/CustomInput/search-input";
import { useDebounce } from "@/components/CustomInput/useDebounce";
import { router } from "@/main";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$plan-id/_layout/bills/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { "plan-id": planId } = Route.useParams();
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

  const { data } = useGetBills({ planId, search });
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
      <div className="flex justify-between mb-12 items-center">
        <h1 className="pup-heading-three">Bills</h1>
        <div className="flex gap-3">
          <PrimaryButton
            title="Add Bill"
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
      <div className="flex flex-col gap-4">
        {data?.data.map((bill) => (
          <BillCard
            key={bill.id}
            bill={bill}
            onClick={() => {
              setViewBill(bill.id);
              setViewBillIsOpen(true);
            }}
          />
        ))}
      </div>
    </>
  );
}
