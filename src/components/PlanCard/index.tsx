import { Link } from "@tanstack/react-router";

export type Member = {
  joinedAt: string;
  user: { id: string; name: string; profilePicture?: string };
};

export type PlanCardProps = {
  id: string;
  coverImage: string;
  name: string;
  members?: Member[];
};

function membersToString(members: Member[] | undefined) {
  if (!members || members.length === 0) return "";

  const names = members.map((m) => m.user.name);

  if (names.length <= 6) {
    // For small groups, just join nicely
    if (names.length === 1) return `With ${names[0]}`;
    if (names.length === 2) return `With ${names[0]} and ${names[1]}`;

    const last = names.pop();
    return `With ${names.join(", ")} and ${last}`;
  }

  const firstFive = names.slice(0, 5).join(", ");
  const extraCount = names.length - 5;

  return `With ${firstFive} and ${extraCount} others`;
}

export default function PlanCard({
  id,
  coverImage,
  name,
  members,
}: PlanCardProps) {
  return (
    <div>
      <Link to={`/my-plans/${id}`}>
        <figure>
          <img src={coverImage} className="aspect-4/3 object-cover" />
        </figure>
        <div className="py-4">
          <h3 className="pup-heading-three mb-2 text-neutral-black">{name}</h3>
          <span className="pup-body-md-400 text-neutral-black">
            {members?.length ? membersToString(members) : "Solo project"}
          </span>
        </div>
      </Link>
    </div>
  );
}
