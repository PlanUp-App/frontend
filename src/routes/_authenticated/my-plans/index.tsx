import { PrimaryButton } from "@/components/Button/primary-filled";
import { SearchInput } from "@/components/CustomInput/search-input";
import { useDebounce } from "@/components/CustomInput/useDebounce";
import PlanCard from "@/components/PlanCard";
import { router } from "@/main";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useGetAllPlans } from "./-queries";
import { Spinner } from "@/components/ui/spinner";
import { CreatePlanDialog } from "@/components/Modals/create-plan";

export const Route = createFileRoute("/_authenticated/my-plans/")({
  component: Index,
});

function Index() {
  const search = Route.useSearch().search;
  const [input, setInput] = useState(search ?? "");
  const debouncedSearch = useDebounce(input, 300);
  const [createModalIsOpen, setCreateModalIsOpen] = useState(false);

  const { data, isLoading, isError } = useGetAllPlans({
    search: debouncedSearch,
  });

  useEffect(() => {
    router.navigate({
      to: "/my-plans",
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        search: debouncedSearch || undefined, // remove empty param
      }),
    });
  }, [debouncedSearch]);

  return (
    <section className="py-16">
      <CreatePlanDialog
        open={createModalIsOpen}
        onOpenChange={setCreateModalIsOpen}
      />
      <div className="container">
        <div className="flex justify-between mb-12">
          <h1 className="pup-heading-two text-neutral-black">My plans</h1>
          <PrimaryButton
            type="button"
            title="Create New Plan"
            onClick={() => setCreateModalIsOpen(true)}
          />
        </div>
        <SearchInput
          placeholder="Search by name..."
          className="mb-12"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="grid grid-cols-3 gap-6">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            "Something went wrong"
          ) : data?.data && data.data.length > 0 ? (
            data.data.map(({ id, name, coverImage, members }) => (
              <PlanCard
                key={id}
                id={id}
                name={name}
                coverImage={coverImage}
                members={members}
              />
            ))
          ) : (
            "No plans found."
          )}
        </div>
      </div>
    </section>
  );
}
