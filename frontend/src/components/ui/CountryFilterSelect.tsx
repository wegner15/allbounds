import React from 'react';
import { useCountries } from '../../lib/hooks/useCountries';

interface CountryFilterSelectProps {
  value: number | undefined;
  onChange: (countryId: number | undefined) => void;
  className?: string;
}

/**
 * A reusable country filter dropdown backed by the /countries/ API.
 * Renders "All Countries" as the default no-filter option.
 */
const CountryFilterSelect: React.FC<CountryFilterSelectProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const { data: countries, isLoading } = useCountries();

  return (
    <div className={`relative ${className}`}>
      <select
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val ? Number(val) : undefined);
        }}
        disabled={isLoading}
        className="block w-full appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-teal focus:border-teal text-gray-700 hover:border-gray-400 disabled:opacity-60 transition-colors cursor-pointer shadow-sm"
      >
        <option value="">All Countries</option>
        {countries?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {/* Chevron */}
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </span>
    </div>
  );
};

export default CountryFilterSelect;
