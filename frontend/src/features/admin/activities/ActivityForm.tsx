import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/FormTextarea';
import FormCheckbox from '../../../components/ui/FormCheckbox';
import type { ActivityCreate, ActivityUpdate, MediaAsset } from '../../../lib/types/api';
import MediaGallery from '../../../components/media/MediaGallery';
import CloudflareImageUpload from '../../../components/ui/CloudflareImageUpload';

const activitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  is_active: z.boolean(),
  cover_image_id: z.number().nullable().optional(),
  media_asset_ids: z.array(z.number()).optional(),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

interface ActivityFormProps {
  onSubmit: (data: ActivityCreate | ActivityUpdate) => void;
  defaultValues?: ActivityFormValues & { 
    media_assets?: MediaAsset[];
    cover_image?: MediaAsset;
  };
  isEditing?: boolean;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ onSubmit, defaultValues, isEditing = false }) => {
  const methods = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: defaultValues || { name: '', description: '', is_active: true, cover_image_id: null, media_asset_ids: [] },
  });
  const { control, handleSubmit, formState: { errors }, setValue, watch } = methods;

  const mediaAssetIds = watch('media_asset_ids') || [];
  const coverImageId = watch('cover_image_id');
  const queryClient = useQueryClient();

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(data => onSubmit(data as ActivityCreate | ActivityUpdate))} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input id="name" {...field} />}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => <Textarea id="description" {...field} />}
          />
        </div>

        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <FormCheckbox
              id="is_active"
              label="Active"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700">Cover Image</label>
          
          {/* Show current cover image if exists */}
          {defaultValues?.cover_image && (
            <div className="mt-2 mb-4">
              <p className="text-sm text-gray-600 mb-2">Current cover image:</p>
              <div className="flex items-center space-x-4">
                <img 
                  src={`${import.meta.env.VITE_CLOUDFLARE_IMAGES_DELIVERY_URL}/${defaultValues.cover_image.storage_key}/medium`}
                  alt={defaultValues.cover_image.alt_text || defaultValues.cover_image.filename}
                  className="w-20 h-20 object-cover rounded border"
                />
                <div>
                  <p className="text-sm font-medium">{defaultValues.cover_image.filename}</p>
                  <p className="text-xs text-gray-500">ID: {defaultValues.cover_image.id}</p>
                </div>
              </div>
            </div>
          )}
          
          <CloudflareImageUpload
            onUploadComplete={(response) => {
              if (response?.media_asset?.id) {
                setValue('cover_image_id', response.media_asset.id);
              }
            }}
            buttonText={defaultValues?.cover_image ? "Replace Cover Image" : "Upload Cover Image"}
          />
          
          {/* Show current form value */}
          {coverImageId && (
            <div className="mt-2 text-sm text-gray-600">
              Selected cover image ID: {coverImageId}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Gallery</label>
            <CloudflareImageUpload
              onUploadComplete={(response) => {
                if (response?.media_asset?.id) {
                  setValue('media_asset_ids', [...mediaAssetIds, response.media_asset.id]);
                  queryClient.invalidateQueries({ queryKey: ['admin-media'] });
                }
              }}
              buttonText="Upload New Media"
            />
          </div>
          <MediaGallery 
            selectedIds={mediaAssetIds}
            onAdd={(media) => setValue('media_asset_ids', [...mediaAssetIds, media.id])}
            onRemove={(mediaId) => setValue('media_asset_ids', mediaAssetIds.filter(id => id !== mediaId))}
          />
        </div>

        <Button type="submit">{isEditing ? 'Update' : 'Create'} Activity</Button>
      </form>
    </FormProvider>
  );
};

export default ActivityForm;
