import React from 'react';

const Input = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  error, 
  disabled = false 
}) => {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          px-4 py-2.5 rounded-lg border text-sm transition-all duration-200
          placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50' 
            : 'border-slate-300 focus:border-primary-600 focus:ring-4 focus:ring-primary-50 hover:border-slate-400'
          }
        `}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};

export default Input;