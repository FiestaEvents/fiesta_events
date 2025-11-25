import React, { useRef } from "react";
import { Calendar } from "lucide-react";
import Input from "./Input"; 

const DateInput = ({ label, name, value, onChange, error, required, min, disabled, className }) => {
  const dateInputRef = useRef(null);

  // ✅ Tunisan Format Logic: Convert YYYY-MM-DD (Backend) -> DD/MM/YYYY (Display)
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return "";
    // Safety check to ensure we have a valid YYYY-MM-DD string
    const parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate; 
    
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  const handleDivClick = () => {
    if (!disabled && dateInputRef.current) {
      // Modern browsers support showPicker()
      if (typeof dateInputRef.current.showPicker === "function") {
        dateInputRef.current.showPicker();
      } else {
        // Fallback for older browsers
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 1. The Visible "Pretty" Input (Read Only) */}
      <div onClick={handleDivClick} className="cursor-pointer group">
        <Input
          label={label}
          icon={Calendar}
          value={formatDateForDisplay(value)}
          placeholder="DD/MM/YYYY" 
          error={error}
          required={required}
          disabled={disabled}
          readOnly // User cannot type directly, must use picker
          className="cursor-pointer pointer-events-none bg-white dark:bg-gray-800 group-hover:border-orange-400 transition-colors"
        />
      </div>

      {/* 2. The Hidden Native Date Input (Handles the Logic) */}
      <input
        ref={dateInputRef}
        type="date"
        name={name}
        value={value || ""}
        onChange={onChange}
        min={min}
        disabled={disabled}
        required={required}
        className="absolute bottom-0 left-0 w-full h-full opacity-0 pointer-events-none z-0"
        tabIndex={-1} 
        aria-hidden="true"
      />
    </div>
  );
};

export default DateInput;