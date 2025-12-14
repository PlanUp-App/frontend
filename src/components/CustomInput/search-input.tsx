import "@/styles/_typography.scss";
import type { GetInputPropsReturnType } from "@mantine/form";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

type Props = {
  className?: string;
  placeholder?: string;
  inputProps?: GetInputPropsReturnType;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function SearchInput({
  className,
  placeholder,
  inputProps,
  ...props
}: Props) {
  return (
    <div className={className}>
      <div className="relative w-full">
        <SearchOutlinedIcon
          fontSize="small"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-grey"
        />

        <input
          type="text"
          placeholder={placeholder}
          {...inputProps}
          {...props}
          className="border-neutral-light-grey border pup-body-medium-400 placeholder:text-neutral-grey text-neutral-black rounded-[8px] px-3.5 py-2.5 w-full pl-10.5"
        />
      </div>

      {inputProps?.error && (
        <p className="text-red-500 pup-body-sm-400">{inputProps?.error}</p>
      )}
    </div>
  );
}
