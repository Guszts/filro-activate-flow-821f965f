import PhoneInputBase from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  defaultCountry?: string;
  className?: string;
  required?: boolean;
}

export function PhoneInput({ value, onChange, placeholder = "WhatsApp", defaultCountry = "BR", className = "", required }: Props) {
  return (
    <div className={`phone-input-wrapper ${className}`}>
      <PhoneInputBase
        international
        defaultCountry={defaultCountry as never}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        placeholder={placeholder}
        countryCallingCodeEditable={false}
        className="flex h-12 px-3 rounded-xl border border-border bg-paper focus-within:border-ink"
        numberInputProps={{
          required,
          className: "flex-1 outline-none bg-transparent text-ink placeholder:text-ink-soft/60 ml-2",
        }}
      />
    </div>
  );
}
