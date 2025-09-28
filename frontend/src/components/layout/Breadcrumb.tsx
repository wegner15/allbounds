import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  variant?: 'light' | 'dark';
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = '',
  variant = 'light',
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  const linkClasses = variant === 'dark'
    ? 'text-white/90 hover:text-white transition-colors font-medium'
    : 'text-charcoal hover:text-hover transition-colors font-medium';

  const separatorClasses = variant === 'dark'
    ? 'text-white/70'
    : 'text-gray-400';

  const currentPageClasses = variant === 'dark'
    ? 'text-white font-semibold'
    : 'text-gray-700 font-semibold';

  return (
    <nav aria-label="Breadcrumb" className={`${className}`}>
      <ol className="flex flex-wrap items-center space-x-1 text-sm">
        <li>
          <Link to="/" className={`${linkClasses} hover:underline`}>
            Home
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              <svg className={`h-3 w-3 ${separatorClasses} mx-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>

              {isLast || !item.path ? (
                <span className={`${currentPageClasses} font-medium`} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className={`${linkClasses} hover:underline`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
