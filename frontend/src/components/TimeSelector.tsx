import React, { useState, useRef, useEffect } from 'react';

interface TimeSelectorProps {
  value?: string;
  onChange: (time: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  name?: string;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  value = '',
  onChange,
  placeholder = 'Select time',
  label,
  id,
  name
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        setSelectedHour(displayHour);
        setSelectedMinute(minutes);
        setSelectedPeriod(period);
      }
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (hour: number, minute: number, period: 'AM' | 'PM'): string => {
    const hour24 = period === 'AM' 
      ? (hour === 12 ? 0 : hour)
      : (hour === 12 ? 12 : hour + 12);
    
    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const formatDisplayTime = (hour: number, minute: number, period: 'AM' | 'PM'): string => {
    return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const handleTimeChange = (hour: number, minute: number, period: 'AM' | 'PM') => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedPeriod(period);
    const time24 = formatTime(hour, minute, period);
    onChange(time24);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const displayValue = value 
    ? formatDisplayTime(selectedHour, selectedMinute, selectedPeriod)
    : '';

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        id={id}
        name={name}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 text-left border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center justify-between">
          <span className={displayValue ? 'text-gray-900' : 'text-gray-500'}>
            {displayValue || placeholder}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ zIndex: 1000 }}>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Hours */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Hour</label>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => handleTimeChange(hour, selectedMinute, selectedPeriod)}
                      className={`w-full px-3 py-2 text-sm hover:bg-gray-50 ${
                        hour === selectedHour
                          ? 'bg-teal-50 text-teal-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Minute</label>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => handleTimeChange(selectedHour, minute, selectedPeriod)}
                      className={`w-full px-3 py-2 text-sm hover:bg-gray-50 ${
                        minute === selectedMinute
                          ? 'bg-teal-50 text-teal-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {minute.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Period</label>
                <div className="space-y-1">
                  {['AM', 'PM'].map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => handleTimeChange(selectedHour, selectedMinute, period as 'AM' | 'PM')}
                      className={`w-full px-3 py-2 text-sm rounded hover:bg-gray-50 ${
                        period === selectedPeriod
                          ? 'bg-teal-50 text-teal-700 font-medium border border-teal-200'
                          : 'text-gray-700 border border-gray-200'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Selected: {formatDisplayTime(selectedHour, selectedMinute, selectedPeriod)}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors duration-200"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSelector;
