import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../components/ui/FormInput';
import FormCheckbox from '../../../components/ui/FormCheckbox';
import FormGroup from '../../../components/ui/FormGroup';
import Button from '../../../components/ui/Button';
import ImageSelector from '../../../components/ui/ImageSelector';
import TinyMCEEditor from '../../../components/ui/TinyMCEEditor';

// Form validation schema for regions
const regionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  summary: z.string().max(255, 'Summary cannot exceed 255 characters').optional(),
  image_id: z.string().optional(),
  image_alt_text: z.string().optional(),
  image_title: z.string().optional(),
  is_active: z.boolean(), // Default is handled in useForm
});

export type RegionFormData = z.infer<typeof regionSchema> & {
  image_alt_text?: string;
  image_title?: string;
};

interface RegionFormProps {
  initialData?: Partial<RegionFormData & { id?: number }>;
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
  const navigate = useNavigate();
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    control,
    formState: { errors } 
  } = useForm<RegionFormData>({
    resolver: zodResolver(regionSchema), // No 'as any' needed now
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      summary: initialData?.summary || '',
      image_id: initialData?.image_id || '',
      image_alt_text: initialData?.image_alt_text || '',
      image_title: initialData?.image_title || '',
      is_active: initialData?.is_active ?? true,
    }
  });

  // Auto-generate slug from name
  const name = watch('name');
  const imageTitle = watch('image_title');
  const imageAltText = watch('image_alt_text');

  useEffect(() => {
    if (!isEdit && name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      setValue('slug', generatedSlug);
    }
  }, [name, setValue, isEdit]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {serverError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <FormGroup>
            <FormInput
              id="name"
              label="Region Name"
              error={errors.name}
              {...register('name')}
            />
          </FormGroup>
          
          {/* Slug Field */}
          <FormGroup>
            <FormInput
              id="slug"
              label="Slug"
              error={errors.slug}
              helperText="Used in the URL, e.g., /regions/your-slug"
              {...register('slug')}
            />
          </FormGroup>
          
           {/* Description Field */}
           <div className="md:col-span-2">
             <Controller
               name="description"
               control={control}
               render={({ field, fieldState }) => (
                 <TinyMCEEditor
                   value={field.value}
                   onChange={field.onChange}
                   label="Description"
                   placeholder="Describe this region, its attractions, and what makes it special..."
                   height={300}
                   error={fieldState.error?.message}
                   required
                 />
               )}
             />
            </div>

            {/* Summary Field */}
            <div className="md:col-span-2">
              <FormGroup>
                <label htmlFor="summary" className="block text-sm font-semibold text-gray-800">
                  Summary
                </label>
                <textarea
                  id="summary"
                  rows={3}
                  className="mt-2 block w-full px-4 py-3 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200 ring-gray-300 bg-white focus:ring-2 focus:ring-teal"
                  placeholder="Brief summary for region cards and search results..."
                  {...register('summary')}
                />
                {errors.summary ? (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.summary.message}</p>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">A concise summary that appears in region cards and previews</p>
                )}
              </FormGroup>
            </div>

            {/* Image Upload */}
           <div className="md:col-span-2">
             <FormGroup>
               <Controller
                 name="image_id"
                 control={control}
                 render={({ field }) => (
                   <ImageSelector
                     initialImageId={field.value}
                     onImageSelected={(imageId) => field.onChange(imageId)}
                     label="Region Image"
                     helperText="Upload an image for this region"
                     entityType="region"
                     entityId={isEdit ? initialData?.id : undefined}
                     altText={imageAltText}
                     title={imageTitle}
                   />
                 )}
               />
             </FormGroup>
           </div>

           {/* Image Metadata */}
           <FormGroup>
             <FormInput
               id="image_title"
               label="Image Title"
               helperText="Optional title for the image (for SEO)"
               {...register('image_title')}
             />
           </FormGroup>

           <FormGroup>
             <FormInput
               id="image_alt_text"
               label="Image Alt Text"
               helperText="Describe the image for accessibility"
               {...register('image_alt_text')}
             />
           </FormGroup>
          
          {/* Status */}
          <div className="md:col-span-2">
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
      
      {/* Form actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/destinations')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : (isEdit ? 'Update Region' : 'Create Region')}
        </Button>
      </div>
    </form>
  );
};

export default RegionForm;
