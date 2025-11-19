import "@/styles/_typography.scss";
import type { GetInputPropsReturnType } from "@mantine/form";

type Props = {
  className?: string;
  label: string;
  placeholder?: string;
  type?: "text" | "password" | "email";
  inputProps?: GetInputPropsReturnType;
};

export function CustomInput({
  className,
  label,
  placeholder,
  type = "text",
  inputProps,
}: Props) {
  return (
    <div className={className}>
      <label className="pup-body-md-500 block text-neutral-black mb-1.5">
        {label}
      </label>
      <input
        type={type}
        id={label}
        placeholder={placeholder}
        {...inputProps}
        className="border-neutral-light-grey border pup-body-medium-400 placeholder:text-neutral-grey text-neutral-black rounded-[8px] px-3.5 py-2.5 w-full"
      />
      {inputProps?.error && (
        <p className="text-red-500 pup-body-sm-400">{inputProps?.error}</p>
      )}
    </div>
  );
}
