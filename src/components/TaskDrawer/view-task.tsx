import { OutlineButton } from "../Button/outline";
import { PrimaryButton } from "../Button/primary-filled";
import { SheetContent, SheetFooter, SheetClose, Sheet } from "../ui/sheet";
import { Spinner } from "../ui/spinner";
import { useGetTask } from "./-queries";
import { dateFormat } from "@/lib/utils";
import { RichTextParser } from "../RichTextParser";
import MemberCard from "../MemberCard";
import { useState } from "react";
import TaskDrawer from "./add-task";

export default function ViewTaskDrawer({
  open,
  onOpenChange,
  planId,
  phaseId,
  taskId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  phaseId: string;
  taskId: string;
}) {
  const {
    data: task,
    isLoading,
    isError,
  } = useGetTask(planId, phaseId, taskId);

  const [isEdit, setIsEdit] = useState(false);

  if (!isEdit)
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="max-w-[50%] min-w-[40%] px-8 py-12 overflow-scroll gap-10">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <p>An error occured</p>
          ) : (
            <>
              <div className="flex gap-3 items-center">
                <h3 className="pup-body-xl-700 text-neutral-black">
                  {task?.data.name}
                </h3>
                <span>•</span>
                <span className="pup-body-xl-400 text-neutral-grey">
                  {task?.data.dueDate
                    ? dateFormat(task?.data.dueDate)
                    : "Invalid Date"}
                </span>
              </div>
              <div>
                <RichTextParser html={task?.data.description} />
              </div>
              <div>
                <label className="pup-body-md-500 block text-neutral-black mb-4">
                  Assigned to:
                </label>
                {task?.data.assignee ? (
                  <MemberCard
                    id={task?.data.assignee.id}
                    name={task?.data.assignee?.name}
                    email={task?.data.assignee.email}
                    profilePicture={task?.data.assignee.profilePicture}
                    hasOptions={false}
                    type="sm"
                  />
                ) : (
                  <p>No one</p>
                )}
              </div>
              <SheetFooter>
                <PrimaryButton
                  type="submit"
                  title="Edit"
                  onClick={() => setIsEdit(true)}
                />
                <SheetClose asChild>
                  <OutlineButton
                    title="Close"
                    className="border-primary-orange text-primary-orange"
                  />
                </SheetClose>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    );

  return (
    <TaskDrawer
      open={open}
      onOpenChange={onOpenChange}
      planId={planId}
      phaseId={phaseId}
      onClose={() => setIsEdit(false)}
      initialData={{
        taskId: task?.data.id ?? "",
        name: task?.data.name ?? "",
        description: task?.data.description ?? "<p></p>",
        dueDate: task?.data.dueDate || new Date().toISOString(),
        assignee: task?.data.assignee
          ? {
              value: task.data.assignee.id,
              label: task.data.assignee.name,
              email: task.data.assignee.email,
              profilePicture: task.data.assignee.profilePicture,
            }
          : null,
      }}
    />
  );
}
