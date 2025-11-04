import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { ActivityResponse } from '../../../lib/types/api';
import Button from '../../../components/ui/Button';
import { getCloudflareImageUrl } from '../../../utils/imageUtils';
import { useDeleteActivity } from '../../../lib/hooks/useActivities';

const ActivityListPage: React.FC = () => {
  const { data: activities, isLoading, error } = useQuery<ActivityResponse[]>({
    queryKey: ['admin-activities'],
    queryFn: () => apiClient.get(endpoints.activities.list()),
  });
  const deleteActivity = useDeleteActivity();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await deleteActivity.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete activity:', error);
      alert('Failed to delete activity. Please try again.');
    }
  };

  const getSummaryText = (value?: string | null) => {
    if (!value) return '';
    const plainText = value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return plainText;
  };

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
                    {(() => {
                      const coverMedia = activity.cover_image
                        ? activity.cover_image
                        : activity.media_assets.find(asset => asset.id === (activity.cover_image?.id || activity.cover_image_id));
                      const sourceId = coverMedia?.storage_key || coverMedia?.file_path || coverMedia?.url;
                      const coverUrl = sourceId ? getCloudflareImageUrl(sourceId, 'medium') : null;
                      const resolvedUrl = coverUrl || coverMedia?.url || coverMedia?.file_path;
                      return resolvedUrl ? (
                        <img
                          src={resolvedUrl}
                          alt={coverMedia?.alt_text || coverMedia?.filename || activity.name}
                          className="w-12 h-12 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                          <span className="text-xs text-gray-500">No image</span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                    {getSummaryText(activity.summary || activity.description) && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {getSummaryText(activity.summary || activity.description)}
                      </div>
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
                    <div className="flex items-center justify-end space-x-4">
                      <Link to={`/admin/activities/${activity.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(activity.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this activity? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={deleteActivity.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={deleteActivity.isPending}
              >
                {deleteActivity.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityListPage;
