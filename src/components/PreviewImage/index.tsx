// components/ProfileAvatar/ProfileAvatar.tsx
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
  className = "",
  showBorder = true,
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

  const borderClass = showBorder ? "border-2 border-gray-200" : "";

  if (!src) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} ${borderClass}
                    bg-neutral-grey text-white  rounded-full flex items-center justify-center font-semibold
                    shadow-md shrink-0`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} ${className} ${borderClass}
                  rounded-full object-cover shadow-md flex-shrink-0`}
    />
  );
}
