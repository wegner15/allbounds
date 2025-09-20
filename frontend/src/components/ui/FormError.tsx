import React from 'react';

interface FormErrorProps {
  children: React.ReactNode;
  className?: string;
}

const FormError: React.FC<FormErrorProps> = ({ 
  children, 
  className = ''
}) => {
  if (!children) return null;
  
  return (
    <p className={`mt-1.5 text-sm text-red-600 font-medium ${className}`}>
      {children}
    </p>
  );
};

export default FormError;
