import { Link } from "@tanstack/react-router";
import { twMerge } from "tailwind-merge";

interface PrimaryButtonProps {
  title?: string;
  className?: string;
  link?: string;
  type?: "button" | "submit" | "reset";
}

export function PrimaryButton({
  title,
  className,
  link,
  type = "button",
}: PrimaryButtonProps) {
  const baseClasses = twMerge(
    "h-11 flex items-center justify-center px-6 text-white rounded-full bg-primary-orange body-md-500 cursor-pointer",
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
    <button type={type} className={baseClasses}>
      {title}
    </button>
  );
}
