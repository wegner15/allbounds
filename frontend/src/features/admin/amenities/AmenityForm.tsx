import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../../components/ui/Button';
import type { AmenityCreate } from '../../../lib/types/api';
import * as LucideIcons from 'lucide-react';

interface AmenityFormProps {
  initialData?: Partial<AmenityCreate>;
  onSubmit: (data: AmenityCreate) => void;
  isSubmitting?: boolean;
}

const AMENITY_CATEGORIES = [
  'General',
  'Room',
  'Bathroom',
  'Recreation',
  'Dining',
  'Services',
  'Business',
];

const COMMON_AMENITY_ICONS = [
  { name: 'Wifi', label: 'WiFi' },
  { name: 'Waves', label: 'Pool' },
  { name: 'Dumbbell', label: 'Gym' },
  { name: 'Utensils', label: 'Restaurant' },
  { name: 'Wine', label: 'Bar' },
  { name: 'ConciergeBell', label: 'Room Service' },
  { name: 'Sparkles', label: 'Spa' },
  { name: 'Car', label: 'Parking' },
  { name: 'Plane', label: 'Airport Shuttle' },
  { name: 'Snowflake', label: 'Air Conditioning' },
  { name: 'PawPrint', label: 'Pet Friendly' },
  { name: 'Briefcase', label: 'Business Center' },
  { name: 'Shirt', label: 'Laundry' },
  { name: 'Bell', label: 'Concierge' },
  { name: 'Lock', label: 'Safe' },
  { name: 'GlassWater', label: 'Mini Bar' },
  { name: 'Home', label: 'Balcony' },
  { name: 'Mountain', label: 'View' },
  { name: 'ChefHat', label: 'Kitchen' },
  { name: 'BanIcon', label: 'Non-Smoking' },
  { name: 'Tv', label: 'TV' },
  { name: 'Coffee', label: 'Coffee Maker' },
  { name: 'Bath', label: 'Bathtub' },
  { name: 'Shower', label: 'Shower' },
  { name: 'Wind', label: 'Hair Dryer' },
  { name: 'Armchair', label: 'Seating Area' },
  { name: 'Bed', label: 'Bed' },
  { name: 'Sun', label: 'Terrace' },
  { name: 'Trees', label: 'Garden' },
  { name: 'Bike', label: 'Bike Rental' },
];

const AmenityForm: React.FC<AmenityFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string>(initialData?.icon || '');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement>(null);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AmenityCreate>({
    defaultValues: initialData || {},
  });

  // Close icon picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(event.target as Node)) {
        setShowIconPicker(false);
      }
    };

    if (showIconPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIconPicker]);

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    setValue('icon', iconName);
    setShowIconPicker(false);
  };

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon size={20} /> : null;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Amenity Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Name is required' })}
          placeholder="e.g., Swimming Pool, WiFi, Spa"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all duration-200 text-sm"
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          placeholder="Brief description of this amenity..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all duration-200 text-sm resize-none"
        />
        <p className="mt-2 text-xs text-gray-500">
          Optional: Provide additional details about this amenity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="relative">
            <select
              id="category"
              {...register('category')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all duration-200 text-sm appearance-none bg-white cursor-pointer"
            >
              <option value="">Select a category</option>
              {AMENITY_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Group similar amenities together
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Icon
          </label>
          <div className="relative" ref={iconPickerRef}>
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all duration-200 text-sm bg-white text-left flex items-center justify-between hover:border-gray-400"
            >
              <span className="flex items-center gap-2">
                {selectedIcon ? (
                  <>
                    {getIconComponent(selectedIcon)}
                    <span className="text-gray-700">{selectedIcon}</span>
                  </>
                ) : (
                  <span className="text-gray-400">Select an icon</span>
                )}
              </span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showIconPicker && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <p className="text-xs font-medium text-gray-700">Select an icon</p>
                </div>
                <div className="grid grid-cols-3 gap-2 p-3">
                  {COMMON_AMENITY_ICONS.map((icon) => (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => handleIconSelect(icon.name)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-teal-50 transition-colors ${
                        selectedIcon === icon.name ? 'bg-teal-100 border-2 border-teal-500' : 'border border-gray-200'
                      }`}
                    >
                      <div className={selectedIcon === icon.name ? 'text-teal-600' : 'text-gray-600'}>
                        {getIconComponent(icon.name)}
                      </div>
                      <span className="text-xs text-gray-600 text-center">{icon.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input type="hidden" {...register('icon')} value={selectedIcon} />
          <p className="mt-2 text-xs text-gray-500">
            Choose an icon to represent this amenity
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Amenity'
          )}
        </Button>
      </div>
    </form>
  );
};

export default AmenityForm;
