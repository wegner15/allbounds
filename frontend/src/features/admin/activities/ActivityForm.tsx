import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import TinyMCEEditor from '../../../components/ui/TinyMCEEditor';
import FormCheckbox from '../../../components/ui/FormCheckbox';
import type { ActivityCreate, ActivityUpdate, MediaAsset } from '../../../lib/types/api';
import MediaGallery from '../../../components/media/MediaGallery';
import CloudflareImageUpload from '../../../components/ui/CloudflareImageUpload';
import { useCountries } from '../../../lib/hooks/useCountries';
import { getCloudflareImageUrl } from '../../../utils/imageUtils';

const activitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  summary: z.string().max(255, 'Summary cannot exceed 255 characters').optional(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  cover_image_id: z.number().nullable().optional(),
  media_asset_ids: z.array(z.number()).optional(),
  country_ids: z.array(z.number()).optional(),
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
    defaultValues: defaultValues || { name: '', description: '', is_active: true, is_featured: false, cover_image_id: null, media_asset_ids: [], country_ids: [] },
  });
  const { control, handleSubmit, formState: { errors }, setValue, watch } = methods;

  const mediaAssetIds = watch('media_asset_ids') || [];
  const coverImageId = watch('cover_image_id');
  const countryIds = watch('country_ids') || [];
  const queryClient = useQueryClient();
  const { data: countries, isLoading: countriesLoading } = useCountries();

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
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TinyMCEEditor
                label="Description"
                value={field.value || ''}
                onChange={field.onChange}
                helperText="Describe the activity in detail"
                placeholder="Detailed description of the activity..."
                height={300}
              />
            )}
          />
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
            Summary
          </label>
          <Controller
            name="summary"
            control={control}
            render={({ field }) => (
              <textarea
                id="summary"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Brief summary for cards and previews..."
                {...field}
              />
            )}
          />
          {errors.summary && <p className="text-sm text-red-500 mt-1">{errors.summary.message}</p>}
          <p className="text-xs text-gray-500 mt-1">A concise summary that appears in activity cards and search results</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Countries</label>
          {countriesLoading ? (
            <p className="text-sm text-gray-500">Loading countries...</p>
          ) : (
            <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
              {countries?.map((country) => (
                <div key={country.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`country-${country.id}`}
                    checked={countryIds.includes(country.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setValue('country_ids', [...countryIds, country.id]);
                      } else {
                        setValue('country_ids', countryIds.filter(id => id !== country.id));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`country-${country.id}`} className="ml-2 text-sm text-gray-700">
                    {country.name}
                  </label>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">Select countries where this activity is available</p>
        </div>

        <div className="space-y-3">
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
          
          <Controller
            name="is_featured"
            control={control}
            render={({ field }) => (
              <FormCheckbox
                id="is_featured"
                label="Featured"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cover Image</label>
          
          {/* Show current cover image if exists */}
          {defaultValues?.cover_image && (
            <div className="mt-2 mb-4">
              <p className="text-sm text-gray-600 mb-2">Current cover image:</p>
              <div className="flex items-center space-x-4">
                {(() => {
                  const coverImage = defaultValues.cover_image as MediaAsset;
                  const sourceId = coverImage?.storage_key || coverImage?.file_path || coverImage?.url;
                  const coverImageUrl = sourceId ? getCloudflareImageUrl(sourceId, 'medium') : null;
                  const resolvedUrl = coverImageUrl || coverImage?.url || coverImage?.file_path;
                  return resolvedUrl ? (
                    <img
                      src={resolvedUrl}
                      alt={coverImage?.alt_text || coverImage?.filename}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ) : null;
                })()}
                <div>
                  <p className="text-sm font-medium">{defaultValues.cover_image.filename}</p>
                  <p className="text-xs text-gray-500">ID: {defaultValues.cover_image.id}</p>
                </div>
              </div>
            </div>
          )}
          
          <CloudflareImageUpload
            onUploadComplete={(response) => {
              if ((response as any)?.media_asset?.id) {
                setValue('cover_image_id', (response as any).media_asset.id);
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
                if ((response as any)?.media_asset?.id) {
                  setValue('media_asset_ids', [...mediaAssetIds, (response as any).media_asset.id]);
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
