import { createFileRoute } from "@tanstack/react-router";
import { SearchInput } from "@/components/CustomInput/search-input";
import { useDebounce } from "@/components/CustomInput/useDebounce";
import PlanCard from "@/components/PlanCard";
import { router } from "@/main";
import { useEffect, useState } from "react";
import { useGetPublicPlans } from "./-queries";
import { Spinner } from "@/components/ui/spinner";
import { Navigation } from "@/components/Navigation";

export const Route = createFileRoute("/public-plans/")({
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch().search;
  const [input, setInput] = useState(search ?? "");
  const debouncedSearch = useDebounce(input, 300);

  const { data, isLoading, isError } = useGetPublicPlans({
    search: debouncedSearch,
  });

  useEffect(() => {
    router.navigate({
      to: "/public-plans",
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        search: debouncedSearch || undefined,
      }),
    });
  }, [debouncedSearch]);

  return (
    <>
      <Navigation />
      <section className="py-16">
        <div className="container">
          <div className="flex justify-between mb-12">
            <h1 className="pup-heading-two text-neutral-black">Public Plans</h1>
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
            ) : data && data.length > 0 ? (
              data.map(({ id, name, coverImage, _count, visibility }) => (
                <PlanCard
                  key={id}
                  linkTo={`/public-plans/${id}`}
                  id={id}
                  name={name}
                  coverImage={coverImage ?? undefined}
                  memberCount={_count.members}
                  isPublic={visibility === "PUBLIC"}
                />
              ))
            ) : (
              "No public plans found."
            )}
          </div>
        </div>
      </section>
    </>
  );
}
