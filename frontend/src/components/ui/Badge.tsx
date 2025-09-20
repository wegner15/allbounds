import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-lato font-medium';
  
  const variantStyles = {
    default: 'bg-paper text-charcoal',
    primary: 'bg-charcoal text-white',
    secondary: 'bg-butter text-charcoal',
    success: 'bg-mint text-charcoal',
    warning: 'bg-sand text-charcoal',
    error: 'bg-hover text-white',
  };
  
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };
  
  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
