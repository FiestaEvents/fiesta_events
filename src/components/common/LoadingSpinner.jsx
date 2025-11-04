const LoadingSpinner = ({ size = "medium" }) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-16 h-16",
  };
  return (
    <div
      className={`${sizeClasses[size]} border-4 border-orange-500 border-t-transparent rounded-full animate-spin`}
    ></div>
  );
};
export default LoadingSpinner;
