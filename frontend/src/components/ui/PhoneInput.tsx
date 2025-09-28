import React, { useState, useEffect } from 'react';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼' },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251', flag: '🇪🇹' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisia', dialCode: '+216', flag: '🇹🇳' },
];

interface PhoneInputProps {
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

const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value = '',
  onChange,
  error,
  placeholder = 'Enter phone number',
  required = false,
  className = '',
}) => {
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Parse value to get country and phone number
  const parseValue = (val: string) => {
    if (val) {
      const country = countries.find(c => val.startsWith(c.dialCode));
      if (country) {
        return {
          selectedCountry: country,
          phoneNumber: val.replace(country.dialCode, '').trim(),
        };
      } else {
        return {
          selectedCountry: countries[0],
          phoneNumber: val,
        };
      }
    } else {
      return {
        selectedCountry: countries[0],
        phoneNumber: '',
      };
    }
  };

  const { selectedCountry, phoneNumber } = parseValue(value);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm)
  );

  const handleCountrySelect = (country: Country) => {
    const newValue = country.dialCode + phoneNumber;
    if (onChange) {
      onChange(newValue);
    }
    setShowCountryDropdown(false);
    setSearchTerm('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ''); // Only allow digits
    const newValue = selectedCountry.dialCode + input;
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="flex">
        {/* Country Code Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className="flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 rounded-l-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <span className="text-lg mr-2">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-gray-700">{selectedCountry.dialCode}</span>
            <svg className="ml-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Country Dropdown */}
          {showCountryDropdown && (
            <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              <div className="py-1">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="w-full flex items-center px-3 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  >
                    <span className="text-lg mr-3">{country.flag}</span>
                    <span className="text-sm text-gray-900 flex-1 text-left">{country.name}</span>
                    <span className="text-sm text-gray-500">{country.dialCode}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          className={`flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
          }`}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

export default PhoneInput;