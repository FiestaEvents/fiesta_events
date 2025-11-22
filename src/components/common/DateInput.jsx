// src/components/common/DateInput.jsx
import React, { useRef } from "react";
import { Calendar } from "lucide-react";
import Input from "./Input"; // Import your existing Input component

const DateInput = ({ label, name, value, onChange, error, required, min, disabled }) => {
  const dateInputRef = useRef(null);

  // Helper: Convert YYYY-MM-DD (Backend) to DD/MM/YYYY (Display)
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleDivClick = () => {
    if (!disabled && dateInputRef.current) {
      // Open the native date picker
      if (dateInputRef.current.showPicker) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <div className="relative">
      {/* 1. The Visible "Pretty" Input (Read Only) */}
      <div onClick={handleDivClick} className="cursor-pointer">
        <Input
          label={label}
          icon={Calendar}
          value={formatDateForDisplay(value)}
          placeholder="DD/MM/YYYY"
          error={error}
          required={required}
          disabled={disabled}
          readOnly // User cannot type, must pick from calendar
          className="cursor-pointer pointer-events-none bg-white dark:bg-gray-800" // pointer-events-none ensures click goes to div
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
        className="absolute bottom-0 left-0 w-full h-0 opacity-0 pointer-events-none"
        style={{ visibility: "hidden", position: "absolute" }} // Hide visually but keep in DOM
      />
    </div>
  );
};

export default DateInput;