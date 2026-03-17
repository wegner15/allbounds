import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ActivityResponse } from '../../../lib/types/api';
import Button from '../../../components/ui/Button';
import { getCloudflareImageUrl } from '../../../utils/imageUtils';
import { useActivities, useDeleteActivity } from '../../../lib/hooks/useActivities';
import CountryFilterSelect from '../../../components/ui/CountryFilterSelect';

const ActivityListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<number | undefined>(undefined);
  const { data: activities, isLoading, error } = useActivities(selectedCountryId);
  const deleteActivity = useDeleteActivity();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const filteredActivities = activities?.filter((a: ActivityResponse) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Search + Country Filter */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 text-sm placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal transition-colors shadow-sm"
            placeholder="Search activities by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3">
          <CountryFilterSelect
            value={selectedCountryId}
            onChange={(id) => { setSelectedCountryId(id); setSearchTerm(''); }}
            className="w-full sm:w-56"
          />
          {selectedCountryId && (
            <button
              onClick={() => setSelectedCountryId(undefined)}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Failed to load activities</p>}
      {filteredActivities !== undefined && (
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
              {filteredActivities!.map(activity => (
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
