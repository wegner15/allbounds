import React from 'react';
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
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Failed to load activity</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Activity</h1>
      {activity && (
        <ActivityForm
          onSubmit={(data) => {
            // Ensure we're only passing ActivityUpdate data
            const updateData: ActivityUpdate = {
              name: data.name,
              description: data.description,
              is_active: data.is_active,
              cover_image_id: data.cover_image_id,
              media_asset_ids: data.media_asset_ids
            };
            mutate(updateData);
          }}
          defaultValues={{
            name: activity.name,
            description: activity.description,
            is_active: activity.is_active,
            cover_image_id: activity.cover_image_id || null,
            media_asset_ids: activity.media_assets.map(asset => asset.id),
            cover_image: activity.media_assets.find(asset => asset.id === activity.cover_image_id),
            media_assets: activity.media_assets,
          }}
          isEditing
        />
      )}
    </div>
  );
};

export default ActivityEditPage;
