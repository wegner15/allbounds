import React, { useState, useRef, useEffect } from 'react';

interface Country {
  code: string;
  name: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
];

interface CountrySelectProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: {
    message?: string;
    type?: string;
  };
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  label,
  value = '',
  onChange,
  error,
  placeholder = 'Select your country',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find selected country when value changes
  useEffect(() => {
    if (value) {
      const country = countries.find(c => c.name === value || c.code === value);
      setSelectedCountry(country || null);
    } else {
      setSelectedCountry(null);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchTerm('');
    if (onChange) {
      onChange(country.name);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);

    // If user types a country name exactly, select it
    const exactMatch = countries.find(c =>
      c.name.toLowerCase() === inputValue.toLowerCase()
    );
    if (exactMatch) {
      setSelectedCountry(exactMatch);
      if (onChange) {
        onChange(exactMatch.name);
      }
    } else if (!inputValue) {
      setSelectedCountry(null);
      if (onChange) {
        onChange('');
      }
    }

    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const displayValue = selectedCountry ? selectedCountry.name : searchTerm;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
          }`}
        />

        {/* Selected country flag */}
        {selectedCountry && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <span className="text-lg">{selectedCountry.flag}</span>
          </div>
        )}

        {/* Dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredCountries.length > 0 ? (
            <div className="py-1">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className="w-full flex items-center px-3 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 text-left"
                >
                  <span className="text-lg mr-3">{country.flag}</span>
                  <span className="text-sm text-gray-900">{country.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              No countries found
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default CountrySelect;