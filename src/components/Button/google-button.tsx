import { twMerge } from "tailwind-merge";
import { Spinner } from "../ui/spinner";

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.7 1.22 9.19 3.6l6.85-6.85C35.91 2.36 30.4 0 24 0 14.62 0 6.51 5.48 2.56 13.44l7.98 6.2C12.44 13.28 17.73 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24c0-1.57-.14-3.09-.4-4.55H24v9.1h12.7c-.55 2.97-2.22 5.49-4.73 7.18l7.33 5.7C43.98 36.88 46.5 30.9 46.5 24z"
      />
      <path
        fill="#FBBC05"
        d="M10.54 28.64A14.5 14.5 0 019.5 24c0-1.62.28-3.19.78-4.64l-7.98-6.2A23.94 23.94 0 000 24c0 3.93.94 7.65 2.6 10.94l7.94-6.3z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.92-2.14 15.9-5.83l-7.33-5.7c-2.03 1.36-4.63 2.16-8.57 2.16-6.27 0-11.56-3.78-13.46-9.14l-7.94 6.3C6.51 42.52 14.62 48 24 48z"
      />
    </svg>
  );
}

export function GoogleButton({
  title = "Continue with Google",
  className,
  type = "button",
  onClick,
  isLoading = false,
}: {
  title?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  isLoading?: boolean;
}) {
  const baseClasses = twMerge(
    `h-11 flex items-center justify-center gap-3 px-6 
     bg-white text-black rounded-full 
     border border-gray-300 
     pup-body-md-500 cursor-pointer 
     hover:bg-gray-100 transition-colors`,
    className,
  );

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <GoogleIcon />
          {title}
        </>
      )}
    </button>
  );
}
