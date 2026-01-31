import "@/styles/_typography.scss";
import type { GetInputPropsReturnType } from "@mantine/form";

type Props = {
  className?: string;
  label?: string;
  placeholder?: string;
  type?: string;
  inputProps?: GetInputPropsReturnType;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
};

export function CustomInput({
  className,
  label,
  placeholder,
  type = "text",
  inputProps,
  disabled = false,
  error,
}: Props) {
  return (
    <div className={className}>
      {label && (
        <label className="pup-body-md-500 block text-neutral-black mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        id={label}
        placeholder={placeholder}
        {...inputProps}
        disabled={disabled}
        className="border-neutral-light-grey border pup-body-medium-400 placeholder:text-neutral-grey text-neutral-black rounded-[8px] px-3.5 py-2.5 w-full disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
      />
      {(inputProps?.error || error) && (
        <p className="text-red-500 pup-body-sm-400">
          {inputProps?.error || error}
        </p>
      )}
    </div>
  );
}
