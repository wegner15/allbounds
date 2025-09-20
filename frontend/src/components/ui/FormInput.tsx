import React, { forwardRef } from 'react';
import FormError from './FormError';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: {
    message?: string;
    type?: string;
  };
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    className = '', 
    fullWidth = false,
    variant = 'default',
    ...props 
  }, ref) => {
    const inputStyles = `
      block px-4 py-3 w-full
      border border-gray-300 rounded-md shadow-sm
      focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal
      text-gray-900 placeholder-gray-400
      transition duration-150 ease-in-out
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
          <input
            ref={ref}
            className={inputStyles}
            {...props}
          />
        </div>
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
        {error && <FormError>{error.message}</FormError>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
