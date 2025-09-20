import React, { forwardRef } from 'react';
import FormError from './FormError';

interface FormInputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: {
    message?: string;
    type?: string;
  };
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const FormInputWithIcon = forwardRef<HTMLInputElement, FormInputWithIconProps>(
  ({ 
    label, 
    error, 
    helperText, 
    className = '', 
    fullWidth = false,
    variant = 'default',
    icon,
    iconPosition = 'left',
    ...props 
  }, ref) => {
    const inputStyles = `
      block w-full px-4 py-3
      ${iconPosition === 'left' ? 'pl-10' : 'pr-10'}
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
            className="block text-sm font-medium text-gray-800 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={inputStyles}
            {...props}
          />
          
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
              {icon}
            </div>
          )}
        </div>
        
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
        
        {error && <FormError>{error.message}</FormError>}
      </div>
    );
  }
);

FormInputWithIcon.displayName = 'FormInputWithIcon';

export default FormInputWithIcon;
