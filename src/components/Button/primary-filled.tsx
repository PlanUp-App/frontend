import { Link } from "@tanstack/react-router";
import { twMerge } from "tailwind-merge";

export function PrimaryButton({
  title,
  className,
  link,
}: {
  title?: string;
  className?: string;
  link?: string;
}) {
  return (
    <Link
      to={link}
      className={twMerge(
        "h-11 flex items-center justify-center px-6 text-white rounded-full bg-primary-orange body-md-500",
        className
      )}
    >
      {title}
    </Link>
  );
}
