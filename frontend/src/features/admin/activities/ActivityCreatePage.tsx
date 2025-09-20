import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { ActivityCreate } from '../../../lib/types/api';
import ActivityForm from './ActivityForm';

const ActivityCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, error } = useMutation<unknown, Error, ActivityCreate>({
    mutationFn: (data) => apiClient.post(endpoints.activities.create(), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-activities'] });
      navigate('/admin/activities');
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Activity</h1>
      {error && <p className="text-red-500">{(error as Error).message}</p>}
      <ActivityForm onSubmit={(data) => {
        // Ensure we're only passing ActivityCreate data
        // Ensure name is a string as required by ActivityCreate
        const createData: ActivityCreate = {
          name: data.name || '',
          description: data.description,
          is_active: data.is_active,
          cover_image_id: data.cover_image_id,
          media_asset_ids: data.media_asset_ids
        };
        mutate(createData);
      }} />
    </div>
  );
};

export default ActivityCreatePage;
