import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  className = '' 
}) => {
  const baseStyles = "inline-flex justify-center items-center font-medium active:scale-[0.98] rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-100 shadow-sm",
    secondary: "bg-primary-50 text-primary-600 hover:bg-primary-100 focus:ring-primary-100",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-100 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-100 shadow-sm",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${widthStyle} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;