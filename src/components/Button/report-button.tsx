import { useState } from "react";
import { ReportModal } from "../Modals/report-user";
import { MdOutlineFlag } from "react-icons/md";

interface ReportButtonProps {
  userId: string;
  userName: string;
  planId?: string;
}

export function ReportButton({ userId, userName, planId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 pup-body-sm-400 text-neutral-dark-grey transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
      >
        <MdOutlineFlag size={13} />
        Report
      </button>

      <ReportModal
        open={open}
        onOpenChange={setOpen}
        reportedUserId={userId}
        reportedUserName={userName}
        planId={planId}
        targetId={userId}
      />
    </>
  );
}
