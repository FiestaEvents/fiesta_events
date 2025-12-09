import React, { useState, useRef } from "react";
import { Calendar } from "lucide-react";

const DateInput = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  min,
  max,
  className = "",
  disabled = false,
  placeholder = "DD/MM/YYYY",
  ...props
}) => {
  const dateInputRef = useRef(null);

  // ============================================
  // DATE FORMATTERS
  // ============================================
  
  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const formatToDisplay = (isoDate) => {
    if (!isoDate) return "";
    
    try {
      // Handle Date objects
      if (isoDate instanceof Date) {
        const day = String(isoDate.getDate()).padStart(2, "0");
        const month = String(isoDate.getMonth() + 1).padStart(2, "0");
        const year = isoDate.getFullYear();
        return `${day}/${month}/${year}`;
      }
      
      // Handle strings
      if (typeof isoDate === "string") {
        // Already in DD/MM/YYYY format
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(isoDate)) {
          return isoDate;
        }
        
        // ISO format YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
        const dateStr = isoDate.split("T")[0];
        const [year, month, day] = dateStr.split("-");
        
        if (year && month && day) {
          return `${day}/${month}/${year}`;
        }
      }
    } catch (e) {
      console.error("Date formatting error:", e);
    }
    
    return "";
  };

  // Convert DD/MM/YYYY to YYYY-MM-DD for backend
  const formatToISO = (displayDate) => {
    if (!displayDate) return "";
    
    try {
      const [day, month, year] = displayDate.split("/");
      if (day && month && year && year.length === 4) {
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      console.error("Date parsing error:", e);
    }
    
    return "";
  };

  // ============================================
  // HANDLERS
  // ============================================
  
  const handleDisplayChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // Remove non-digits
    
    // Auto-format as user types
    if (input.length >= 2) {
      input = input.slice(0, 2) + "/" + input.slice(2);
    }
    if (input.length >= 5) {
      input = input.slice(0, 5) + "/" + input.slice(5, 9);
    }
    
    // Update display
    e.target.value = input;
    
    // If complete date, convert to ISO and trigger onChange
    if (input.length === 10) {
      const isoDate = formatToISO(input);
      if (isoDate) {
        onChange({ target: { name, value: isoDate } });
      }
    }
  };

  const handleNativeDateChange = (e) => {
    const isoDate = e.target.value; // YYYY-MM-DD from native input
    onChange({ target: { name, value: isoDate } });
  };

  const handleCalendarClick = () => {
    // Trigger the hidden native date picker
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.(); // Modern browsers
    }
  };

  // ============================================
  // RENDER
  // ============================================
  
  const displayValue = formatToDisplay(value);
  const isoValue = typeof value === "string" && value.includes("-") ? value : formatToISO(value);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Visible Input - DD/MM/YYYY */}
        <input
          type="text"
          value={displayValue}
          onChange={handleDisplayChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={10}
          className={`
            w-full px-4 py-2.5 pr-10
            border rounded-lg
            text-gray-900 dark:text-white
            bg-white dark:bg-gray-800
            border-gray-300 dark:border-gray-600
            focus:ring-2 focus:ring-orange-500 focus:border-transparent
            disabled:bg-gray-100 dark:disabled:bg-gray-700
            disabled:cursor-not-allowed
            transition-colors
            ${error ? "border-red-500 focus:ring-red-500" : ""}
          `}
          {...props}
        />

        {/* Hidden Native Date Input - YYYY-MM-DD */}
        <input
          ref={dateInputRef}
          type="date"
          value={isoValue}
          onChange={handleNativeDateChange}
          min={min}
          max={max}
          disabled={disabled}
          className="absolute inset-0 opacity-0 pointer-events-none"
          tabIndex={-1}
        />

        {/* Calendar Icon - Triggers Native Picker */}
        <button
          type="button"
          onClick={handleCalendarClick}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:cursor-not-allowed"
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default DateInput;