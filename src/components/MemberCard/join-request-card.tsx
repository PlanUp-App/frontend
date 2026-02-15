import { MdCheck, MdClose } from "react-icons/md";
import { ProfileAvatar } from "../PreviewImage";

type JoinRequestCardProps = {
  id: string;
  name: string;
  email?: string;
  profilePicture?: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isLoading?: boolean;
};

export default function JoinRequestCard({
  id,
  name,
  email,
  profilePicture,
  onApprove,
  onReject,
  isLoading,
}: JoinRequestCardProps) {
  return (
    <div className="py-3 flex gap-8 w-full border-b border-b-off-white">
      <div className="flex gap-4">
        <ProfileAvatar src={profilePicture} alt={name} className="w-14 h-14" />
        <div>
          <h3 className="pup-body-xl-400 text-neutral-black">{name}</h3>
          <span className="pup-body-sm-400 text-neutral-grey">{email}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onReject(id)}
          className="cursor-pointer w-9 h-9 rounded-full border-2 border-red-500 text-red-500 flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <MdClose size={18} />
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onApprove(id)}
          className="cursor-pointer w-9 h-9 rounded-full border-2 border-green-500 text-green-500 flex items-center justify-center hover:bg-green-50 transition-colors disabled:opacity-50"
        >
          <MdCheck size={18} />
        </button>
      </div>
    </div>
  );
}
