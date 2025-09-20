import React from 'react';
import { Link } from 'react-router-dom';

export interface CardProps {
  title: string;
  image?: string;
  description?: string;
  link?: string;
  badge?: string;
  badgeVariant?: 'default' | 'primary' | 'secondary';
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  image,
  description,
  link,
  badge,
  badgeVariant = 'secondary',
  className = '',
  onClick,
}) => {
  const badgeStyles = {
    default: 'bg-paper text-charcoal',
    primary: 'bg-charcoal text-white',
    secondary: 'bg-butter text-charcoal',
  };

  const cardContent = (
    <>
      <div className="relative">
        {image && (
          <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
            <img 
              src={image} 
              alt={title} 
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        {badge && (
          <div className={`absolute top-2 right-2 rounded-full px-2 py-1 text-xs font-medium ${badgeStyles[badgeVariant]}`}>
            {badge}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-playfair text-lg font-medium text-charcoal">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        )}
      </div>
    </>
  );

  const baseCardClasses = `
    group overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg
    ${className}
  `;

  if (link) {
    return (
      <Link to={link} className={baseCardClasses}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div 
      className={`${baseCardClasses} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {cardContent}
    </div>
  );
};

export default Card;
