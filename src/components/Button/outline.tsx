import { Link } from "@tanstack/react-router";
import { twMerge } from "tailwind-merge";

export function OutlineButton({
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
        `h-11 flex items-center justify-center px-6 text-white rounded-full border-2 border-white body-md-500`,
        className
      )}
    >
      {title}
    </Link>
  );
}
