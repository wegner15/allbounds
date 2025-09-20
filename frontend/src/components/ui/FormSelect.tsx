import React, { forwardRef } from 'react';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: {
    message?: string;
    type?: string;
  };
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  children: React.ReactNode;
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ 
    label, 
    error, 
    helperText, 
    className = '', 
    fullWidth = false,
    variant = 'default',
    children,
    ...props 
  }, ref) => {
    const selectStyles = `
      block px-4 py-3 w-full
      border border-gray-300 rounded-md shadow-sm
      focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal
      text-gray-900 placeholder-gray-400
      transition duration-150 ease-in-out
      appearance-none
      ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
      ${variant === 'filled' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white'}
      ${variant === 'outlined' ? 'bg-transparent border-2' : ''}
    `;

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={selectStyles}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error.message}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

export default FormSelect;
