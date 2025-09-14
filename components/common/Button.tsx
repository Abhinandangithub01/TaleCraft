
import React from 'react';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled = false, children, className = '' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center px-6 py-3 border border-transparent 
        text-base font-medium rounded-md shadow-sm text-white bg-brand-primary 
        hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 
        focus:ring-brand-primary transition-all duration-200 ease-in-out transform hover:scale-105
        disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
   