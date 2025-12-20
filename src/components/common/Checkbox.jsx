import React from "react";
import { Check } from "lucide-react";

const Checkbox = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <div
          onClick={() => !disabled && onChange({ target: { checked: !checked } })}
          className={`
            w-5 h-5 border-2 rounded-md flex items-center justify-center cursor-pointer transition-all
            ${
              checked
                ? "bg-orange-500 border-orange-500"
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-orange-400"}
            ${error ? "border-red-500" : ""}
            peer-focus:ring-2 peer-focus:ring-orange-500 peer-focus:ring-offset-2
          `}
        >
          {checked && <Check size={16} className="text-white" strokeWidth={3} />}
        </div>
      </div>
      {label && (
        <label
          onClick={() => !disabled && onChange({ target: { checked: !checked } })}
          className={`
            ml-2 text-sm cursor-pointer select-none
            ${disabled ? "text-gray-400 cursor-not-allowed" : "text-gray-700 dark:text-gray-300"}
            ${error ? "text-red-600 dark:text-red-400" : ""}
          `}
        >
          {label}
        </label>
      )}
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Checkbox;