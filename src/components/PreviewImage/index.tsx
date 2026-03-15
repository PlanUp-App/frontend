import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showBorder?: boolean;
}

export function ProfileAvatar({
  src,
  alt = "Profile",
  size = "md",
  className,
  showBorder = false,
}: ProfileAvatarProps) {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-32 h-32 text-2xl",
  };

  const initials = alt
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const base = cn(
    sizeClasses[size],
    "rounded-full shrink-0",
    showBorder && "border-2 border-gray-200",
    className,
  );

  if (!src) {
    return (
      <div
        className={cn(
          base,
          "bg-orange-100 text-primary-orange font-medium flex items-center justify-center shrink-0",
        )}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(base, "object-cover shadow-md aspect-square")}
    />
  );
}
