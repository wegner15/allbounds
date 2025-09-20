import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../lib/api';
import { useCountries } from '../../../lib/hooks/useDestinations';
import { useHolidayTypes } from '../../../lib/hooks/useHolidayTypes';
import { useCreatePackage, useUpdatePackage } from '../../../lib/hooks/usePackages';
import ImageSelector from '../../../components/ui/ImageSelector';
import TipTapEditor from '../../../components/ui/TipTapEditor';
import GalleryManager from '../../../components/admin/GalleryManager';
import { SimpleItineraryManager } from '../../../components/admin/SimpleItineraryManager';
import type { GalleryImage } from '../../../lib/types/api';

// Form validation schema
const packageSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  duration_days: z.number().min(1, 'Duration must be at least 1 day'),
  country_id: z.number().min(1, 'Please select a country'),
  holiday_type_ids: z.array(z.number()).min(1, 'Please select at least one holiday type'),
  image_id: z.string().optional(),
  is_active: z.boolean(),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PackageFormProps {
  packageData?: any; // The package data to edit, if any
  isEdit?: boolean;
}

const PackageForm: React.FC<PackageFormProps> = ({ packageData }) => {
  const navigate = useNavigate();
  const { id: packageId } = useParams();
  const isEdit = !!packageId;
  const { data: countries, isLoading: isLoadingCountries } = useCountries();
  const { data: holidayTypes, isLoading: isLoadingHolidayTypes } = useHolidayTypes();
  
  const createPackageMutation = useCreatePackage();
  const updatePackageMutation = useUpdatePackage(packageData?.id);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<number | null>(null);
  
  // Initialize form with default values or existing package data
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: isEdit && packageData
      ? {
          name: packageData.name,
          slug: packageData.slug,
          description: packageData.description,
          price: packageData.price,
          duration_days: packageData.duration_days,
          country_id: packageData.country_id,
          holiday_type_ids: packageData.holiday_types?.map((ht: any) => ht.id) || [],
          image_id: packageData.image_id || '',
          is_active: packageData.is_active,
        }
      : {
          name: '',
          slug: '',
          description: '',
          price: 0,
          duration_days: 1,
          country_id: 0,
          holiday_type_ids: [],
          image_id: '',
          is_active: true,
        },
  });
  
  // Initialize form values and gallery images from existing package data
  useEffect(() => {
    if (isEdit && packageData) {
      console.log('PackageForm: Initializing form with packageData:', packageData);
      console.log('PackageForm: Country ID:', packageData.country_id);
      console.log('PackageForm: Holiday types:', packageData.holiday_types);
      
      // Update form values when packageData is loaded
      setValue('name', packageData.name || '');
      setValue('slug', packageData.slug || '');
      setValue('description', packageData.description || '');
      setValue('price', packageData.price || 0);
      setValue('duration_days', packageData.duration_days || 1);
      setValue('country_id', packageData.country_id || 0);
      setValue('holiday_type_ids', packageData.holiday_types?.map((ht: any) => ht.id) || []);
      setValue('image_id', packageData.image_id || '');
      setValue('is_active', packageData.is_active ?? true);
      
      console.log('PackageForm: Set country_id to:', packageData.country_id);
      console.log('PackageForm: Set holiday_type_ids to:', packageData.holiday_types?.map((ht: any) => ht.id) || []);
      
      // Initialize gallery images
      if (packageData.gallery_images) {
        setGalleryImages(packageData.gallery_images);
      }
      
      // Initialize cover image
      if (packageData.cover_image) {
        const imageId = typeof packageData.cover_image === 'string' 
          ? null // We'll need to handle URL to ID conversion if needed
          : packageData.cover_image;
        setCoverImageId(imageId);
      }
    }
  }, [isEdit, packageData, setValue]);

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
  
  const onSubmit = async (formData: PackageFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    
    try {
      // Prepare the data for submission
      const packageData = {
        ...formData,
        // Use coverImageId if available, otherwise use the form's image_id
        // Convert to string as the API expects
        image_id: coverImageId ? coverImageId.toString() : formData.image_id || undefined
      };
      
      console.log('Submitting package with data:', packageData);
      
      if (isEdit) {
        await updatePackageMutation.mutateAsync(packageData);
        
        // If we have a cover image, also update it via the cover image endpoint
        if (coverImageId) {
          try {
            console.log('Setting cover image:', coverImageId);
            // Make a separate API call to set the cover image
            const coverImageResponse = await apiClient.post(`/api/v1/packages/${packageId}/cover-image`, {
              image_id: coverImageId.toString()
            });
            console.log('Cover image set successfully:', coverImageResponse);
          } catch (coverError) {
            console.error('Error setting cover image:', coverError);
          }
        }
      } else {
        const newPackage = await createPackageMutation.mutateAsync(packageData);
        
        // If we have a cover image and the package was created successfully, set the cover image
        if (coverImageId && newPackage?.id) {
          try {
            console.log('Setting cover image for new package:', coverImageId);
            await apiClient.post(`/api/v1/packages/${newPackage.id}/cover-image`, {
              image_id: coverImageId.toString()
            });
          } catch (coverError) {
            console.error('Error setting cover image for new package:', coverError);
          }
        }
      }
      
      navigate('/admin/packages');
    } catch (error) {
      console.error('Error saving package:', error);
      setServerError('An error occurred while saving the package. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingCountries || isLoadingHolidayTypes) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
        <p className="mt-2">Loading form data...</p>
      </div>
    );
  }
  
  // Type-safe form submission handler
  const handleFormSubmit = handleSubmit(onSubmit);
  
  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{serverError}</span>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            {isEdit ? 'Edit Package' : 'Create New Package'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Update the details for this package' : 'Fill in the details to create a new vacation package'}
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Package name */}
          <div className="sm:col-span-4">
            <div className="flex justify-between items-center">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-800">
                Package Name
              </label>
              <span className="text-xs text-gray-500 font-medium">
                {watch('name')?.length || 0}/100 characters
              </span>
            </div>
            <div className="mt-2 relative">
              <input
                type="text"
                id="name"
                placeholder="e.g. Safari Adventure"
                className={`block w-full px-4 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200 
                  ${errors.name 
                    ? 'ring-red-300 text-red-900 placeholder-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500' 
                    : 'ring-gray-300 bg-white focus:ring-2 focus:ring-teal'}
                `}
                {...register('name')}
              />
              {errors.name && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.name ? (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.name.message}</p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">Enter a clear, descriptive name for this package</p>
            )}
          </div>
          
          {/* Package slug */}
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
                <span className="text-gray-500 sm:text-sm font-medium">/packages/</span>
              </div>
              <input
                type="text"
                id="slug"
                placeholder="safari-adventure"
                className={`block w-full pl-24 pr-10 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200 
                  ${errors.slug 
                    ? 'ring-red-300 text-red-900 placeholder-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500' 
                    : 'ring-gray-300 bg-white focus:ring-2 focus:ring-teal'}
                `}
                {...register('slug')}
              />
              {errors.slug && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.slug ? (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.slug.message}</p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                Used in the URL: https://example.com/packages/your-slug
              </p>
            )}
          </div>
          
          {/* Description */}
          <div className="sm:col-span-6">
            <TipTapEditor
              name="description"
              control={control}
              label="Description"
              maxLength={5000}
              required={true}
              helperText="Describe the package in detail. Include key features, experiences, and what makes it unique."
              placeholder="Provide a detailed description of this package..."
              height={350}
              value=""
              onChange={() => {}}
            />
          </div>
          
          {/* Price */}
          <div className="sm:col-span-2">
            <div className="flex justify-between items-center">
              <label htmlFor="price" className="block text-sm font-semibold text-gray-800">
                Price (per person)
              </label>
            </div>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">$</span>
              </div>
              <input
                type="number"
                id="price"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`block w-full pl-8 pr-12 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200
                  ${errors.price 
                    ? 'ring-red-300 text-red-900 placeholder-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500' 
                    : 'ring-gray-300 bg-white focus:ring-2 focus:ring-teal'}
                `}
                {...register('price', { valueAsNumber: true })}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">USD</span>
              </div>
              {errors.price && (
                <div className="absolute inset-y-0 right-0 pr-10 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.price ? (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.price.message}</p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                Enter the price per person in USD
              </p>
            )}
          </div>
          
          {/* Duration */}
          <div className="sm:col-span-2">
            <div className="flex justify-between items-center">
              <label htmlFor="duration_days" className="block text-sm font-semibold text-gray-800">
                Duration (days)
              </label>
            </div>
            <div className="mt-2 relative">
              <input
                type="number"
                id="duration_days"
                min="1"
                placeholder="e.g. 7"
                className={`block w-full pl-4 pr-12 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200
                  ${errors.duration_days 
                    ? 'ring-red-300 text-red-900 placeholder-red-300 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500' 
                    : 'ring-gray-300 bg-white focus:ring-2 focus:ring-teal'}
                `}
                {...register('duration_days', { valueAsNumber: true })}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">days</span>
              </div>
              {errors.duration_days && (
                <div className="absolute inset-y-0 right-0 pr-12 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.duration_days ? (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.duration_days.message}</p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                Enter the total duration of the package in days
              </p>
            )}
          </div>
          
          {/* Country */}
          <div className="sm:col-span-3">
            <div className="flex justify-between items-center">
              <label htmlFor="country_id" className="block text-sm font-semibold text-gray-800">
                Country
              </label>
            </div>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <select
                id="country_id"
                className={`block w-full pl-11 pr-10 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset appearance-none bg-none transition-all duration-200
                  ${errors.country_id 
                    ? 'ring-red-300 text-red-900 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500' 
                    : 'ring-gray-300 bg-white focus:ring-2 focus:ring-teal'}
                `}
                {...register('country_id', { valueAsNumber: true })}
                value={watch('country_id') || 0}
                onChange={(e) => {
                  console.log('Country changed to:', e.target.value);
                  setValue('country_id', parseInt(e.target.value));
                }}
              >
                <option value={0}>Select a country</option>
                {countries?.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              {errors.country_id && (
                <div className="absolute inset-y-0 right-0 pr-10 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.country_id ? (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.country_id.message}</p>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                Select the primary country for this package
              </p>
            )}
          </div>
          
          {/* Holiday Types */}
          <div className="sm:col-span-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-gray-800">
                Holiday Types
              </label>
            </div>
            <div className="mt-2 bg-white p-6 rounded-lg shadow-sm ring-1 ring-inset ring-gray-200">
              <div className="mb-3">
                <p className="text-sm text-gray-700">Select all holiday types that apply to this package:</p>
              </div>
              <Controller
                name="holiday_type_ids"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {holidayTypes?.map((type) => {
                      const checkboxId = `holiday-type-${type.id}`;
                      const isChecked = (field.value || []).includes(type.id);
                      
                      return (
                        <div key={type.id} className="relative flex items-start">
                          <div className="flex h-6 items-center">
                            <input
                              id={checkboxId}
                              type="checkbox"
                              className="h-5 w-5 rounded border-gray-300 text-teal focus:ring-teal focus:ring-offset-0"
                              checked={isChecked}
                              onChange={(e) => {
                                const currentTypes = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...currentTypes, type.id]);
                                } else {
                                  field.onChange(currentTypes.filter((id) => id !== type.id));
                                }
                              }}
                            />
                          </div>
                          <div className="ml-3 text-sm leading-6">
                            <label htmlFor={checkboxId} className="font-medium text-gray-900 cursor-pointer">
                              {type.name}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              />
              {errors.holiday_type_ids && (
                <div className="mt-3 flex items-center text-sm text-red-600">
                  <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{errors.holiday_type_ids.message}</span>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Holiday types help categorize packages and improve discoverability
            </p>
          </div>
          
          {/* Package Image */}
          <div className="sm:col-span-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-gray-800">
                Package Image
              </label>
            </div>
            <div className="mt-2 bg-white p-6 rounded-lg shadow-sm ring-1 ring-inset ring-gray-200">
              <div className="mb-3">
                <p className="text-sm text-gray-700">Upload or select an image for this package:</p>
              </div>
              <ImageSelector
                initialImageId={watch('image_id')}
                onImageSelected={(imageId) => {
                  console.log('Package image selected:', imageId);
                  
                  // Update the form value
                  setValue('image_id', imageId);
                  
                  // If we're editing an existing package, update the cover image immediately
                  if (isEdit && packageId && imageId) {
                    console.log('Immediately updating package cover image to:', imageId);
                    apiClient.post(`/api/v1/packages/${packageId}/cover-image`, {
                      image_id: imageId
                    })
                    .then(response => {
                      console.log('Package cover image updated successfully:', response);
                      
                      // Force refresh the form data
                      if (packageData) {
                        packageData.image_id = imageId;
                      }
                    })
                    .catch(error => {
                      console.error('Error updating package cover image:', error);
                    });
                  } else if (!isEdit && imageId) {
                    // For new packages, just store the image ID to be used when creating the package
                    console.log('Storing image ID for new package:', imageId);
                  }
                }}
                variant="thumbnail"
                className="mt-2"
              />
              {errors.image_id && (
                <div className="mt-3 flex items-center text-sm text-red-600">
                  <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{errors.image_id.message}</span>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Choose a high-quality image that represents this package. Recommended size: 1200x800 pixels.
            </p>
          </div>
          
          {/* Gallery Management */}
          <div className="sm:col-span-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-gray-800">
                Gallery Images
              </label>
            </div>
            <div className="mt-2 bg-white p-6 rounded-lg shadow-sm ring-1 ring-inset ring-gray-200">
              <div className="mb-3">
                <p className="text-sm text-gray-700">Upload multiple images to create a gallery for this package:</p>
              </div>
              <GalleryManager
                entityType="package"
                entityId={packageData?.id}
                images={galleryImages}
                coverImageId={coverImageId}
                onImagesChange={setGalleryImages}
                onCoverImageChange={setCoverImageId}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Upload high-quality images that showcase this package. The first image or selected cover image will be used as the main package image.
            </p>
          </div>

          {/* Itinerary Management */}
          {isEdit && packageData?.id && (
            <div className="sm:col-span-6">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-gray-800">
                  Package Itinerary
                </label>
              </div>
              <div className="mt-2">
                <SimpleItineraryManager
                  entityType="package"
                  entityId={packageData.id}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Create a day-by-day itinerary for this package. This helps travelers understand what to expect each day.
              </p>
            </div>
          )}
          
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
                  <p className="text-sm text-gray-500 mt-1">Control whether this package is visible on the website</p>
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
            onClick={() => navigate('/admin/packages')}
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Packages
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
                  {isEdit ? 'Update Package' : 'Create Package'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PackageForm;
