import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      iconPosition = "left",
      onIconClick,
      fullWidth = false,
      required = false,
      disabled = false,
      className = "",
      containerClassName = "",
      ...props
    },
    ref
  ) => {
    const baseInputStyles =
      "block border rounded-md px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed";

    const errorStyles = error
      ? "border-red-300 focus:ring-red-500"
      : "border-gray-300";
    const widthClass = fullWidth ? "w-full" : "";
    const paddingLeft = Icon && iconPosition === "left" ? "pl-10" : "pl-3";
    const paddingRight = Icon && iconPosition === "right" ? "pr-10" : "pr-3";

    return (
      <div className={containerClassName}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label} {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {Icon && iconPosition === "left" && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-4 w-4 text-gray-400" />
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            disabled={disabled}
            className={`${baseInputStyles} ${errorStyles} ${paddingLeft} ${paddingRight} ${widthClass} ${className}`}
            {...props}
          />

          {/* Right Icon */}
          {Icon && iconPosition === "right" && (
            <button
              type="button"
              onClick={onIconClick}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <Icon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 flex items-start gap-1.5">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
