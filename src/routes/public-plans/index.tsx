import { createFileRoute } from "@tanstack/react-router";
import { SearchInput } from "@/components/CustomInput/search-input";
import { useDebounce } from "@/components/CustomInput/useDebounce";
import PlanCard from "@/components/PlanCard";
import { router } from "@/main";
import { useEffect, useRef, useState } from "react";
import { useGetPublicPlansInfinite } from "./-queries";
import { Spinner } from "@/components/ui/spinner";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/public-plans/")({
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch().search;
  const [input, setInput] = useState(search ?? "");
  const debouncedSearch = useDebounce(input, 300);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetPublicPlansInfinite({
    search: debouncedSearch,
    limit: 9,
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPlans = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-neutral-50 font-sans pb-24">
        {/* HERO HEADER */}
        <section className="relative py-24 overflow-hidden bg-neutral-900">
          <div className="absolute inset-0 z-0">
            <img src="placeholder.png" alt="Header background" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/50 to-neutral-900" />
          </div>

          <div className="container relative z-10 mx-auto px-6 lg:px-16 text-center max-w-4xl">
            <p className="text-orange-500 font-semibold uppercase tracking-wider text-sm mb-4">Community Directory</p>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">Public Plans</span>
            </h1>
            <p className="text-lg lg:text-xl text-neutral-300 mb-10 font-light leading-relaxed">
              Find inspiration from our community or join public activities shared by users around the world.
            </p>

            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <SearchInput
                placeholder="Search by name, activity or location..."
                className="relative bg-white/95 backdrop-blur-sm border-none py-6 px-6 rounded-2xl text-lg shadow-xl"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* RESULTS GRID */}
        <section className="container mx-auto px-6 lg:px-16 mt-16 relative z-20">
          {isLoading ? (
            <div className="flex items-center justify-center gap-4 ">
              <Spinner className="w-12 h-12 text-orange-500" />
              <p className="text-neutral-500 animate-pulse">Loading plans...</p>
            </div>
          ) : isError ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-neutral-100 shadow-sm">
              <p className="text-rose-500 font-medium">Something went wrong while fetching plans.</p>
              <button onClick={() => window.location.reload()} className="mt-4 text-orange-500 hover:underline">Try again</button>
            </div>
          ) : allPlans.length > 0 ? (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {allPlans.map(({ id, name, coverImage, _count, visibility }) => (
                  <div key={id} className="transform hover:-translate-y-2 transition-transform duration-300">
                    <PlanCard
                      linkTo={`/public-plans/${id}`}
                      id={id}
                      name={name}
                      coverImage={coverImage ?? "placeholder.png"}
                      memberCount={_count.members}
                      isPublic={visibility === "PUBLIC"}
                    />
                  </div>
                ))}
              </div>

              {/* INFINITE SCROLL LOADER */}
              <div ref={loadMoreRef} className="flex justify-center py-10">
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-3 text-neutral-500">
                    <Spinner className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium tracking-wide">Loading more plans...</span>
                  </div>
                ) : hasNextPage && (
                  <div className="h-10" />
                )}
              </div>
            </div>
          ) : (
            <div className="py-32 text-center">
              <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">No public plans found</h3>
              <p className="text-neutral-500">Try adjusting your search terms or check back later.</p>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
}
