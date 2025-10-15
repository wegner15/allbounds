import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../../components/ui/Button';
import type { AmenityCreate } from '../../../lib/types/api';

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

const AmenityForm: React.FC<AmenityFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AmenityCreate>({
    defaultValues: initialData || {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          {...register('category')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        >
          <option value="">Select a category</option>
          {AMENITY_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="icon" className="block text-sm font-medium text-gray-700">
          Icon
        </label>
        <input
          type="text"
          id="icon"
          {...register('icon')}
          placeholder="e.g., wifi, pool, gym"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
        <p className="mt-1 text-sm text-gray-500">
          Icon identifier for frontend display (e.g., Lucide icon name)
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Amenity'}
        </Button>
      </div>
    </form>
  );
};

export default AmenityForm;
