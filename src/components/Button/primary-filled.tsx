import { Link } from "@tanstack/react-router";
import { twMerge } from "tailwind-merge";
import { Spinner } from "../ui/spinner";

interface PrimaryButtonProps {
  title?: string;
  className?: string;
  link?: string;
  isLoading?: boolean;
  type?: "button" | "submit" | "reset";
}

export function PrimaryButton({
  title,
  className,
  isLoading = false,
  link,
  type = "button",
}: PrimaryButtonProps) {
  const baseClasses = twMerge(
    `h-11 flex gap-2 items-center justify-center px-6 text-white rounded-full bg-primary-orange pup-body-md-500 ${isLoading ? "cursor-progress" : "cursor-pointer"}`,
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
    <button type={type} className={baseClasses} disabled={isLoading}>
      {isLoading && <Spinner />}
      {title}
    </button>
  );
}
