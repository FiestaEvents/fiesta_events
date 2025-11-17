// src/components/common/Button.jsx
import React from "react";

const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  icon, 
  disabled,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-orange-500 text-white hover:bg-orange-600 disabled:hover:bg-orange-500",
    outline:
      "border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
    danger: "bg-red-500 text-white hover:bg-red-600 disabled:hover:bg-red-500",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-1.5 text-base",
    lg: "px-6 py-2 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {/* Make sure icon is properly rendered */}
      {icon && React.isValidElement(icon) ? icon : null}
      {children}
    </button>
  );
};

export default Button;
