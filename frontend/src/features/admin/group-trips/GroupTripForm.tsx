import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreateGroupTrip, useUpdateGroupTrip, useGroupTripDetailsById } from '../../../lib/hooks/useGroupTrips';
import { useCountries } from '../../../lib/hooks/useDestinations';
import { usePackages } from '../../../lib/hooks/usePackages';
import { useInclusions } from '../../../lib/hooks/useInclusions';
import { useExclusions } from '../../../lib/hooks/useExclusions';
import GalleryManager from '../../../components/admin/GalleryManager';
import { SimpleItineraryManager } from '../../../components/admin/SimpleItineraryManager';
import { apiClient } from '../../../lib/api';
import ImageSelector from '../../../components/ui/ImageSelector';
import TinyMCEEditor from '../../../components/ui/TinyMCEEditor';

// Form validation schema
const groupTripSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  country_id: z.number().min(1, 'Please select a destination'),
  package_id: z.number().optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  duration_days: z.number().min(1, 'Duration must be at least 1 day'),
  max_participants: z.number().min(1, 'Maximum participants must be at least 1'),
  price: z.number().min(0, 'Price must be a positive number'),
  inclusion_ids: z.array(z.number()).optional(),
  exclusion_ids: z.array(z.number()).optional(),
  image_id: z.string().optional(),
  is_active: z.boolean(),
});

type GroupTripFormData = z.infer<typeof groupTripSchema>;

interface GroupTripFormProps {
  groupTripData?: any; // The group trip data to edit, if any
  isEdit?: boolean;
  groupTripId?: number; // The ID of the group trip being edited
}

