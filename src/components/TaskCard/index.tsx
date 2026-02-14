import { MdOutlineChevronRight } from "react-icons/md";
import { ProfileAvatar } from "../PreviewImage";
import type { Task } from "@/routes/_authenticated/my-plans/$planId/_layout/phases/$phaseId/-queries";
import { dateFormat } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <div
      onClick={onClick}
      className="py-4 pl-6 flex gap-6 justify-between items-center cursor-pointer shadow-[1px_2px_5px_rgba(0,0,0,0.18)] rounded-[8px]"
    >
      <div>
        <p className="pup-body-lg-500 text-neutral-black mb-0.5">{task.name}</p>
        <div className="flex gap-2 pup-body-sm-400 text-neutral-dark-grey">
          <span>{dateFormat(task.dueDate || new Date().toISOString())}</span>
          {/* <span>•</span>
          <span>Transport</span> */}
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
