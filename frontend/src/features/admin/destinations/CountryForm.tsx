import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useRegions, useCreateCountry, useUpdateCountry } from '../../../lib/hooks/useDestinations';
import FormInput from '../../../components/ui/FormInput';
import FormTextarea from '../../../components/ui/FormTextarea';
import FormCheckbox from '../../../components/ui/FormCheckbox';
import FormGroup from '../../../components/ui/FormGroup';
import FormSelect from '../../../components/ui/FormSelect';
import Button from '../../../components/ui/Button';
import ImageSelector from '../../../components/ui/ImageSelector';

// Form validation schema
const countrySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  summary: z.string().max(255, 'Summary cannot exceed 255 characters').optional(),
  region_id: z.number().min(1, 'Please select a region'),
  image_id: z.string(),
  is_active: z.boolean(),
});

type CountryFormData = z.infer<typeof countrySchema>;

interface CountryFormProps {
  countryData?: any; // The country data to edit, if any
  isEdit?: boolean;
}

const CountryForm: React.FC<CountryFormProps> = ({ countryData, isEdit = false }) => {
  const navigate = useNavigate();
  const { data: regions, isLoading: isLoadingRegions } = useRegions();
  
  const createCountryMutation = useCreateCountry();
  const updateCountryMutation = useUpdateCountry(countryData?.id);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Initialize form with default values or existing country data
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CountryFormData>({
    resolver: zodResolver(countrySchema),
    defaultValues: isEdit && countryData
      ? {
          name: countryData.name,
          slug: countryData.slug,
          description: countryData.description,
          summary: countryData.summary || '',
          region_id: countryData.region_id,
          image_id: countryData.image_id || '',
          is_active: countryData.is_active,
        }
      : {
          name: '',
          slug: '',
          description: '',
          summary: '',
          region_id: 0,
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
  
  const onSubmit = async (data: CountryFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    
    try {
      if (isEdit) {
        await updateCountryMutation.mutateAsync(data);
      } else {
        await createCountryMutation.mutateAsync(data);
      }
      
      navigate('/admin/destinations');
    } catch (error) {
      console.error('Error saving country:', error);
      setServerError('An error occurred while saving the country. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingRegions) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading regions...</p>
        </div>
      </div>
    );
  }
  
  // Type-safe form submission handler
  const handleFormSubmit = handleSubmit(onSubmit);
  
  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      {serverError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            {isEdit ? 'Country Information' : 'New Country Details'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Update the country information below' : 'Fill in the details to add a new country'}
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
            {/* Name */}
            <div className="sm:col-span-3">
              <FormGroup>
                <FormInput
                  id="name"
                  type="text"
                  label="Country Name"
                  error={errors.name}
                  fullWidth
                  variant="filled"
                  placeholder="e.g. France"
                  {...register('name')}
                />
              </FormGroup>
            </div>
            
            {/* Slug */}
            <div className="sm:col-span-3">
              <FormGroup>
                <FormInput
                  id="slug"
                  type="text"
                  label="URL Slug"
                  error={errors.slug}
                  fullWidth
                  variant="filled"
                  placeholder="e.g. france"
                  helperText="Used in the URL: example.com/countries/your-slug"
                  {...register('slug')}
                />
              </FormGroup>
            </div>
            
            {/* Region selector */}
            <div className="sm:col-span-3">
              <FormGroup>
                <FormSelect
                  id="region_id"
                  label="Region"
                  error={errors.region_id}
                  fullWidth
                  variant="filled"
                  {...register('region_id', { valueAsNumber: true })}
                >
                  <option value={0}>Select a region</option>
                  {regions?.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </FormSelect>
              </FormGroup>
            </div>
            
            {/* Image Upload */}
            <div className="sm:col-span-3">
              <FormGroup>
                <ImageSelector
                  initialImageId={watch('image_id')}
                  onImageSelected={(imageId) => setValue('image_id', imageId)}
                  label="Country Image"
                  helperText="Upload an image for this country"
                />
              </FormGroup>
            </div>
            
             {/* Description */}
             <div className="sm:col-span-6">
               <FormGroup>
                 <FormTextarea
                   id="description"
                   label="Description"
                   error={errors.description}
                   fullWidth
                   variant="filled"
                   rows={5}
                   placeholder="Provide a detailed description of the country, including key attractions, geography, and cultural highlights..."
                   {...register('description')}
                 />
               </FormGroup>
              </div>

             {/* Summary */}
             <div className="sm:col-span-6">
               <FormGroup>
                 <FormTextarea
                   id="summary"
                   label="Summary"
                   error={errors.summary}
                   fullWidth
                   variant="filled"
                   rows={3}
                   placeholder="Brief summary for cards and previews..."
                   helperText="A concise summary that appears in country cards and search results (max 255 characters)"
                   {...register('summary')}
                 />
               </FormGroup>
              </div>

             {/* Summary */}
             <div className="sm:col-span-6">
               <FormGroup>
                 <FormTextarea
                   id="summary"
                   label="Summary"
                   error={errors.summary}
                   fullWidth
                   variant="filled"
                   rows={3}
                   placeholder="Brief summary for country cards and search results..."
                   helperText="A concise summary that appears in country cards and previews"
                   {...register('summary')}
                 />
               </FormGroup>
             </div>

             {/* Status */}
            <div className="sm:col-span-6">
              <FormGroup>
                <FormCheckbox
                  id="is_active"
                  label="Active (visible on the website)"
                  {...register('is_active')}
                />
              </FormGroup>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => navigate('/admin/destinations')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : isEdit ? 'Update Country' : 'Create Country'}
        </Button>
      </div>
    </form>
  );
};

export default CountryForm;
