// src/components/common/Toggle.jsx
import React from "react";

const Toggle = ({ enabled, onChange, label, disabled = false }) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-orange-500" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
    {label && (
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
    )}
  </div>
);

export default Toggle;