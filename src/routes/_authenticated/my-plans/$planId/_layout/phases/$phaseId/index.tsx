import { PrimaryButton } from "@/components/Button/primary-filled";
import TaskCard from "@/components/TaskCard";
import TaskDrawer from "@/components/TaskDrawer/add-task";
import ViewTaskDrawer from "@/components/TaskDrawer/view-task";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useGetTasks, useGetPhase, useGetPhaseStats, useGetTasksInfinite, type Task, TaskSortBy, SortOrder } from "./-queries";
import { CheckCircle2, Circle } from "lucide-react";
import { SearchInput } from "@/components/CustomInput/search-input";
import { useGetMembers } from "../../members/-queries";
import MemberSelect, { type MemberOption } from "@/components/MemberSelect";
import { MdClose, MdOutlineTableChart, MdOutlineTimeline, MdFilterList } from "react-icons/md";
import { useDebounce } from "@/components/CustomInput/useDebounce";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "@/components/PreviewImage";
import { Skeleton } from "@/components/ui/skeleton";
import { router } from "@/main";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { OutlineButton } from "@/components/Button/outline";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PhaseSearch = {
  view: "timeline" | "table";
  page: number;
};

export const Route = createFileRoute(
  "/_authenticated/my-plans/$planId/_layout/phases/$phaseId/",
)({
  validateSearch: (search): PhaseSearch => ({
    view: (search.view as "timeline" | "table") || "timeline",
    page: Number(search.page) > 0 ? Number(search.page) : 1,
  }),
  component: RouteComponent,
});

function groupTasksByDate(tasks: Task[]) {
  return tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const dateKey = task.dueDate
      ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(task.dueDate))
      : "No Date";

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(task);

    return acc;
  }, {});
}

function findClosestDate(dates: string[]): string | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse dates and filter out "No Date"
  const parsedDates = dates
    .filter((date) => date !== "No Date")
    .map((dateStr) => {
      const date = new Date(dateStr);
      return { dateStr, date, timestamp: date.getTime() };
    })
    .sort((a, b) => a.timestamp - b.timestamp);

  if (parsedDates.length === 0) return null;

  // Find today's date
  const todayMatch = parsedDates.find((d) => {
    const date = new Date(d.date);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  });

  if (todayMatch) return todayMatch.dateStr;

  // Find closest future date
  const futureDate = parsedDates.find((d) => d.timestamp >= today.getTime());
  if (futureDate) return futureDate.dateStr;

  // If no future dates, return the last date
  return parsedDates[parsedDates.length - 1].dateStr;
}

function ProgressSection({
  label,
  value,
  total,
  colorClass = "bg-primary-orange",
}: {
  label: string;
  value: number;
  total: number;
  colorClass?: string;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="bg-white border border-off-white rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="pup-body-md-500 text-neutral-black">{label}</p>
        <span className="pup-body-sm-400 text-neutral-grey">{percentage}%</span>
      </div>
      <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-neutral-grey mt-2">
        {value} of {total} tasks
      </p>
    </div>
  );
}

