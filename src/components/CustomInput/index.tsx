import "@/styles/_typography.scss";

export function CustomInput({
  label,
  placeholder,
  type = "text",
}: {
  placeholder?: string;
  label: string;
  type: "text" | "password" | "email";
}) {
  return (
    <div className="w-2xs">
      <label className="pup-body-md-500 block text-neutral-black mb-1.5">
        {label}
      </label>
      <input
        type={type}
        id={label}
        placeholder={placeholder}
        className="border-neutral-light-grey border pup-body-medium-400 placeholder:text-neutral-grey text-neutral-black rounded-[8px] px-3.5 py-2.5 w-full"
      />
    </div>
  );
}
