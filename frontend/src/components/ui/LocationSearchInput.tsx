import React from 'react';
import AsyncSelect from 'react-select/async';
import { MapPin } from 'lucide-react';

interface LocationOption {
  label: string;
  value: string;
}

interface LocationSearchInputProps {
  value: LocationOption | null;
  onChange: (option: LocationOption | null) => void;
  variant?: 'dark' | 'light' | 'transparent';
  placeholder?: string;
  className?: string;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  value,
  onChange,
  variant = 'dark',
  placeholder = "Where are you going?",
  className = ""
}) => {

  const loadOptions = async (inputValue: string): Promise<LocationOption[]> => {
    if (inputValue.length < 2) return [];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${inputValue}&format=json&addressdetails=1&limit=5`
      );
      const data = await response.json();

      const options: LocationOption[] = data.map((item: any) => ({
        label: item.display_name,
        value: item.display_name,
      }));

      return options;
    } catch (error) {
      console.error('Error fetching location data:', error);
      return [];
    }
  };

  const isDark = variant === 'dark';
  const isTransparent = variant === 'transparent';

  const customStyles = {
    control: (provided: any, state: { isFocused: boolean }) => ({
      ...provided,
      backgroundColor: isDark ? 'transparent' : (isTransparent ? 'transparent' : 'white'),
      border: isDark || isTransparent ? 'none' : '2px solid rgba(140, 185, 191, 0.3)',
      borderRadius: isDark || isTransparent ? '0' : '0.5rem',
      boxShadow: 'none',
      cursor: 'pointer',
      minHeight: 'auto',
      '&:hover': {
        borderColor: isDark || isTransparent ? 'none' : '#8cb9bf',
      },
      padding: 0,
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: 0,
    }),
    input: (provided: any) => ({
      ...provided,
      color: isDark ? 'white' : '#3c4852',
      margin: 0,
      padding: 0,
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: isDark ? 'white' : '#3c4852',
      fontWeight: 500,
      margin: 0,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: isDark ? '#D1D5DB' : 'rgba(60, 72, 82, 0.6)',
      fontSize: '0.875rem',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'white',
      backdropFilter: isDark ? 'blur(10px)' : 'none',
      borderRadius: '0.5rem',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(229, 231, 235, 1)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      zIndex: 9998,
      marginTop: '12px',
    }),
    menuPortal: (provided: any) => ({
      ...provided,
      zIndex: 9998,
    }),
    option: (provided: any, state: { isFocused: boolean }) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? (isDark ? 'rgba(255, 255, 255, 0.2)' : '#f3f4f6')
        : 'transparent',
      color: isDark ? 'white' : '#3c4852',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : '#e5e7eb',
      },
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: () => ({ display: 'none' }),
  };

  return (
    <div className={`flex items-center ${isDark ? 'border-b border-white/30 py-1' : ''} ${className}`}>
      {isDark && <MapPin className="w-4 h-4 mr-2 text-gray-200" />}
      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        styles={customStyles}
        className="w-full"
        classNamePrefix="react-select"
        components={{ DropdownIndicator: null, IndicatorSeparator: null }}
        menuPortalTarget={document.body}
        menuPosition="fixed"
      />
    </div>
  );
};

export default LocationSearchInput;
