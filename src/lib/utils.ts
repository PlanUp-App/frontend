import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function censorEmail(email: string): string {
  const [local, domain] = email.split("@");

  if (local.length <= 2) {
    // If too short, keep first letter only
    return `${local[0]}*****@${domain}`;
  }

  const visible = local.slice(0, 2);
  const hidden = "*".repeat(local.length - 2);

  return `${visible}${hidden}@${domain}`;
}

export const dateFormat = (date: string) => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export function toSentenceCase(str: string) {
  if (!str) return "";

  return str
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase());
}
