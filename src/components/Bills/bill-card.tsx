import { MdOutlineChevronRight } from "react-icons/md";
import type { Bill } from "./-queries";
import { toSentenceCase } from "@/lib/utils";

interface BillCardProps {
  bill: Bill;
  onClick?: () => void;
}

export default function BillCard({ bill, onClick }: BillCardProps) {
  return (
    <div
      onClick={onClick}
      className="py-4 pl-6 flex gap-6 justify-between items-center cursor-pointer shadow-[1px_2px_5px_rgba(0,0,0,0.18)] rounded-[8px]"
    >
      <div>
        <p className="pup-body-lg-500 text-neutral-black mb-0.5">
          <span>{bill.title}</span>
          <span className="text-neutral-dark-grey">{` — ${bill.amount.toLocaleString(
            "en-US",
            {
              style: "currency",
              currency: "NPR",
            },
          )}`}</span>
        </p>
        <div className="flex gap-2 pup-body-sm-400 text-neutral-dark-grey">
          <span>{`${toSentenceCase(bill.splitType)} split`}</span>
          {bill.category && (
            <>
              <span>•</span>
              <span>{bill.category}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-6 items-center">
        <div className="flex">
          {/* {bill.assignee && (
            <ProfileAvatar
              alt={bill.assignee.name}
              src={bill.assignee.profilePicture}
              size="md"
            />
          )} */}
        </div>
        <span className="w-10 h-10 p-2">
          <MdOutlineChevronRight size={24} />
        </span>
      </div>
    </div>
  );
}
