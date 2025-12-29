import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PriceInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
  currency?: string;
}

const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
  ({ className, value = 0, onChange, currency = "HK$", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(
      value ? value.toString() : ""
    );
    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
      // Only update display value if not focused (user is not typing)
      if (!isFocused) {
        setDisplayValue(value ? value.toString() : "");
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Allow empty, numbers and one decimal point
      if (/^\d*\.?\d{0,2}$/.test(inputValue) || inputValue === "") {
        setDisplayValue(inputValue);
        const numericValue = parseFloat(inputValue) || 0;
        onChange?.(numericValue);
      }
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
      const numericValue = parseFloat(displayValue) || 0;
      const formattedValue = numericValue.toFixed(2);
      setDisplayValue(formattedValue);
      onChange?.(numericValue);
    };

    return (
      <div className="relative flex items-center">
        <span className="absolute left-3 text-sm font-medium text-muted-foreground pointer-events-none">
          {currency}
        </span>
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn("pl-14 text-right", className)}
          {...props}
        />
      </div>
    );
  }
);

PriceInput.displayName = "PriceInput";

export { PriceInput };
