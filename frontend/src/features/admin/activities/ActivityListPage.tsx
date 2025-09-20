import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { ActivityResponse } from '../../../lib/types/api';
import Button from '../../../components/ui/Button';

const ActivityListPage: React.FC = () => {
  const { data: activities, isLoading, error } = useQuery<ActivityResponse[]>({
    queryKey: ['admin-activities'],
    queryFn: () => apiClient.get(endpoints.activities.list()),
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Activities</h1>
        <Link to="/admin/activities/create">
          <Button>Create Activity</Button>
        </Link>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Failed to load activities</p>}
      {activities && (
        <div className="bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activities.map(activity => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {activity.cover_image_id && activity.media_assets?.length > 0 ? (
                      <img 
                        src={`${import.meta.env.VITE_CLOUDFLARE_IMAGES_DELIVERY_URL}/${activity.media_assets.find(asset => asset.id === activity.cover_image_id)?.storage_key || ''}/medium`}
                        alt={activity.media_assets.find(asset => asset.id === activity.cover_image_id)?.alt_text || activity.name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                        <span className="text-xs text-gray-500">No image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                    {activity.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">{activity.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      activity.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {activity.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link to={`/admin/activities/${activity.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActivityListPage;
