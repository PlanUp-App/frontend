import { MdOutlineChevronRight } from "react-icons/md";
import { ProfileAvatar } from "../PreviewImage";

export default function TaskCard() {
  return (
    <div className="py-4 pl-6 flex gap-6 justify-between items-center cursor-pointer shadow-[1px_2px_5px_rgba(0,0,0,0.18)] rounded-[8px]">
      <div>
        <p className="pup-body-lg-500 text-neutral-black mb-0.5">
          Book Flight Tickets
        </p>
        <div className="flex gap-2 pup-body-sm-400 text-neutral-dark-grey">
          <span>24 Jun 2026</span>
          <span>•</span>
          <span>Transport</span>
        </div>
      </div>
      <div className="flex gap-6 items-center">
        <div className="flex">
          <ProfileAvatar alt="member" size="md" className="-ml-2" />
          <ProfileAvatar alt="member" size="md" className="-ml-2" />
        </div>
        <span className="w-10 h-10 p-2">
          <MdOutlineChevronRight size={24} />
        </span>
      </div>
    </div>
  );
}
