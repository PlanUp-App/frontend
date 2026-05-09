import { MdOutlineChevronRight } from "react-icons/md";
import { ProfileAvatar } from "../PreviewImage";
import type { Task } from "@/routes/_authenticated/my-plans/$planId/_layout/phases/$phaseId/-queries";
import { cn, dateFormat } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <div
      onClick={onClick}
      className="py-3 sm:py-4 pl-4 sm:pl-6 pr-2 sm:pr-4 flex gap-3 sm:gap-6 justify-between items-center cursor-pointer shadow-[1px_2px_5px_rgba(0,0,0,0.18)] rounded-[8px] w-full"
    >
      <div className="flex gap-4 items-center">
        {task.isComplete ? (
          <CheckCircle2 size={20} className="text-green-500" />
        ) : (
          <Circle size={20} className="text-neutral-300" />
        )}
        <div>
          <p
            className={cn(
              "pup-body-lg-500 text-neutral-black mb-0.5",
              task.isComplete && "line-through text-neutral-grey",
            )}
          >
            {task.name}
          </p>
          <div className="flex gap-2 pup-body-sm-400 text-neutral-dark-grey">
            {task.dueDate && <span>{dateFormat(task.dueDate)}</span>}
            {/* <span>•</span>
          <span>Transport</span> */}
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-center">
        <div className="flex">
          {task.assignee && (
            <ProfileAvatar
              alt={task.assignee.name}
              src={task.assignee.profilePicture}
              size="md"
            />
          )}
        </div>
        <span className="w-10 h-10 p-2">
          <MdOutlineChevronRight size={24} />
        </span>
      </div>
    </div>
  );
}
