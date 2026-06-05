import React from "react";
import { useFormContext } from "react-hook-form";

// Generic Input for Text, Number, Date, Time
export const FormInput = ({ name, label, type = "text", className, ...props }) => {
  const { register, formState: { errors } } = useFormContext();
  
  // Helper to access nested errors (e.g. partners[0].rate)
  const getError = (name) => {
    return name.split('.').reduce((obj, key) => obj?.[key], errors);
  };
  
  const error = getError(name);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full rounded-lg border bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-red-500 focus:ring-red-200" : "border-gray-300 dark:border-gray-600"}
        `}
        {...register(name)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
};