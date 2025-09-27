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
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({ value, onChange }) => {

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

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: 'transparent',
      border: 'none',
      boxShadow: 'none',
      minHeight: 'auto',
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'white',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'white',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#D1D5DB', // gray-300
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '0.5rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    }),
    option: (provided: any, state: { isFocused: boolean }) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
      color: 'white',
      '&:active': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
      },
    }),
  };

  return (
    <div className="flex items-center border-b border-white/30 py-1">
      <MapPin className="w-4 h-4 mr-2 text-gray-200" />
      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions
        value={value}
        onChange={onChange}
        placeholder="Where are you going?"
        styles={customStyles}
        className="w-full"
        classNamePrefix="react-select"
        components={{ DropdownIndicator: null, IndicatorSeparator: null }}
      />
    </div>
  );
};

export default LocationSearchInput;
