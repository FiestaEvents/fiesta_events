import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

const Textarea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      required = false,
      disabled = false,
      rows = 4,
      maxLength,
      showCount = false,
      className = "",
      containerClassName = "",
      value = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "block px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-y";

    const errorStyles = error
      ? "border-red-300 focus:ring-red-500"
      : "border-gray-300";

    const widthClass = fullWidth ? "w-full" : "";

    const currentLength = value?.length || 0;

    return (
      <div className={containerClassName}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          value={value}
          className={`${baseStyles} ${errorStyles} ${widthClass} ${className}`}
          {...props}
        />

        {/* Character Count & Helper Text Row */}
        <div className="mt-2 flex items-start justify-between gap-2">
          <div className="flex-1">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-1.5">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Helper Text */}
            {helperText && !error && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>

          {/* Character Count */}
          {showCount && maxLength && (
            <p
              className={`text-xs font-medium flex-shrink-0 ${
                currentLength > maxLength * 0.9
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
