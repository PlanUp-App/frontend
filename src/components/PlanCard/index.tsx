import { Link } from "@tanstack/react-router";
import { Globe, Lock } from "lucide-react";

export type Member = {
  joinedAt: string;
  user: { id: string; name: string; profilePicture?: string };
};

export type PlanCardProps = {
  id: string;
  coverImage?: string;
  currentUserId?: string;
  name: string;
  members?: Member[];
  memberCount?: number;
  isPublic?: boolean;
  linkTo: string;
};

function membersToString(
  members: Member[] | undefined,
  currentUserId: string = "",
) {
  const names =
    members
      ?.filter((m) => m.user.id !== currentUserId)
      .map((m) => m.user.name) ?? [];

  if (names.length === 0) return "";

  if (names.length <= 2) {
    return `With ${names.join(" and ")}`;
  }

  if (names.length <= 6) {
    return `With ${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
  }

  return `With ${names.slice(0, 5).join(", ")} and ${names.length - 5} others`;
}

export default function PlanCard({
  id,
  coverImage = "https://res.cloudinary.com/dxu7hcg4g/image/upload/v1764864772/Placeholder_Plan_pohwic.png",
  name,
  members,
  currentUserId,
  isPublic,
  memberCount,
  linkTo,
}: PlanCardProps) {
  return (
    <div>
      <Link to={linkTo}>
        <figure className="relative">
          <img
            src={
              coverImage ||
              "https://res.cloudinary.com/dxu7hcg4g/image/upload/v1764864772/Placeholder_Plan_pohwic.png"
            }
            className="aspect-4/3 object-cover"
          />
          <div className="absolute top-2 right-2 bg-off-white/80 backdrop-blur rounded-full p-1">
            {isPublic ? (
              <Globe size={16} className="text-neutral-dark-grey" />
            ) : (
              <Lock size={16} className="text-neutral-dark-grey" />
            )}
          </div>
        </figure>
        <div className="py-4">
          <h3 className="pup-heading-three mb-2 text-neutral-black">{name}</h3>
          <span className="pup-body-md-400 text-neutral-black">
            {memberCount
              ? `${memberCount} ${memberCount == 1 ? "member" : "members"}`
              : members && members.length > 1
                ? membersToString(members, currentUserId)
                : "Solo project"}
          </span>
        </div>
      </Link>
    </div>
  );
}
