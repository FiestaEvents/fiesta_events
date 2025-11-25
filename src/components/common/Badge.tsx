import React from 'react';
import { 
  badgeVariants, 
  sizeVariants, 
  combineVariantClasses,
  getStatusBadgeVariant 
} from '../../config/theme.config';

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon = null,
  dot = false,
  onRemove = null,
  rounded = 'full',
  ...props
}) => {
  // Get variant classes from theme config
  const variantClasses = badgeVariants[variant] || badgeVariants.primary;
  const combinedVariantClasses = combineVariantClasses(variantClasses);

  // Get size classes
  const sizeClasses = sizeVariants.badge[size] || sizeVariants.badge.md;

  // Rounded variants
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const roundedClass = roundedClasses[rounded] || roundedClasses.full;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium ring-1 ring-inset transition-colors duration-200 ${combinedVariantClasses} ${sizeClasses} ${roundedClass} ${className}`.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {/* Dot indicator */}
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      )}

      {/* Icon */}
      {icon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      
      {/* Content */}
      <span className="truncate">{children}</span>
      
      {/* Remove button */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex-shrink-0 ml-0.5 inline-flex items-center justify-center rounded-full hover:bg-current/10 focus:outline-none focus:ring-2 focus:ring-current/20 transition-colors"
          aria-label="Remove"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

export const BadgeGroup = ({ children, className = '', maxDisplay = null }) => {
  const badges = React.Children.toArray(children);
  const displayedBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const hiddenCount = maxDisplay && badges.length > maxDisplay ? badges.length - maxDisplay : 0;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {displayedBadges}
      {hiddenCount > 0 && (
        <Badge variant="muted" size="sm">
          +{hiddenCount} more
        </Badge>
      )}
    </div>
  );
};

export const StatusBadge = ({ status, size = 'md', dot = true, className = '', ...props }) => {
  const variant = getStatusBadgeVariant(status);

  return (
    <Badge
      variant={variant}
      size={size}
      dot={dot}
      className={className}
      {...props}
    >
      {status}
    </Badge>
  );
};

export const CountBadge = ({
  count,
  max = 99,
  variant = 'danger',
  size = 'sm',
  showZero = false,
  className = '',
  ...props
}) => {
  if (count === 0 && !showZero) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge
      variant={variant}
      size={size}
      className={`min-w-[1.25rem] justify-center ${className}`}
      {...props}
    >
      {displayCount}
    </Badge>
  );
};

export const NotificationBadge = ({
  count,
  max = 9,
  variant = 'danger',
  showZero = false,
  className = '',
  ...props
}) => {
  if (count === 0 && !showZero) return null;

  const displayCount = count > max ? `${max}+` : count;

  // Extract just the background color class from the variant config for the notification bubble
  const bgClass = badgeVariants[variant]?.light.split(' ')[0] || 'bg-red-500';

  return (
    <span
      className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-bold text-white ${bgClass} rounded-full ring-2 ring-white dark:ring-gray-900 ${className}`.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {displayCount}
    </span>
  );
};

export const IconBadge = ({
  icon,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  return (
    <Badge
      variant={variant}
      size={size}
      className={`p-1.5 ${className}`}
      {...props}
    >
      {icon}
    </Badge>
  );
};

export default Badge;