const GroupTripForm: React.FC<GroupTripFormProps> = ({ groupTripData, isEdit = false, groupTripId }) => {
  const navigate = useNavigate();
  
  const { data: countries, isLoading: isLoadingCountries } = useCountries();
  const isLoadingDestinations = isLoadingCountries;
  const { data: packages } = usePackages();
  const { data: inclusions, isLoading: isLoadingInclusions } = useInclusions();
  const { data: exclusions, isLoading: isLoadingExclusions } = useExclusions();
  
  // Fetch group trip details with gallery if editing
  const { data: groupTripDetails } = useGroupTripDetailsById(groupTripId || 0);
  
  const createGroupTripMutation = useCreateGroupTrip();
  const updateGroupTripMutation = useUpdateGroupTrip();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    isEdit && groupTripData ? groupTripData.country_id : null
  );
  
  // Gallery state
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [coverImageId, setCoverImageId] = useState<number | null>(null);
  
  // Initialize gallery data when editing
  useEffect(() => {
    if (isEdit && groupTripDetails?.gallery) {
      setGalleryImages(groupTripDetails.gallery);
      // Find cover image from gallery or use the main image_id
      const coverImage = groupTripDetails.gallery.find((img: any) => img.id === groupTripDetails.cover_image_id);
      if (coverImage) {
        setCoverImageId(coverImage.id);
      }
    }
  }, [isEdit, groupTripDetails]);
  
  // Initialize form with default values or existing group trip data
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<GroupTripFormData>({
    resolver: zodResolver(groupTripSchema),
    defaultValues: isEdit && groupTripData
      ? {
          name: groupTripData.name,
          slug: groupTripData.slug,
          description: groupTripData.description,
          country_id: groupTripData.country_id,
          package_id: groupTripData.package_id || 0,
          duration_days: groupTripData.duration_days || 1,
          max_participants: groupTripData.max_participants || 10,
          price: groupTripData.price || 0,
          inclusion_ids: groupTripData.inclusion_items?.map((item: any) => item.id) || [],
          exclusion_ids: groupTripData.exclusion_items?.map((item: any) => item.id) || [],
          image_id: groupTripData.image_id || '',
          is_active: groupTripData.is_active !== undefined ? groupTripData.is_active : true,
          start_date: groupTripData.start_date || '',
          end_date: groupTripData.end_date || '',
        }
      : {
          name: '',
          slug: '',
          description: '',
          country_id: 0,
          package_id: 0,
          duration_days: 1,
          max_participants: 10,
          price: 0,
          inclusion_ids: [],
          exclusion_ids: [],
          is_active: true,
          start_date: '',
          end_date: ''
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
  
  // Watch country_id to filter packages
  const countryId = watch('country_id');
  useEffect(() => {
    setSelectedCountryId(countryId || null);
  }, [countryId]);
  
  // Filter packages by selected country
  const filteredPackages = packages?.filter(pkg => 
    pkg.country_id === selectedCountryId
  );
  
  // Add refs to track important form values
  const imageIdRef = React.useRef<string>('');
  
  // Watch image_id and store in ref
  const currentImageId = watch('image_id');
  useEffect(() => {
    if (currentImageId) {
      imageIdRef.current = currentImageId;
    }
  }, [currentImageId]);

  const onSubmit = async (data: GroupTripFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    
    try {
      // Log all form data to help with debugging
      console.log('Form submission data:', data);
      
      // Prepare the group trip data - explicitly include only fields the API expects
      const groupTripData = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        country_id: data.country_id,
        package_id: data.package_id,
        duration_days: data.duration_days,
        max_participants: data.max_participants,
        price: data.price,
        image_id: data.image_id || undefined,
        is_active: data.is_active
      };
      
      let savedTrip;
      
      if (isEdit) {
        // Get the group trip ID from props or from URL as fallback
        const tripId = groupTripId || parseInt(window.location.pathname.split('/').pop() || '0');
        
        // Create a clean update data object with only the fields we want to update
        const updateData = {
          ...groupTripData,
          id: tripId
        };
        
        console.log('Update data for group trip:', updateData);
        savedTrip = await updateGroupTripMutation.mutateAsync(updateData);
        
        // After updating the group trip, handle the departure
        try {
          // Get existing departures
          const departures = await apiClient.get(`/group-trips/${savedTrip.id}/departures`);
          
          if (data.start_date && data.end_date) {
            // Always use the dates from the form when available
            const startDate = new Date(data.start_date);
            const endDate = new Date(data.end_date);
            
            const departureData = {
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              price: data.price,
              available_slots: data.max_participants || 10,
              is_active: data.is_active
            };
            
            if (Array.isArray(departures) && departures.length > 0) {
              // Update existing departure
              await apiClient.put(
                `/group-trips/${savedTrip.id}/departures/${departures[0].id}`, 
                departureData
              );
            } else {
              // Create new departure
              await apiClient.post(
                `/group-trips/${savedTrip.id}/departures`, 
                {
                  ...departureData,
                  group_trip_id: savedTrip.id,
                  booked_slots: 0
                }
              );
            }
          }
          
          // Update inclusions and exclusions
          try {
            console.log('Updating inclusions:', data.inclusion_ids);
            await apiClient.post(`/group-trips/${savedTrip.id}/inclusions`, {
              inclusion_ids: data.inclusion_ids || []
            });
            
            console.log('Updating exclusions:', data.exclusion_ids);
            await apiClient.post(`/group-trips/${savedTrip.id}/exclusions`, {
              exclusion_ids: data.exclusion_ids || []
            });
          } catch (error) {
            console.error('Error updating inclusions/exclusions:', error);
          }
        } catch (departureError) {
          console.error('Error updating/creating departure:', departureError);
          // Continue with form submission even if departure update fails
        }
      } else {
        // Create new group trip
        savedTrip = await createGroupTripMutation.mutateAsync(groupTripData);
        
        // After creating the group trip, create a departure
        if (data.start_date && data.end_date) {
          try {
            const startDate = new Date(data.start_date);
            const endDate = new Date(data.end_date);
            
            // Create a departure for this trip
            await apiClient.post(`/group-trips/${savedTrip.id}/departures`, {
              group_trip_id: savedTrip.id,
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              price: data.price,
              available_slots: data.max_participants || 10,
              booked_slots: 0,
              is_active: data.is_active
            });
          } catch (departureError) {
            console.error('Error creating departure:', departureError);
            // Continue even if departure creation fails
          }
        }
        
        // Add inclusions and exclusions for the new group trip
        if (savedTrip?.id) {
          try {
            console.log('Adding inclusions to new group trip:', data.inclusion_ids);
            await apiClient.post(`/group-trips/${savedTrip.id}/inclusions`, {
              inclusion_ids: data.inclusion_ids || []
            });
            
            console.log('Adding exclusions to new group trip:', data.exclusion_ids);
            await apiClient.post(`/group-trips/${savedTrip.id}/exclusions`, {
              exclusion_ids: data.exclusion_ids || []
            });
          } catch (error) {
            console.error('Error adding inclusions/exclusions to new group trip:', error);
          }
        }
      }
      
      navigate('/admin/group-trips');
    } catch (error) {
      console.error('Error saving group trip:', error);
      setServerError('An error occurred while saving the group trip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingDestinations) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
        <p className="mt-2">Loading countries...</p>
      </div>
    );
  }
  
  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-8"
    >
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative">
          {serverError}
        </div>
      )}
      
      {/* Trip Details Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Trip Details</h3>
          <p className="mt-1 text-sm text-gray-500">Basic information about the group trip.</p>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Name */}
            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Trip Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  className={`shadow-sm focus:ring-teal focus:border-teal block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 bg-white transition-colors ${
                    errors.name ? 'border-red-300 bg-red-50' : 'hover:border-gray-400'
                  }`}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            </div>
            
            {/* Slug */}
            <div className="sm:col-span-4">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="slug"
                  className={`shadow-sm focus:ring-teal focus:border-teal block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.slug ? 'border-red-300' : ''
                  }`}
                  {...register('slug')}
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Used in the URL: https://example.com/group-trips/your-slug
              </p>
            </div>
            
            {/* Destination (Country) */}
            <div className="sm:col-span-3">
              <label htmlFor="country_id" className="block text-sm font-medium text-gray-700">
                Destination
              </label>
              <div className="mt-1">
                <select
                  id="country_id"
                  className={`shadow-sm focus:ring-teal focus:border-teal block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 bg-white transition-colors appearance-none ${
                    errors.country_id ? 'border-red-300 bg-red-50' : 'hover:border-gray-400'
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                  {...register('country_id', { valueAsNumber: true })}
                >
                  <option value={0}>Select a destination</option>
                  {countries?.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.country_id.message}</p>
                )}
              </div>
            </div>
            
            {/* Package (optional) */}
            <div className="sm:col-span-3">
              <label htmlFor="package_id" className="block text-sm font-medium text-gray-700">
                Package (Optional)
              </label>
              <div className="mt-1">
                <select
                  id="package_id"
                  className={`shadow-sm focus:ring-teal focus:border-teal block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 bg-white transition-colors appearance-none ${
                    errors.package_id ? 'border-red-300 bg-red-50' : 'hover:border-gray-400'
                  } ${(!selectedCountryId || filteredPackages?.length === 0) ? 'bg-gray-50 text-gray-500' : ''}`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                  {...register('package_id', { valueAsNumber: true })}
                  disabled={!selectedCountryId || filteredPackages?.length === 0}
                >
                  <option value={0}>Select a package (optional)</option>
                  {filteredPackages?.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>
                {errors.package_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.package_id.message}</p>
                )}
                {!selectedCountryId && (
                  <p className="mt-1 text-xs text-gray-500">
                    Select a destination first to see available packages
                  </p>
                )}
              </div>
            </div>
            
            {/* Description */}
            <div className="sm:col-span-6">
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <TinyMCEEditor
                    value={field.value}
                    onChange={field.onChange}
                    label="Description"
                    placeholder="Detailed description of the group trip..."
                    height={350}
                    error={fieldState.error?.message}
                    helperText="Describe the group trip in detail. Include itinerary highlights, included activities, and what makes this trip special."
                    required
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trip Schedule & Capacity Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Schedule & Capacity</h3>
          <p className="mt-1 text-sm text-gray-500">Set dates, duration, and participant limits.</p>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Start Date */}
            <div className="sm:col-span-3">
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="start_date"
                  className={`shadow-sm focus:ring-teal focus:border-teal block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 bg-white transition-colors ${
                    errors.start_date ? 'border-red-300 bg-red-50' : 'hover:border-gray-400'
                  }`}
                  style={{
                    colorScheme: 'light'
                  }}
                  {...register('start_date')}
                />
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                )}
              </div>
            </div>
            
            {/* End Date */}
            <div className="sm:col-span-3">
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="end_date"
                  className={`shadow-sm focus:ring-teal focus:border-teal block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 bg-white transition-colors ${
                    errors.end_date ? 'border-red-300 bg-red-50' : 'hover:border-gray-400'
                  }`}
                  style={{
                    colorScheme: 'light'
                  }}
                  {...register('end_date')}
                />
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
                )}
              </div>
            </div>
            
            {/* Max Participants */}
            <div className="sm:col-span-3">
              <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700">
                Maximum Participants
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="max_participants"
                  min="1"
                  className={`shadow-sm focus:ring-teal focus:border-teal block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 bg-white transition-colors ${
                    errors.max_participants ? 'border-red-300 bg-red-50' : 'hover:border-gray-400'
                  }`}
                  {...register('max_participants', { valueAsNumber: true })}
                />
                {errors.max_participants && (
                  <p className="mt-1 text-sm text-red-600">{errors.max_participants.message}</p>
                )}
              </div>
            </div>
            
            {/* Price */}
            <div className="sm:col-span-3">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="price"
                  min="0"
                  step="0.01"
                  className={`pl-7 shadow-sm focus:ring-teal focus:border-teal block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 bg-white transition-colors ${
                    errors.price ? 'border-red-300 bg-red-50' : 'hover:border-gray-400'
                  }`}
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media & Status Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Media & Status</h3>
          <p className="mt-1 text-sm text-gray-500">Add images and set the trip status.</p>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Cover Image Section */}
            <div className="sm:col-span-6">
              <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-inset ring-gray-200">
                <div className="mb-3">
                  <h4 className="text-lg font-medium text-gray-900">Cover Image</h4>
                  <p className="text-sm text-gray-700">Select a main cover image for this group trip from the gallery.</p>
                </div>
                
                <ImageSelector
                  initialImageId={watch('image_id')}
                  onImageSelected={(imageId: string) => {
                    console.log('Group trip cover image selected:', imageId);
                    setValue('image_id', imageId);
                    setCoverImageId(Number(imageId)); // Also update the local state for gallery manager

                    if (isEdit && groupTripId && imageId) {
                      console.log('Immediately updating group trip cover image to:', imageId);
                      apiClient.put(`/api/v1/group-trips/${groupTripId}/cover-image`, {
                        media_id: Number(imageId)
                      })
                      .then(response => {
                        console.log('Group trip cover image updated successfully:', response);
                      })
                      .catch(error => {
                        console.error('Error updating group trip cover image:', error);
                      });
                    }
                  }}
                  variant="thumbnail"
                  className="mt-2"
                />

                {/* Hidden input to ensure image_id is included in form data */}
                <input
                  type="hidden"
                  {...register('image_id')}
                />
              </div>
            </div>

            {/* Inclusions */}
            <div className="sm:col-span-6">
              <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-inset ring-gray-200">
                <div className="mb-3">
                  <h4 className="text-lg font-medium text-gray-900">Inclusions</h4>
                  <p className="text-sm text-gray-700">Select all inclusions that apply to this group trip:</p>
                </div>
                <Controller
                  name="inclusion_ids"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {inclusions?.map((inclusion) => {
                        const checkboxId = `inclusion-${inclusion.id}`;
                        const isChecked = (field.value || []).includes(inclusion.id);
                        
                        return (
                          <div key={inclusion.id} className="relative flex items-start">
                            <div className="flex h-6 items-center">
                              <input
                                id={checkboxId}
                                type="checkbox"
                                className="h-5 w-5 rounded border-gray-300 text-teal focus:ring-teal focus:ring-offset-0"
                                checked={isChecked}
                                onChange={(e) => {
                                  const currentInclusions = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...currentInclusions, inclusion.id]);
                                  } else {
                                    field.onChange(currentInclusions.filter((id) => id !== inclusion.id));
                                  }
                                }}
                              />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                              <label htmlFor={checkboxId} className="font-medium text-gray-900 cursor-pointer flex items-center">
                                {inclusion.icon && (
                                  <i className={`fas fa-${inclusion.icon} mr-2 text-teal`}></i>
                                )}
                                {inclusion.name}
                                {inclusion.category && (
                                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {inclusion.category}
                                  </span>
                                )}
                              </label>
                              {inclusion.description && (
                                <p className="text-xs text-gray-500 mt-1">{inclusion.description}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Exclusions */}
            <div className="sm:col-span-6">
              <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-inset ring-gray-200">
                <div className="mb-3">
                  <h4 className="text-lg font-medium text-gray-900">Exclusions</h4>
                  <p className="text-sm text-gray-700">Select all exclusions that apply to this group trip:</p>
                </div>
                <Controller
                  name="exclusion_ids"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {exclusions?.map((exclusion) => {
                        const checkboxId = `exclusion-${exclusion.id}`;
                        const isChecked = (field.value || []).includes(exclusion.id);
                        
                        return (
                          <div key={exclusion.id} className="relative flex items-start">
                            <div className="flex h-6 items-center">
                              <input
                                id={checkboxId}
                                type="checkbox"
                                className="h-5 w-5 rounded border-gray-300 text-red-500 focus:ring-red-500 focus:ring-offset-0"
                                checked={isChecked}
                                onChange={(e) => {
                                  const currentExclusions = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...currentExclusions, exclusion.id]);
                                  } else {
                                    field.onChange(currentExclusions.filter((id) => id !== exclusion.id));
                                  }
                                }}
                              />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                              <label htmlFor={checkboxId} className="font-medium text-gray-900 cursor-pointer flex items-center">
                                {exclusion.icon && (
                                  <i className={`fas fa-${exclusion.icon} mr-2 text-red-500`}></i>
                                )}
                                {exclusion.name}
                                {exclusion.category && (
                                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {exclusion.category}
                                  </span>
                                )}
                              </label>
                              {exclusion.description && (
                                <p className="text-xs text-gray-500 mt-1">{exclusion.description}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Gallery Management */}
            <div className="sm:col-span-6">
              <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-inset ring-gray-200">
                <div className="mb-3">
                  <h4 className="text-lg font-medium text-gray-900">Gallery Images</h4>
                  <p className="text-sm text-gray-700">Upload and manage images for this group trip. You can select a cover image from here.</p>
                </div>
                <GalleryManager
                  entityType="group_trip"
                  entityId={groupTripId || 0}
                  images={galleryImages}
                  coverImageId={coverImageId}
                  onImagesChange={setGalleryImages}
                  onCoverImageChange={(imageId) => {
                    setCoverImageId(imageId);
                    const coverImage = galleryImages.find(img => img.id === imageId);
                    if (coverImage) {
                      // Update the dedicated cover image selector as well
                      setValue('image_id', coverImage.cloudflare_id || String(coverImage.id));
                    }
                  }}
                />
              </div>
            </div>

            {/* Itinerary Management */}
            {isEdit && groupTripData?.id && (
              <div className="sm:col-span-6">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-gray-800">
                    Group Trip Itinerary
                  </label>
                </div>
                <div className="mt-2">
                  <SimpleItineraryManager
                    entityType="group_trip"
                    entityId={groupTripData.id}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Create a day-by-day itinerary for this group trip. This helps participants understand the schedule and activities.
                </p>
              </div>
            )}
            
            {/* Status */}
            <div className="sm:col-span-6">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <input
                  id="is_active"
                  type="checkbox"
                  className="h-5 w-5 text-teal focus:ring-teal focus:ring-offset-0 border-gray-300 rounded transition-colors cursor-pointer"
                  {...register('is_active')}
                />
                <label htmlFor="is_active" className="ml-3 block text-sm font-medium text-gray-900 cursor-pointer select-none">
                  Active (visible on the website)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="py-2.5 px-5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal transition-colors"
          onClick={() => navigate('/admin/group-trips')}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="py-2.5 px-5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : isEdit ? 'Update Group Trip' : 'Create Group Trip'}
        </button>
      </div>
    </form>
  );
};

export default GroupTripForm;
