import React from "react";
import { useFormContext } from "react-hook-form";
import { AlertCircle, ChevronDown } from "lucide-react";

export const FormSelect = ({ name, label, options, placeholder = "Select...", className, ...props }) => {
  const { register, formState: { errors } } = useFormContext();
  const error = name.split('.').reduce((obj, key) => obj?.[key], errors);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          className={`
            w-full rounded-lg border appearance-none bg-white dark:bg-gray-800 px-4 py-2.5 text-sm transition-colors
            outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50
            ${error ? "border-red-500" : "border-gray-200 dark:border-gray-700"}
          `}
          {...register(name)}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Custom Arrow Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
           <ChevronDown size={16} />
        </div>
      </div>
      
      {error && (
        <div className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium">
           <AlertCircle size={12} />
           {error.message}
        </div>
      )}
    </div>
  );
};