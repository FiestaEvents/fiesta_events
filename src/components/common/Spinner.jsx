import React from 'react';
import OrbitLoader from './LoadingSpinner';
const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center">
      <OrbitLoader className={`animate-spin text-primary-500 ${sizes[size]} ${className}`} />
    </div>
  );
};

export default Spinner;