import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';

interface FormProps {
  children: React.ReactNode;
  [key: string]: unknown;
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(({ children, ...props }, ref) => {
  return (
    <form ref={ref} {...props}>
      {children}
    </form>
  );
});

interface FormFieldProps {
  name: string;
  control?: unknown;
  render: ({ field }: { field: unknown }) => React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ name, control, render }) => {
  const formContext = useFormContext();
  const formControl = control || formContext?.control;

  if (!formControl) {
    return <>{render({ field: { onChange: () => {}, value: '', ref: null } })}</>;
  }

  return (
    <Controller
      name={name}
      control={formControl}
      render={({ field }) => {
        return render({ field }) as React.ReactElement;
      }}
    />
  );
};

interface FormItemProps {
  children: React.ReactNode;
  className?: string;
}

const FormItem: React.FC<FormItemProps> = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

interface FormLabelProps {
  children: React.ReactNode;
  className?: string;
}

const FormLabel: React.FC<FormLabelProps> = ({ children, className = '' }) => {
  return (
    <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>
      {children}
    </label>
  );
};

interface FormControlProps {
  children: React.ReactNode;
  className?: string;
}

const FormControl: React.FC<FormControlProps> = ({ children, className = '' }) => {
  return (
    <div className={`mt-1 ${className}`}>
      {children}
    </div>
  );
};

interface FormMessageProps {
  children?: React.ReactNode;
  className?: string;
}

const FormMessage: React.FC<FormMessageProps> = ({ children, className = '' }) => {
  if (!children) return null;
  
  return (
    <p className={`mt-1 text-sm text-red-600 ${className}`}>
      {children}
    </p>
  );
};

export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage };
