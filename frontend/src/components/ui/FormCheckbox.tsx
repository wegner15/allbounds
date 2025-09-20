import React, { forwardRef } from 'react';
import FormError from './FormError';

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: {
    message?: string;
    type?: string;
  };
  helperText?: string;
}

const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className={`flex items-start ${className}`}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={`
              h-5 w-5 rounded
              border-gray-300 text-teal 
              focus:ring-2 focus:ring-teal focus:ring-offset-2
              transition duration-150 ease-in-out
              ${error ? 'border-red-500' : ''}
            `}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={props.id} className="font-medium text-gray-700">
            {label}
          </label>
          {helperText && !error && (
            <p className="text-gray-500">{helperText}</p>
          )}
          {error && <FormError>{error.message}</FormError>}
        </div>
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';

export default FormCheckbox;
