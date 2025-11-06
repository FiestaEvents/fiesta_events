const IconBadge = ({
  children,
  variant = "default",
  size = "md",
  dot = false,
  icon: Icon,
  className = "",
}) => {
  // Variant styles
  const variants = {
    default: "bg-gray-100 text-gray-700 border-gray-200",
    primary: "bg-purple-100 text-purple-700 border-purple-200",
    success: "bg-green-100 text-green-700 border-green-200",
    danger: "bg-red-100 text-red-700 border-red-200",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
  };

  // Size styles
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  // Icon sizes
  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  // Dot sizes
  const dotSizes = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && <span className={`${dotSizes[size]} rounded-full bg-current`} />}
      {Icon && <Icon className={iconSizes[size]} />}
      {children}
    </span>
  );
};

export default IconBadge;
