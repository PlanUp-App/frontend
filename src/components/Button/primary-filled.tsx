import { Link } from "@tanstack/react-router";
import { twMerge } from "tailwind-merge";
import { Spinner } from "../ui/spinner";

interface PrimaryButtonProps {
  title?: string;
  className?: string;
  link?: string;
  isLoading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export function PrimaryButton({
  title,
  className,
  isLoading = false,
  disabled,
  link,
  type = "button",
  onClick,
}: PrimaryButtonProps) {
  const baseClasses = twMerge(
    `h-11 flex gap-2 items-center justify-center px-6 text-white rounded-full bg-primary-orange pup-body-md-500`,
    className,
    isLoading || disabled
      ? "cursor-not-allowed opacity-50"
      : "cursor-pointer hover:bg-primary-orange/90",
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
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading && <Spinner />}
      {title}
    </button>
  );
}