function RouteComponent() {
  const [addTaskIsOpen, setAddTaskIsOpen] = useState(false);
  const [viewTaskIsOpen, setViewTaskIsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewTask, setViewTask] = useState("");
  const { planId: planId, phaseId: phaseId } = Route.useParams();
  const { view, page } = Route.useSearch();

  const limit = 10;
  const skip = (page - 1) * limit;

  // Filter State
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [selectedAssignee, setSelectedAssignee] = useState<MemberOption | null>(
    null,
  );
  const [selectedCreator, setSelectedCreator] = useState<MemberOption | null>(
    null,
  );

  const { data: phase } = useGetPhase(planId, phaseId);
  const { data: members } = useGetMembers(planId);
  const { data: stats } = useGetPhaseStats(planId, phaseId);

  const { data: tableData, isLoading: isTableLoading } = useGetTasks(
    planId,
    phaseId,
    {
      search: debouncedSearch,
      assigneeId: selectedAssignee?.value,
      creatorId: selectedCreator?.value,
      sortBy: TaskSortBy.dueDate,
      order: SortOrder.desc,
      skip,
      limit,
    },
  );

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isInfiniteLoading,
  } = useGetTasksInfinite(planId, phaseId, {
    search: debouncedSearch,
    assigneeId: selectedAssignee?.value,
    creatorId: selectedCreator?.value,
    sortBy: TaskSortBy.dueDate,
    order: SortOrder.desc,
    limit: 20,
  });

  const isLoading = view === "timeline" ? isInfiniteLoading : isTableLoading;
  const tasks =
    view === "timeline"
      ? infiniteData?.pages.flatMap((page) => page.data) || []
      : tableData?.data || [];
  const totalTasksCount =
    view === "timeline"
      ? infiniteData?.pages[0]?.meta.total || 0
      : tableData?.meta.total || 0;
  const totalPages = Math.ceil(totalTasksCount / limit);

  const handlePageChange = (nextPage: number) => {
    router.navigate({
      to: `/my-plans/${planId}/phases/${phaseId}`,
      search: (prev: PhaseSearch) => ({
        ...prev,
        page: nextPage,
      }),
    });
  };

  const handleViewChange = (nextView: "timeline" | "table") => {
    router.navigate({
      to: `/my-plans/${planId}/phases/${phaseId}`,
      search: (prev: PhaseSearch) => ({
        ...prev,
        view: nextView,
        page: 1,
      }),
    });
  };

  const groupedTasks = groupTasksByDate(tasks);

  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const headerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasScrolled = useRef(false);
  const [activeDate, setActiveDate] = useState<string | null>(null);

  useEffect(() => {
    if (view !== "timeline" || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "200px" },
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [view, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (view !== "timeline" || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveDate(entry.target.getAttribute("data-date"));
          }
        });
      },
      {
        // Focus on a narrow band just below the sticky header (approx 180px - 200px)
        rootMargin: "-200px 0px -70% 0px",
        threshold: 0,
      }
    );

    Object.values(dateRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [view, isLoading, tasks]);

  const scrollToDate = (date: string) => {
    const element = dateRefs.current[date];
    const header = headerRef.current;
    if (element && header) {
      const headerHeight = header.offsetHeight;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerHeight - 16; // 16px buffer

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Auto-scroll on initial load
  useEffect(() => {
    if (!isLoading && tasks.length > 0 && !hasScrolled.current) {
      const dates = Object.keys(groupedTasks);
      const targetDate = findClosestDate(dates);

      if (targetDate) {
        // Use setTimeout to ensure refs are set
        setTimeout(() => {
          scrollToDate(targetDate);
          hasScrolled.current = true;
        }, 100);
      }
    }
  }, [isLoading, tasks]);

  return (
    <>
      <TaskDrawer
        open={addTaskIsOpen}
        onOpenChange={setAddTaskIsOpen}
        planId={planId}
        phaseId={phaseId}
      />
      <ViewTaskDrawer
        open={viewTaskIsOpen}
        onOpenChange={setViewTaskIsOpen}
        planId={planId}
        phaseId={phaseId}
        taskId={viewTask}
      />

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto px-6 py-10">
          <SheetHeader className="mb-6">
            <SheetTitle className="pup-heading-three">Filters & Options</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-8">
            {/* View Toggle */}
            <div>
              <h4 className="pup-body-md-500 text-neutral-black mb-4">View Mode</h4>
              <div className="flex p-1 bg-neutral-light-grey rounded-xl w-fit">
                <button
                  onClick={() => handleViewChange("timeline")}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 rounded-lg transition-all cursor-pointer",
                    view === "timeline"
                      ? "bg-white shadow-sm text-neutral-black"
                      : "text-neutral-grey hover:text-neutral-dark-grey",
                  )}
                >
                  <MdOutlineTimeline size={20} />
                  <span className="pup-body-sm-500">Timeline</span>
                </button>
                <button
                  onClick={() => handleViewChange("table")}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 rounded-lg transition-all cursor-pointer",
                    view === "table"
                      ? "bg-white shadow-sm text-neutral-black"
                      : "text-neutral-grey hover:text-neutral-dark-grey",
                  )}
                >
                  <MdOutlineTableChart size={20} />
                  <span className="pup-body-sm-500">Table</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-6">
              <h4 className="pup-body-md-500 text-neutral-black">Filters</h4>
              <SearchInput
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p className="pup-body-sm-500 text-neutral-grey tracking-wider">
                    Assigned To
                  </p>
                  <div className="flex items-center gap-2">
                    <MemberSelect
                      data={members || []}
                      selectedMember={selectedAssignee}
                      setSelectedMember={setSelectedAssignee}
                      variant="mini"
                      placeholder="All"
                    />
                    {selectedAssignee && (
                      <button
                        onClick={() => setSelectedAssignee(null)}
                        className="p-1 hover:bg-neutral-light-grey rounded-full"
                      >
                        <MdClose className="text-neutral-grey size-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="pup-body-sm-500 text-neutral-grey tracking-wider">
                    Created By
                  </p>
                  <div className="flex items-center gap-2">
                    <MemberSelect
                      data={members || []}
                      selectedMember={selectedCreator}
                      setSelectedMember={setSelectedCreator}
                      variant="mini"
                      placeholder="All"
                    />
                    {selectedCreator && (
                      <button
                        onClick={() => setSelectedCreator(null)}
                        className="p-1 hover:bg-neutral-light-grey rounded-full"
                      >
                        <MdClose className="text-neutral-grey size-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access - only in timeline */}
            {view === "timeline" && Object.keys(groupedTasks).length > 0 && (
              <div>
                <h4 className="pup-body-md-500 text-neutral-black mb-4">Jump to Date</h4>
                <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-2">
                  {Object.entries(groupedTasks).map(([date, tasksForDate]) => {
                    const isActive = activeDate === date;
                    return (
                      <button
                        key={date + "mobile-toc"}
                        onClick={() => {
                          scrollToDate(date);
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          "w-full text-left py-2.5 px-3 rounded-xl transition-all flex justify-between items-center",
                          isActive
                            ? "bg-orange-50 text-primary-orange pup-body-sm-500"
                            : "text-neutral-grey hover:bg-neutral-50 pup-body-sm-400"
                        )}
                      >
                        <span>{date}</span>
                        <span className="text-[10px] opacity-60">
                          {tasksForDate.length} tasks
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats */}
            {stats && (
              <div className="flex flex-col gap-4">
                <h4 className="pup-body-md-500 text-neutral-black mb-2">Phase Progress</h4>
                <ProgressSection
                  label="Overall Progress"
                  value={stats.completedTasks}
                  total={stats.totalTasks}
                  colorClass="bg-dark-blue"
                />
                <ProgressSection
                  label="My Progress"
                  value={stats.assignedCompletedTasks}
                  total={stats.assignedTasks}
                  colorClass="bg-primary-orange"
                />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      {/* Sticky Header & Filters */}
      <div ref={headerRef} className="sticky top-0 bg-white z-20 pt-4 pb-8 mb-4">
        {/* Heading section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          {phase ? (
            <h1 className="pup-heading-three text-2xl md:text-3xl">
              {phase.name}{" "}
              <span className="text-neutral-grey text-lg md:text-xl">
                ({phase._count.tasks} tasks)
              </span>
            </h1>
          ) : (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-64" />
            </div>
          )}
          <div className="flex gap-2 w-full sm:w-auto">
            <OutlineButton
              title="Options"
              onClick={() => setIsFilterOpen(true)}
              className="flex-1 sm:flex-none lg:hidden border-neutral-light-grey text-neutral-black"
            />
            <PrimaryButton
              title="Add Task"
              type="button"
              className="flex-1 sm:w-auto"
              onClick={() => setAddTaskIsOpen(true)}
            />
          </div>
        </div>

        {/* Filter Section - Desktop only */}
        {phase ? <div className="hidden lg:flex flex-wrap gap-4 items-center">
          <SearchInput
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full lg:max-w-128"
          />

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2 items-center">
              <p className="pup-body-sm-500 text-neutral-grey tracking-wider whitespace-nowrap">
                Assigned To
              </p>
              <MemberSelect
                data={members || []}
                selectedMember={selectedAssignee}
                setSelectedMember={setSelectedAssignee}
                variant="mini"
                placeholder="All"
              />
              <button
                onClick={() => setSelectedAssignee(null)}
                className={cn(
                  "p-1 hover:bg-neutral-light-grey rounded-full transition-opacity",
                  selectedAssignee
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none",
                )}
                title="Clear filter"
              >
                <MdClose className="text-neutral-grey size-4" />
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <p className="pup-body-sm-500 text-neutral-grey tracking-wider whitespace-nowrap">
                Created By
              </p>
              <MemberSelect
                data={members || []}
                selectedMember={selectedCreator}
                setSelectedMember={setSelectedCreator}
                variant="mini"
                placeholder="All"
              />
              <button
                onClick={() => setSelectedCreator(null)}
                className={cn(
                  "p-1 hover:bg-neutral-light-grey rounded-full transition-opacity",
                  selectedCreator
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none",
                )}
                title="Clear filter"
              >
                <MdClose className="text-neutral-grey size-4" />
              </button>
            </div>
          </div>

          <div className="flex p-1 bg-neutral-light-grey rounded-lg ml-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleViewChange("timeline")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all cursor-pointer",
                    view === "timeline"
                      ? "bg-white shadow-sm text-neutral-black"
                      : "text-neutral-grey hover:text-neutral-dark-grey",
                  )}
                >
                  <MdOutlineTimeline size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Timeline View</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleViewChange("table")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all cursor-pointer",
                    view === "table"
                      ? "bg-white shadow-sm text-neutral-black"
                      : "text-neutral-grey hover:text-neutral-dark-grey",
                  )}
                >
                  <MdOutlineTableChart size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Table View</TooltipContent>
            </Tooltip>
          </div>
        </div> : <div className="hidden lg:flex flex-col gap-2">
          <Skeleton className="h-10 w-64" />
        </div>}
      </div>
      {/* Main Body */}
      <div className="flex flex-col gap-8 pb-12">
        {isLoading ? (
          view === "timeline" ? (
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
              <div className="flex flex-col gap-8 flex-1 w-full">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-l-4 border-neutral-light-grey pb-12 w-full">
                    <div className="flex gap-4 items-center mb-6">
                      <div className="w-8 h-1 bg-neutral-light-grey"></div>
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="flex flex-col gap-4 pl-4 sm:pl-12">
                      <Skeleton className="h-32 w-full rounded-xl" />
                      <Skeleton className="h-32 w-full rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4 w-full lg:w-40">
                <Skeleton className="h-5 w-24 mb-2" />
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-4 w-20" />
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="w-full">
                <div className="flex border-b border-neutral-light-grey py-4 px-4 gap-4">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex border-b border-neutral-light-grey py-6 px-4 gap-4">
                    <Skeleton className="h-5 flex-1" />
                    <Skeleton className="h-5 w-32" />
                    <div className="flex items-center gap-2 w-32">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center gap-2 w-32">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : tasks.length === 0 ? (
          <p>No tasks found. Add new tasks to get started.</p>
        ) : view === "timeline" ? (
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            {/* Timeline View */}
            <div className="flex flex-col flex-1 w-full">
              {Object.entries(groupedTasks).map(([date, tasksForDate]) => {
                const isActive = activeDate === date;
                return (
                  <div
                    key={date}
                    data-date={date}
                    ref={(el) => {
                      dateRefs.current[date] = el;
                    }}
                    className="relative pl-10 sm:pl-12 pb-12 w-full"
                  >
                    {/* Vertical Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-neutral-light-grey" />

                    {/* Node */}
                    <div
                      className={cn(
                        "absolute left-[10px] top-2 w-3 h-3 rounded-full border-2 border-white transition-all duration-500 z-0",
                        isActive
                          ? "bg-primary-orange scale-150 shadow-[0_0_0_4px_rgba(255,107,0,0.1)]"
                          : "bg-neutral-grey"
                      )}
                    />

                    <div className="flex gap-4 items-center mb-6">
                      <p className={cn(
                        "pup-body-xl-500 transition-colors duration-300",
                        isActive ? "text-primary-orange" : "text-neutral-black"
                      )}>
                        {date}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4">
                      {tasksForDate.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={() => {
                            setViewTask(task.id);
                            setViewTaskIsOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              {/* Load More Sentinel */}
              <div ref={loadMoreRef} className="h-10 w-full flex justify-center py-4">
                {isFetchingNextPage && <Skeleton className="h-20 w-full rounded-xl" />}
              </div>
            </div>

            {/* Quick access section - Desktop only */}
            <div className="hidden lg:block lg:sticky lg:top-48 self-start w-full lg:w-72">
              <Accordion type="single" collapsible defaultValue="quick-access">
                <AccordionItem value="quick-access" className="border-none">
                  <AccordionTrigger className="hover:no-underline py-0 mb-4">
                    <h4 className="pup-body-md-500 text-neutral-black">Quick Access</h4>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="relative pl-4  border-neutral-light-grey ml-1 flex flex-col max-h-[320px] overflow-y-auto pup-scrollbar-hide pr-2">
                      {Object.entries(groupedTasks).map(([date, tasksForDate]) => {
                        const isActive = activeDate === date;
                        return (
                          <div
                            key={date + "toc"}
                            className="relative group pb-1"
                          >
                            {/* Timeline Node */}
                            <div className="w-[1px] absolute inset-y-0 left-0 -translate-x-[5px] h-full bg-neutral-light-grey" />
                            <div
                              className={cn(
                                "absolute -left-[10px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white transition-all duration-300",
                                isActive
                                  ? "bg-primary-orange scale-125 shadow-[0_0_0_2px_rgba(255,107,0,0.2)]"
                                  : "bg-neutral-light-grey group-hover:bg-neutral-grey"
                              )}
                            />

                            <button
                              onClick={() => scrollToDate(date)}
                              className={cn(
                                "w-full text-left py-2 px-2 rounded-md transition-all duration-200 flex justify-between items-center",
                                isActive
                                  ? "pup-body-sm-500 text-primary-orange bg-orange-50/50"
                                  : "pup-body-sm-400 text-neutral-grey hover:text-neutral-dark-grey hover:bg-neutral-50"
                              )}
                            >
                              <span>{date}</span>
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full border",
                                isActive
                                  ? "border-orange-200 bg-white text-primary-orange"
                                  : "border-neutral-100 bg-neutral-50 text-neutral-400"
                              )}>
                                {tasksForDate.length} {tasksForDate.length === 1 ? 'task' : 'tasks'}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {stats && (
                <Accordion type="single" collapsible defaultValue="phase-progress">
                  <AccordionItem value="phase-progress" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0 mb-4 mt-8">
                      <h4 className="pup-body-md-500 text-neutral-black">Phase Progress</h4>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                      <div className="flex flex-col gap-4">
                        <ProgressSection
                          label="Overall Progress"
                          value={stats.completedTasks}
                          total={stats.totalTasks}
                          colorClass="bg-dark-blue"
                        />
                        <ProgressSection
                          label="My Progress"
                          value={stats.assignedCompletedTasks}
                          total={stats.assignedTasks}
                          colorClass="bg-primary-orange"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-light-grey">
                  <th className="py-4 px-4 pup-body-md-500 text-neutral-black tracking-wider">
                    Task Name
                  </th>
                  <th className="py-4 px-4 pup-body-md-500 text-neutral-black tracking-wider">
                    Due Date
                  </th>
                  <th className="py-4 px-4 pup-body-md-500 text-neutral-black tracking-wider">
                    Assignee
                  </th>
                  <th className="py-4 px-4 pup-body-md-500 text-neutral-black tracking-wider">
                    Created By
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-neutral-light-grey hover:bg-neutral-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setViewTask(task.id);
                      setViewTaskIsOpen(true);
                    }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {task.isComplete ? (
                          <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                        ) : (
                          <Circle size={18} className="text-neutral-300 shrink-0" />
                        )}
                        <p
                          className={cn(
                            "pup-body-md-500 text-neutral-black",
                            task.isComplete && "line-through text-neutral-grey",
                          )}
                        >
                          {task.name}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="pup-body-md-400 text-neutral-dark-grey">
                        {task.dueDate
                          ? new Intl.DateTimeFormat("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(task.dueDate))
                          : "-"}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <ProfileAvatar
                            src={task.assignee.profilePicture}
                            alt={task.assignee.name}
                            size="sm"
                          />
                          <span className="pup-body-sm-400">
                            {task.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-grey pup-body-sm-400">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <ProfileAvatar
                          src={task.creator.profilePicture}
                          alt={task.creator.name}
                          size="sm"
                        />
                        <span className="pup-body-sm-400">
                          {task.creator.name}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination - only for table view */}
        {view === "table" && !isLoading && totalPages > 1 && (
          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="cursor-pointer rounded-lg border border-off-white px-3 py-1.5 pup-body-sm-400 text-neutral-dark-grey disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="pup-body-sm-400 text-neutral-grey">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="cursor-pointer rounded-lg border border-off-white px-3 py-1.5 pup-body-sm-400 text-neutral-dark-grey disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}


