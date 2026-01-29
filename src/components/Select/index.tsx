import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SimpleSelectProps<T extends string> {
  items: readonly T[];
  value: T;
  placeholder?: string;
  onValueChange: (value: T) => void;
  label?: string;
  className?: string;
}

export function SimpleSelect<T extends string>({
  items,
  value,
  onValueChange,
  placeholder = "Select an option",
  label,
  className,
}: SimpleSelectProps<T>) {
  return (
    <div className={className}>
      {label && (
        <label className="pup-body-md-500 block text-neutral-black mb-1.5">
          {label}
        </label>
      )}

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          data-size="default"
          className="border-neutral-light-grey border rounded-[8px] px-3.5 py-2.5 w-full data-[size=default]:h-11.5"
        >
          <SelectValue
            placeholder={placeholder}
            className="pup-body-medium-400 text-neutral-black"
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
