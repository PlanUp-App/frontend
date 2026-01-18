import { PrimaryButton } from "@/components/Button/primary-filled";
import TaskCard from "@/components/TaskCard";
import TaskDrawer from "@/components/TaskDrawer/add-task";
import ViewTaskDrawer from "@/components/TaskDrawer/view-task";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { MdOutlineAddCircleOutline } from "react-icons/md";
import { useGetTasks, type Task } from "./-queries";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$plan-id/_layout/phases/$phase-id/",
)({
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

function RouteComponent() {
  const [addTaskIsOpen, setAddTaskIsOpen] = useState(false);
  const [viewTaskIsOpen, setViewTaskIsOpen] = useState(false);
  const [viewTask, setViewTask] = useState("");
  const { "plan-id": planId, "phase-id": phaseId } = Route.useParams();
  const { data, isLoading } = useGetTasks(planId, phaseId);
  const tasks = data?.tasks || [];

  const groupedTasks = groupTasksByDate(tasks);

  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollToDate = (date: string) => {
    const element = dateRefs.current[date];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
      {/* Heading section */}
      <div className="flex justify-between mb-12 py-4 sticky top-0 bg-white">
        <h1 className="pup-heading-three">
          {data?.name}{" "}
          <span className="text-neutral-grey">
            ({data?._count.tasks} tasks)
          </span>
        </h1>
        <PrimaryButton
          title="Add Task"
          type="button"
          onClick={() => setAddTaskIsOpen(true)}
        />
      </div>
      {/* Main Body */}
      <div className="flex justify-between items-start">
        {/* Date Section */}
        {isLoading ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <p>Add tasks to get started</p>
        ) : (
          <div>
            {Object.entries(groupedTasks).map(([date, tasksForDate]) => (
              <div
                key={date}
                ref={(el) => {
                  dateRefs.current[date] = el;
                }}
                className="border-l-4 border-neutral-dark-grey w-[516px] pb-12 scroll-mt-24"
              >
                <div className="flex gap-4 items-center mb-4">
                  <div className="w-8 h-1 bg-neutral-grey"></div>
                  <p className="pup-body-xl-400">{date}</p>
                </div>
                <div className="flex flex-col gap-4 pl-12">
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
                  {/* <button className="cursor-pointer">
                    <MdOutlineAddCircleOutline
                      size={32}
                      className="text-dark-blue"
                    />
                  </button> */}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick access section */}
        {tasks.length !== 0 ? (
          <div className="sticky top-24">
            <h4 className="pup-body-md-500 mb-4 w-56">Quick Access</h4>
            {Object.keys(groupedTasks).map((date, index) => (
              <div
                key={date + "toc"}
                className={`py-2 cursor-pointer pup-body-sm-400 text-neutral-black`}
                onClick={() => scrollToDate(date)}
              >
                {date}
              </div>
            ))}
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
