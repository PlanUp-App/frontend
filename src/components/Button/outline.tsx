import { Link } from "@tanstack/react-router";
import { twMerge } from "tailwind-merge";
import { Spinner } from "../ui/spinner";

export function OutlineButton({
  title,
  className,
  link,
  type = "button",
  onClick,
  isLoading = false,
}: {
  title?: string;
  className?: string;
  link?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  isLoading?: boolean;
}) {
  const baseClasses = twMerge(
    `h-11 flex items-center justify-center px-6 text-white rounded-full border-2 border-white pup-body-md-500 cursor-pointer`,
    className
  );

  if (link) {
    return (
      <Link to={link} className={baseClasses}>
        {title}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading && <Spinner />}
      {title}
    </button>
  );
}
