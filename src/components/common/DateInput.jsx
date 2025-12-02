import React, { useRef, useId } from "react";
import { Calendar } from "lucide-react";
import Input from "./Input";

const DateInput = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  min,
  disabled,
  className,
}) => {
  const dateInputRef = useRef(null);
  const uniqueId = useId();

  // Format YYYY-MM-DD -> DD/MM/YYYY
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return "";
    const parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  const handleInputClick = (e) => {
    // Prevent the click from bubbling if needed, though usually not required
    // e.stopPropagation();

    if (!disabled && dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === "function") {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 
         FIX: 
         1. Removed the outer 'div' onClick.
         2. Passed onClick directly to the Input component.
         3. Removed 'pointer-events-none' so the Input can receive the click.
         4. Added 'caret-transparent' so the text cursor doesn't show up.
      */}
      <div className="group relative z-10">
        <Input
          id={`visible-${uniqueId}`}
          label={label}
          icon={Calendar}
          value={formatDateForDisplay(value)}
          placeholder="DD/MM/YYYY"
          error={error}
          required={required}
          disabled={disabled}
          readOnly
          onClick={handleInputClick} // ✅ Click is now strictly on the Input
          className="cursor-pointer caret-transparent bg-white dark:bg-gray-800 group-hover:border-orange-400 transition-colors"
        />
      </div>

      {/* Hidden Native Date Input */}
      <input
        id={`hidden-${uniqueId}`}
        ref={dateInputRef}
        type="date"
        name={name}
        value={value || ""}
        onChange={onChange}
        min={min}
        disabled={disabled}
        required={required}
        className="absolute bottom-0 left-0 w-full h-full opacity-0 pointer-events-none -z-10"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
};

export default DateInput;
