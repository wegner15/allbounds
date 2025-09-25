import React, { useState } from 'react';
import Button from '../ui/Button';

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'select';
  options?: FilterOption[];
  minValue?: number;
  maxValue?: number;
  step?: number;
}

export interface FiltersValue {
  [key: string]: string | string[] | number | number[] | boolean;
}

export interface FiltersPanelProps {
  filterGroups: FilterGroup[];
  initialValues?: FiltersValue;
  onApplyFilters: (filters: FiltersValue) => void;
  onResetFilters: () => void;
  className?: string;
  isMobile?: boolean;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  filterGroups,
  initialValues = {},
  onApplyFilters,
  onResetFilters,
  className = '',
  isMobile = false,
}) => {
  const [filters, setFilters] = useState<FiltersValue>(initialValues);
  const [isOpen, setIsOpen] = useState(!isMobile);

  const handleCheckboxChange = (groupId: string, optionId: string) => {
    setFilters((prevFilters) => {
      const currentValues = (prevFilters[groupId] as string[]) || [];
      
      if (currentValues.includes(optionId)) {
        return {
          ...prevFilters,
          [groupId]: currentValues.filter((id) => id !== optionId),
        };
      } else {
        return {
          ...prevFilters,
          [groupId]: [...currentValues, optionId],
        };
      }
    });
  };

  const handleRadioChange = (groupId: string, optionId: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [groupId]: optionId,
    }));
  };

  const handleRangeChange = (groupId: string, value: number) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [groupId]: value,
    }));
  };

  const handleSelectChange = (groupId: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [groupId]: value,
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleReset = () => {
    setFilters({});
    onResetFilters();
  };

  const toggleFilters = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      {isMobile && (
        <button
          className="w-full flex items-center justify-between p-2 mb-4 border-b border-gray-200"
          onClick={toggleFilters}
        >
          <span className="font-medium">Filters</span>
          <svg
            className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="space-y-6">
          {filterGroups.map((group) => (
            <div key={group.id} className="pb-4 border-b border-gray-200 last:border-0">
              <h3 className="font-medium mb-3">{group.label}</h3>

              {group.type === 'checkbox' && group.options && (
                <div className="space-y-2">
                  {group.options.map((option) => {
                    const isChecked = ((filters[group.id] as string[]) || []).includes(option.id);
                    
                    return (
                      <label key={option.id} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-teal focus:ring-teal h-4 w-4"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(group.id, option.id)}
                        />
                        <span className="ml-2 text-sm">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {group.type === 'radio' && group.options && (
                <div className="space-y-2">
                  {group.options.map((option) => {
                    const isChecked = filters[group.id] === option.id;
                    
                    return (
                      <label key={option.id} className="flex items-center">
                        <input
                          type="radio"
                          className="border-gray-300 text-teal focus:ring-teal h-4 w-4"
                          checked={isChecked}
                          onChange={() => handleRadioChange(group.id, option.id)}
                          name={group.id}
                        />
                        <span className="ml-2 text-sm">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {group.type === 'range' && (
                <div className="space-y-2">
                  <input
                    type="range"
                    min={group.minValue || 0}
                    max={group.maxValue || 100}
                    step={group.step || 1}
                    value={(filters[group.id] as number) || group.minValue || 0}
                    onChange={(e) => handleRangeChange(group.id, parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{group.minValue || 0}</span>
                    <span>{filters[group.id] || group.minValue || 0}</span>
                    <span>{group.maxValue || 100}</span>
                  </div>
                </div>
              )}

              {group.type === 'select' && group.options && (
                <select
                  className="w-full p-2 border rounded"
                  value={(filters[group.id] as string) || ''}
                  onChange={(e) => handleSelectChange(group.id, e.target.value)}
                >
                  {group.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <div className="flex space-x-2 pt-2">
            <Button variant="primary" onClick={handleApply} fullWidth>
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleReset} fullWidth>
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltersPanel;
