import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { ActivityResponse, ActivityUpdate } from '../../../lib/types/api';
import ActivityForm from './ActivityForm';

const ActivityEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const activityId = parseInt(id || '', 10);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [updateError, setUpdateError] = useState<string | null>(null);

  const { data: activity, isLoading, error } = useQuery<ActivityResponse>({
    queryKey: ['admin-activity', activityId],
    queryFn: () => apiClient.get(endpoints.activities.detail(activityId)),
    enabled: !!activityId,
  });

  const { mutate } = useMutation<unknown, Error, ActivityUpdate>({
    mutationFn: (data) => apiClient.put(endpoints.activities.update(activityId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-activities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-activity', activityId] });
      navigate('/admin/activities');
    },
    onError: (error: Error) => {
      setUpdateError(error.message);
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Failed to load activity</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Activity</h1>
      {updateError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{updateError}</span>
        </div>
      )}
      {activity && (
        <ActivityForm
          onSubmit={(data) => {
            // Ensure we're only passing ActivityUpdate data
            const updateData: ActivityUpdate = {
              name: data.name,
              description: data.description,
              summary: data.summary,
              is_active: data.is_active,
              is_featured: data.is_featured,
              cover_image_id: data.cover_image_id,
              media_asset_ids: data.media_asset_ids,
              country_ids: data.country_ids
            };
            mutate(updateData);
          }}
          defaultValues={{
            name: activity.name,
            description: activity.description,
            summary: activity.summary,
            is_active: activity.is_active,
            is_featured: activity.is_featured || false,
            cover_image_id: activity.cover_image?.id || null,
            media_asset_ids: activity.media_assets.map(asset => asset.id),
            country_ids: activity.countries?.map(country => country.id) || [],
            cover_image: activity.cover_image || null,
            media_assets: activity.media_assets,
          }}
          isEditing
        />
      )}
    </div>
  );
};

export default ActivityEditPage;
