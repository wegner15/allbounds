import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../../components/ui/FormInput';
import FormTextarea from '../../../components/ui/FormTextarea';
import FormCheckbox from '../../../components/ui/FormCheckbox';
import FormGroup from '../../../components/ui/FormGroup';
import Button from '../../../components/ui/Button';
import ImageSelector from '../../../components/ui/ImageSelector';

// Form validation schema for regions
const regionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image_id: z.string().optional(),
  is_active: z.boolean(), // Default is handled in useForm
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
      image_id: initialData?.image_id || '',
      is_active: initialData?.is_active ?? true,
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
            <FormGroup>
              <FormTextarea
                id="description"
                label="Description"
                error={errors.description}
                rows={5}
                {...register('description')}
              />
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
                  />
                )}
              />
            </FormGroup>
          </div>
          
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
