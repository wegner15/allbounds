import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateHolidayType, useUpdateHolidayType } from '../../../lib/hooks/useHolidayTypes';
import ImageSelector from '../../../components/ui/ImageSelector';
import { apiClient } from '../../../lib/api';

// Form validation schema
const holidayTypeSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .refine(val => /^[\w\s\-&]+$/i.test(val), {
      message: 'Name can only contain letters, numbers, spaces, hyphens, and ampersands'
    }),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug cannot exceed 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  image_id: z.string()
    .min(1, 'Please select an image for this holiday type'),
  is_active: z.boolean(),
});

type HolidayTypeFormData = z.infer<typeof holidayTypeSchema>;

interface HolidayTypeFormProps {
  holidayTypeData?: any; // The holiday type data to edit, if any
  isEdit?: boolean;
}

const HolidayTypeForm: React.FC<HolidayTypeFormProps> = ({ holidayTypeData, isEdit = false }) => {
  const navigate = useNavigate();
  
  const createHolidayTypeMutation = useCreateHolidayType();
  const updateHolidayTypeMutation = useUpdateHolidayType(holidayTypeData?.id);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Initialize form with default values or existing holiday type data
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HolidayTypeFormData>({
    resolver: zodResolver(holidayTypeSchema),
    defaultValues: isEdit && holidayTypeData
      ? {
          name: holidayTypeData.name,
          slug: holidayTypeData.slug,
          description: holidayTypeData.description,
          image_id: holidayTypeData.image_id || '',
          is_active: holidayTypeData.is_active,
        }
      : {
          name: '',
          slug: '',
          description: '',
          image_id: '',
          is_active: true,
        },
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
  
  const onSubmit = async (formData: HolidayTypeFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    
    try {
      console.log('Submitting holiday type with data:', formData);
      
      if (isEdit && holidayTypeData?.id) {
        // Update the holiday type
        await updateHolidayTypeMutation.mutateAsync(formData);
        
        // Make a separate API call to set the cover image
        if (formData.image_id) {
          try {
            console.log('Setting cover image:', formData.image_id);
            const coverImageResponse = await apiClient.post(`/api/v1/holiday-types/${holidayTypeData.id}/cover-image`, {
              image_id: formData.image_id
            });
            console.log('Cover image set successfully:', coverImageResponse);
          } catch (coverError) {
            console.error('Error setting cover image:', coverError);
          }
        }
      } else {
        // Create a new holiday type
        const newHolidayType = await createHolidayTypeMutation.mutateAsync(formData);
        
        // If we have a cover image and the holiday type was created successfully, set the cover image
        if (formData.image_id && newHolidayType?.id) {
          try {
            console.log('Setting cover image for new holiday type:', formData.image_id);
            const coverImageResponse = await apiClient.post(`/api/v1/holiday-types/${newHolidayType.id}/cover-image`, {
              image_id: formData.image_id
            });
            console.log('Cover image set successfully for new holiday type:', coverImageResponse);
          } catch (coverError) {
            console.error('Error setting cover image for new holiday type:', coverError);
          }
        }
      }
      
      navigate('/admin/holiday-types');
    } catch (error) {
      console.error('Error saving holiday type:', error);
      setServerError('An error occurred while saving the holiday type. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Type-safe form submission handler
  const handleFormSubmit = handleSubmit(onSubmit);
  
  return (
    <form 
      onSubmit={handleFormSubmit} 
      className="space-y-6"
    >
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {serverError}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            {isEdit ? 'Edit Holiday Type' : 'Create New Holiday Type'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Update the details for this holiday type' : 'Fill in the details to create a new holiday type'}
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Name */}
          <div className="sm:col-span-4">
            <div className="flex justify-between items-center">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800">
                Holiday Type Name
              </label>
              <span className="text-xs text-gray-500 font-medium">
                {watch('name')?.length || 0}/100 characters
              </span>
            </div>
            <div className="mt-2 relative">
              <input
                type="text"
                id="name"
                placeholder="e.g. Beach Holiday"
                className={`block w-full px-4 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200 
                  ${errors.name 
                    ? 'ring-red-300 text-red-900 placeholder-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500' 
                    : 'ring-gray-300 bg-white focus:ring-2 focus:ring-teal'}
                `}
                {...register('name')}
              />
              {errors.name && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.name ? (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.name.message}</p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">Enter a clear, descriptive name for this holiday type</p>
            )}
          </div>
          
          {/* Slug */}
          <div className="sm:col-span-4">
            <div className="flex justify-between items-center">
              <label htmlFor="slug" className="block text-sm font-semibold text-gray-800">
                URL Slug
              </label>
              <span className="text-xs text-gray-500 font-medium">
                {watch('slug')?.length || 0}/100 characters
              </span>
            </div>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 px-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm font-medium">/holiday-types/</span>
              </div>
              <input
                type="text"
                id="slug"
                placeholder="beach-holiday"
                className={`block w-full pl-32 pr-10 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200 
                  ${errors.slug 
                    ? 'ring-red-300 text-red-900 placeholder-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500' 
                    : 'ring-gray-300 bg-white focus:ring-2 focus:ring-teal'}
                `}
                {...register('slug')}
              />
              {errors.slug && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.slug ? (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.slug.message}</p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                Used in the URL: https://example.com/holiday-types/your-slug
              </p>
            )}
          </div>
          
          {/* Description */}
          <div className="sm:col-span-6">
            <div className="flex justify-between items-center">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-800">
                Description
              </label>
              <span className="text-xs text-gray-500 font-medium">
                {watch('description')?.length || 0}/2000 characters
              </span>
            </div>
            <div className="mt-2">
              <textarea
                id="description"
                rows={6}
                placeholder="Provide a detailed description of this holiday type..."
                className={`block w-full px-4 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200
                  ${errors.description 
                    ? 'ring-red-300 text-red-900 placeholder-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500' 
                    : 'ring-gray-300 bg-white focus:ring-2 focus:ring-teal'}
                `}
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.description.message}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Describe the holiday type in detail. Include key features, experiences, and what makes it unique.
              </p>
            </div>
          </div>
          
          {/* Image Upload */}
          <div className="sm:col-span-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-gray-800">
                Holiday Type Image
              </label>
              {watch('image_id') && (
                <span className="text-xs text-teal font-medium">
                  Image selected
                </span>
              )}
            </div>
            <div className={`mt-2 bg-white p-6 rounded-lg shadow-sm transition-all duration-200 ${errors.image_id ? 'ring-2 ring-red-300' : 'ring-1 ring-gray-200'}`}>
              <ImageSelector
                initialImageId={watch('image_id')}
                onImageSelected={(imageId) => {
                  console.log('Holiday type image selected:', imageId);
                  
                  // Update the form value
                  setValue('image_id', imageId);
                  
                  // If we're editing an existing holiday type, update the cover image immediately
                  if (isEdit && holidayTypeData?.id && imageId) {
                    console.log('Immediately updating cover image to:', imageId);
                    apiClient.post(`/api/v1/holiday-types/${holidayTypeData.id}/cover-image`, {
                      image_id: imageId
                    })
                    .then(response => {
                      console.log('Cover image updated successfully:', response);
                      
                      // Force refresh the form data
                      if (holidayTypeData) {
                        holidayTypeData.image_id = imageId;
                      }
                    })
                    .catch(error => {
                      console.error('Error updating cover image:', error);
                    });
                  } else if (!isEdit && imageId) {
                    // For new holiday types, just store the image ID to be used when creating the holiday type
                    console.log('Storing image ID for new holiday type:', imageId);
                  }
                }}
                label=""
                helperText=""
              />
              {errors.image_id ? (
                <p className="mt-4 text-sm text-red-600 font-medium">{errors.image_id.message}</p>
              ) : (
                <div className="mt-4 flex items-start space-x-2">
                  <svg className="h-5 w-5 text-gray-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-gray-500">
                    Choose a high-quality image that represents this holiday type. Recommended size: 1200x800 pixels.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Status */}
          <div className="sm:col-span-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-gray-800">
                Visibility Status
              </label>
            </div>
            <div className="mt-2 bg-white p-6 rounded-lg shadow-sm ring-1 ring-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-800">Publication Status</h3>
                  <p className="text-sm text-gray-500 mt-1">Control whether this holiday type is visible on the website</p>
                </div>
                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                  <span className={`mr-3 text-sm font-medium ${watch('is_active') ? 'text-green-600' : 'text-gray-500'}`}>
                    {watch('is_active') ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    className={`${watch('is_active') ? 'bg-teal' : 'bg-gray-300'} 
                      relative inline-flex flex-shrink-0 h-7 w-14 border-2 border-transparent rounded-full 
                      cursor-pointer transition-all ease-in-out duration-200 focus:outline-none focus:ring-2 
                      focus:ring-offset-2 focus:ring-teal shadow-sm`}
                    onClick={() => setValue('is_active', !watch('is_active'))}
                  >
                    <span className="sr-only">Toggle visibility</span>
                    <span
                      aria-hidden="true"
                      className={`${watch('is_active') ? 'translate-x-7' : 'translate-x-0'} 
                        pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow 
                        transform ring-0 transition ease-in-out duration-200 flex items-center justify-center`}
                    >
                      {watch('is_active') ? (
                        <svg className="h-3 w-3 text-teal" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form actions */}
      <div className="sticky bottom-0 bg-white shadow-md px-8 py-5 border-t border-gray-200 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            type="button"
            className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal transition-all duration-200"
            onClick={() => navigate('/admin/holiday-types')}
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Holiday Types
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {isSubmitting ? 'Saving changes...' : 'Ready to save'}
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal disabled:opacity-50 transition-all duration-200"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {isEdit ? 'Update Holiday Type' : 'Create Holiday Type'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default HolidayTypeForm;
