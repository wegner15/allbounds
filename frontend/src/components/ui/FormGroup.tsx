import React from 'react';

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const FormGroup: React.FC<FormGroupProps> = ({ 
  children, 
  className = '',
  fullWidth = false
}) => {
  return (
    <div className={`mb-6 ${fullWidth ? 'w-full' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default FormGroup;
