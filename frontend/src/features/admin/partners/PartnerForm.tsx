import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import ImageSelector from '../../../components/ui/ImageSelector';

// Predefined categories for dropdown
export const PARTNER_CATEGORIES = [
  { value: 'hotel', label: 'Hotel Partner' },
  { value: 'airline', label: 'Airline Partner' },
  { value: 'affiliation', label: 'Industry Affiliation' }
];

// Validation schema
const partnerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  category: z.string().min(1, 'Please select a category'),
  logo_image_id: z.string().optional().nullable(),
  website_url: z.string()
    .transform(val => {
      if (!val) return '';
      // Automatically prepend https:// if missing
      if (!/^https?:\/\//i.test(val)) {
        return `https://${val}`;
      }
      return val;
    })
    .optional()
    .nullable(),
  order_index: z.coerce.number().default(0),
  is_active: z.boolean().default(true),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

interface PartnerFormProps {
  initialData?: any;
  onSubmit: (data: PartnerFormData) => Promise<void>;
  isSubmitting: boolean;
  isEdit?: boolean;
}

const PartnerForm: React.FC<PartnerFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  isEdit = false,
}) => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          category: initialData.category,
          logo_image_id: initialData.logo_image_id || '',
          website_url: initialData.website_url || '',
          order_index: initialData.order_index || 0,
          is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        }
      : {
          name: '',
          category: '',
          logo_image_id: '',
          website_url: '',
          order_index: 0,
          is_active: true,
        },
  });

  const handleFormSubmit = async (formData: PartnerFormData) => {
    setServerError(null);
    try {
      await onSubmit(formData);
    } catch (error: any) {
      console.error('Error in partner form submit:', error);
      setServerError(error.message || 'An error occurred while saving. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {serverError}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            {isEdit ? 'Edit Partner Details' : 'Create New Partner'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Update the details for this partner record' : 'Fill in the details to add a new partner'}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-800">
              Partner Name
            </label>
            <div className="mt-2">
              <input
                type="text"
                id="name"
                placeholder="e.g. Qatar Airways"
                className={`block w-full px-4 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200 
                  ${errors.name
                    ? 'ring-red-300 text-red-900 placeholder-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'ring-gray-300 bg-white focus:ring-2 focus:ring-teal'}
                `}
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-800">
              Category
            </label>
            <div className="mt-2">
              <select
                id="category"
                className={`block w-full px-4 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200 
                  ${errors.category
                    ? 'ring-red-300 text-red-900 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'ring-gray-300 bg-white focus:ring-2 focus:ring-teal'}
                `}
                {...register('category')}
              >
                <option value="">-- Select Category --</option>
                {PARTNER_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.category.message}</p>
            )}
          </div>

          {/* Website URL */}
          <div>
            <label htmlFor="website_url" className="block text-sm font-semibold text-gray-800">
              Website URL (Optional)
            </label>
            <div className="mt-2">
              <input
                type="text"
                id="website_url"
                placeholder="e.g. www.qatarairways.com"
                className={`block w-full px-4 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200 
                  ${errors.website_url
                    ? 'ring-red-300 text-red-900 placeholder-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'ring-gray-300 bg-white focus:ring-2 focus:ring-teal'}
                `}
                {...register('website_url')}
              />
            </div>
            {errors.website_url && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.website_url.message}</p>
            )}
          </div>

          {/* Order Index */}
          <div>
            <label htmlFor="order_index" className="block text-sm font-semibold text-gray-800">
              Display Order Index
            </label>
            <div className="mt-2">
              <input
                type="number"
                id="order_index"
                placeholder="0"
                className={`block w-full px-4 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200 
                  ${errors.order_index
                    ? 'ring-red-300 text-red-900 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'ring-gray-300 bg-white focus:ring-2 focus:ring-teal'}
                `}
                {...register('order_index')}
              />
            </div>
            {errors.order_index && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.order_index.message}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">Lower values will be displayed first in grids.</p>
          </div>

          {/* Logo Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Partner Logo
            </label>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <ImageSelector
                initialImageId={watch('logo_image_id') || undefined}
                onImageSelected={(imageId) => setValue('logo_image_id', imageId)}
                label="Choose Logo Image"
                helperText="Upload or choose a logo. SVGs or transparent PNGs are recommended."
              />
            </div>
          </div>

          {/* Is Active */}
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="is_active"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-teal focus:ring-teal"
                {...register('is_active')}
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="is_active" className="font-semibold text-gray-800">
                Visible on site
              </label>
              <p className="text-gray-500">If unchecked, this partner will be hidden from the front-end display.</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/partners')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-teal border border-transparent rounded-lg shadow-sm hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Partner'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PartnerForm;
