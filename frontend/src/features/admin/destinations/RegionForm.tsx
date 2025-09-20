import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormField from '../../../components/ui/FormField';
import ImageSelector from '../../../components/ui/ImageSelector';

// Form validation schema for regions
const regionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image_id: z.string().optional().default(''),
  is_active: z.boolean().default(true),
});

export type RegionFormData = z.infer<typeof regionSchema>;

interface RegionFormProps {
  initialData?: Partial<RegionFormData>;
  isEdit?: boolean;
  onSubmit: (data: RegionFormData) => Promise<void>;
  isSubmitting?: boolean;
  serverError?: string | null;
}

const RegionForm: React.FC<RegionFormProps> = ({
  initialData,
  isEdit = false,
  onSubmit,
  isSubmitting = false,
  serverError = null,
}) => {
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm<RegionFormData>({
    resolver: zodResolver(regionSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      image_id: initialData?.image_id || '',
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    }
  });

  // Auto-generate slug from name
  const name = watch('name');
  useEffect(() => {
    if (!isEdit && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      setValue('slug', generatedSlug);
    }
  }, [name, setValue, isEdit]);

  // Register all form fields
  const nameProps = register('name');
  const slugProps = register('slug');
  const descriptionProps = register('description');
  const isActiveProps = register('is_active');

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {serverError}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Name Field */}
          <div className="sm:col-span-4">
            <FormField
              id="name"
              label="Region Name"
              value={watch('name')}
              onChange={nameProps.onChange}
              error={errors.name?.message}
              required
            />
          </div>
          
          {/* Slug Field */}
          <div className="sm:col-span-4">
            <FormField
              id="slug"
              label="Slug"
              value={watch('slug')}
              onChange={slugProps.onChange}
              error={errors.slug?.message}
              required
              helperText="Used in the URL: https://example.com/regions/your-slug"
            />
          </div>
          
          {/* Description Field */}
          <div className="sm:col-span-6">
            <FormField
              id="description"
              label="Description"
              type="textarea"
              value={watch('description')}
              onChange={descriptionProps.onChange}
              error={errors.description?.message}
              required
            />
          </div>
          
          {/* Image Upload */}
          <div className="sm:col-span-6">
            <ImageSelector
              initialImageId={watch('image_id')}
              onImageSelected={(imageId) => setValue('image_id', imageId)}
              label="Region Image"
              helperText="Upload an image for this region"
            />
          </div>
          
          {/* Status */}
          <div className="sm:col-span-6">
            <FormField
              id="is_active"
              label="Active (visible on the website)"
              type="checkbox"
              value={watch('is_active')}
              onChange={isActiveProps.onChange}
            />
          </div>
        </div>
      </div>
      
      {/* Form actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : isEdit ? 'Update Region' : 'Create Region'}
        </button>
      </div>
    </form>
  );
};

export default RegionForm;
