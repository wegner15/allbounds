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
  partner_code: z.string().optional().nullable(),
  discount_percent: z.number().min(0, 'Discount must be 0 or more').max(100, 'Discount cannot exceed 100%'),
  commission_percent: z.number().min(0, 'Commission must be 0 or more').max(100, 'Commission cannot exceed 100%'),
  logo_image_id: z.string().optional().nullable(),
  website_url: z.string().optional().nullable(),
  order_index: z.number(),
  is_active: z.boolean(),
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
          partner_code: initialData.partner_code || '',
          discount_percent: initialData.discount_percent || 0,
          commission_percent: initialData.commission_percent || 0,
          logo_image_id: initialData.logo_image_id || '',
          website_url: initialData.website_url || '',
          order_index: initialData.order_index || 0,
          is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        }
      : {
          name: '',
          category: '',
          partner_code: '',
          discount_percent: 0,
          commission_percent: 0,
          logo_image_id: '',
          website_url: '',
          order_index: 0,
          is_active: true,
        },
  });

  const generateRandomCode = () => {
    const chars = '0123456789ABCDEF';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * 16)];
    }
    setValue('partner_code', code);
  };

  const handleFormSubmit = async (formData: PartnerFormData) => {
    setServerError(null);
    let formattedUrl = formData.website_url;
    if (formattedUrl && !/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    try {
      await onSubmit({ ...formData, website_url: formattedUrl });
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

          {/* Partner Code */}
          <div>
            <label htmlFor="partner_code" className="block text-sm font-semibold text-gray-800">
              Partner Referral Code (Promo Code)
            </label>
            <div className="mt-2 flex space-x-2">
              <input
                type="text"
                id="partner_code"
                placeholder="e.g. QATAR6 (Leave blank to auto-generate 6-digit hex code)"
                className={`block w-full px-4 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200 
                  ${errors.partner_code
                    ? 'ring-red-300 text-red-900 placeholder-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                    : 'ring-gray-300 bg-white focus:ring-2 focus:ring-teal'}
                `}
                {...register('partner_code')}
              />
              <button
                type="button"
                onClick={generateRandomCode}
                className="px-4 py-2 text-sm font-medium text-teal bg-teal/10 rounded-lg border border-teal/20 hover:bg-teal/20 focus:outline-none focus:ring-2 focus:ring-teal"
              >
                Generate
              </button>
            </div>
            {errors.partner_code && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.partner_code.message}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              This code can be shared via links (e.g. <code>?partner=CODE</code>) or entered during booking.
            </p>
          </div>

          {/* Discount & Commission percentages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="discount_percent" className="block text-sm font-semibold text-gray-800">
                Client Discount (%)
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  step="0.01"
                  id="discount_percent"
                  placeholder="0"
                  className={`block w-full px-4 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200 
                    ${errors.discount_percent
                      ? 'ring-red-300 text-red-900 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                      : 'ring-gray-300 bg-white focus:ring-2 focus:ring-teal'}
                  `}
                  {...register('discount_percent', { valueAsNumber: true })}
                />
              </div>
              {errors.discount_percent && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.discount_percent.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="commission_percent" className="block text-sm font-semibold text-gray-800">
                Partner Commission (%)
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  step="0.01"
                  id="commission_percent"
                  placeholder="0"
                  className={`block w-full px-4 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200 
                    ${errors.commission_percent
                      ? 'ring-red-300 text-red-900 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
                      : 'ring-gray-300 bg-white focus:ring-2 focus:ring-teal'}
                  `}
                  {...register('commission_percent', { valueAsNumber: true })}
                />
              </div>
              {errors.commission_percent && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.commission_percent.message}</p>
              )}
            </div>
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
                {...register('order_index', { valueAsNumber: true })}
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
