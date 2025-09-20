import React from 'react';

interface SelectProps {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  value?: string;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ children, onValueChange, value, className = '' }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value);
    }
  };

  return (
    <select 
      className={`w-full p-2 border rounded ${className}`} 
      onChange={handleChange}
      value={value}
    >
      {children}
    </select>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
};

interface SelectValueProps {
  children?: React.ReactNode;
  placeholder?: string;
  className?: string;
}

const SelectValue: React.FC<SelectValueProps> = ({ children, placeholder, className = '' }) => {
  return (
    <span className={`block truncate ${className}`}>
      {children || placeholder}
    </span>
  );
};

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

const SelectContent: React.FC<SelectContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
};

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

const SelectItem: React.FC<SelectItemProps> = ({ children, value, className = '' }) => {
  return (
    <option value={value} className={`${className}`}>
      {children}
    </option>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
