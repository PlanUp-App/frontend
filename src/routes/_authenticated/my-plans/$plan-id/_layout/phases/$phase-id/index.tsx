import { PrimaryButton } from "@/components/Button/primary-filled";
import TaskCard from "@/components/TaskCard";
import TaskDrawer from "@/components/TaskDrawer";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MdOutlineAddCircleOutline } from "react-icons/md";

export const Route = createFileRoute(
  "/_authenticated/my-plans/$plan-id/_layout/phases/$phase-id/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const dates = [
    "6 Jan 2026",
    "10 Jan 2026",
    "14 Jan 2026",
    "18 Jan 2026",
    "22 Jan 2026",
    "26 Jan 2026",
    "30 Jan 2026",
    "3 Feb 2026",
    "7 Feb 2026",
    "11 Feb 2026",
  ];

  const [addTaskIsOpen, setAddTaskIsOpen] = useState(false);

  return (
    <>
      <TaskDrawer open={addTaskIsOpen} onOpenChange={setAddTaskIsOpen} />
      {/* Heading section */}
      <div className="flex justify-between mb-12">
        <h1 className="pup-heading-three">First Phase of Plan</h1>
        <div className="flex gap-3">
          <PrimaryButton
            title="Add Task"
            type="button"
            onClick={() => setAddTaskIsOpen(true)}
          />
        </div>
      </div>
      {/* Main Body */}
      <div className="flex justify-between items-start">
        {/* Date Section */}
        <div>
          {dates.map((date) => (
            <div
              key={date}
              className="border-l-4 border-neutral-dark-grey w-[516px] pb-12"
            >
              <div className="flex gap-4 items-center mb-4">
                <div className="w-8 h-1 bg-neutral-grey"></div>
                <p className="pup-body-xl-400">{date}</p>
              </div>
              <div className="flex flex-col gap-4 pl-12">
                <TaskCard />
                <TaskCard />
                <button className="cursor-pointer">
                  <MdOutlineAddCircleOutline
                    size={32}
                    className="text-dark-blue"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick access section */}
        <div className="sticky top-12">
          <h4 className="pup-body-md-500 mb-4 w-56">Quick Access</h4>
          {dates.map((date, index) => (
            <div
              key={date + "toc"}
              className={`py-2 cursor-pointer pup-body-sm-400 text-neutral-black ${index && "text-neutral-grey"}`}
            >
              {date}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
