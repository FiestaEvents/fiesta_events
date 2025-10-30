import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  // Variant styles - using consistent color scheme
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-200 border-transparent disabled:bg-primary-300',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-200 border-transparent disabled:bg-secondary-300',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-200 border-transparent disabled:bg-success-300',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-200 border-transparent disabled:bg-danger-300',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-200 border-transparent disabled:bg-warning-300',
    outline: 'bg-white text-secondary-700 hover:bg-secondary-50 focus:ring-secondary-200 border-secondary-300 disabled:bg-secondary-50 disabled:text-secondary-400',
    ghost: 'bg-transparent text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-200 border-transparent disabled:text-secondary-400',
    link: 'bg-transparent text-primary-600 hover:text-primary-700 hover:underline focus:ring-transparent border-transparent shadow-none disabled:text-primary-300',
  };

  // Size styles
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs rounded',
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-2.5 text-sm rounded-lg',
    lg: 'px-5 py-3 text-base rounded-lg',
    xl: 'px-6 py-3.5 text-base rounded-xl',
  };

  // Icon sizes
  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-5 w-5',
  };

  const baseStyles = 'inline-flex items-center justify-center font-medium border transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className={`${iconSizes[size]} animate-spin ${children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''}`} />
          {children && <span>{children}</span>}
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={`${iconSizes[size]} ${children ? 'mr-2' : ''}`} />
          )}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && (
            <Icon className={`${iconSizes[size]} ${children ? 'ml-2' : ''}`} />
          )}
        </>
      )}
    </button>
  );
};

export default Button;