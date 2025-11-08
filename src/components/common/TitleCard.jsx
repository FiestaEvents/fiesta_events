const TitleCard = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  padding = "default",
  hover = false,
  className = "",
}) => {
  // Padding styles
  const paddings = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
  };

  const hoverStyles = hover
    ? "hover:shadow-lg transition-shadow cursor-pointer"
    : "";

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 ${hoverStyles} ${className}`}
    >
      {/* Header */}
      {(title || subtitle || headerAction) && (
        <div
          className={`flex items-start justify-between border-b border-gray-200 ${paddings[padding]}`}
        >
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {headerAction && <div className="ml-4">{headerAction}</div>}
        </div>
      )}

      {/* Body */}
      <div
        className={
          title || subtitle || headerAction
            ? paddings[padding]
            : paddings[padding]
        }
      >
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div
          className={`border-t border-gray-200 bg-gray-50 rounded-b-lg ${paddings[padding]}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default TitleCard;
