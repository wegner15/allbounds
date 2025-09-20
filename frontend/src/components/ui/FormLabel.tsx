import React from 'react';

interface FormLabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

const FormLabel: React.FC<FormLabelProps> = ({ 
  htmlFor, 
  children, 
  required = false,
  className = ''
}) => {
  return (
    <label 
      htmlFor={htmlFor} 
      className={`block text-sm font-medium text-gray-800 mb-1.5 ${className}`}
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
};

export default FormLabel;
