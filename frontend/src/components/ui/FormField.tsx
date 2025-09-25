import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'checkbox' | 'select';
  placeholder?: string;
  value: string | number | boolean | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  error?: string;
  className?: string;
  required?: boolean;
  options?: { value: string | number; label: string }[];
  rows?: number;
  helperText?: string;
}

/**
 * A reusable form field component that supports different input types
 */
const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  className = '',
  required = false,
  options = [],
  rows = 4,
  helperText,
}) => {
  const renderField = () => {
    const baseInputClasses = `shadow-sm focus:ring-teal focus:border-teal block w-full sm:text-sm border-gray-300 rounded-md ${
      error ? 'border-red-300' : ''
    }`;

    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            name={id}
            rows={rows}
            className={baseInputClasses}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        );
      case 'select':
        return (
          <select
            id={id}
            name={id}
            className={baseInputClasses}
            value={value}
            onChange={onChange}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={id}
              name={id}
              type="checkbox"
              className="h-4 w-4 text-teal focus:ring-teal border-gray-300 rounded"
              checked={value}
              onChange={onChange}
            />
            <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
              {label}
            </label>
          </div>
        );
      default:
        return (
          <input
            type={type}
            id={id}
            name={id}
            className={baseInputClasses}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        );
    }
  };

  return (
    <div className={`${className}`}>
      {type !== 'checkbox' && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="mt-1">
        {renderField()}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default FormField;
