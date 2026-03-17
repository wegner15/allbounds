import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAttractions, useDeleteAttraction } from '../../../lib/hooks/useAttractions';
import type { Attraction } from '../../../lib/hooks/useAttractions';
import { useCountries } from '../../../lib/hooks/useCountries';
import CountryFilterSelect from '../../../components/ui/CountryFilterSelect';

const AttractionsListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<number | undefined>(undefined);
  const { data: countries } = useCountries();
  // Attractions filters by country name string on the backend
  const selectedCountryName = selectedCountryId
    ? countries?.find((c) => c.id === selectedCountryId)?.name
    : undefined;
  const { data: attractions, isLoading, error } = useAttractions(
    selectedCountryName ? { country: selectedCountryName } : undefined
  );
  const deleteAttraction = useDeleteAttraction();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Filter attractions based on search term
  const filteredAttractions = attractions?.filter((attraction: Attraction) =>
    attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attraction.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attraction.country?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    try {
      await deleteAttraction.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete attraction:', error);
      alert('Failed to delete attraction. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Attractions | AllBounds Admin</title>
      </Helmet>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Attractions</h1>
        <Link
          to="/admin/attractions/new"
          className="bg-teal hover:bg-teal-dark text-white py-2 px-4 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Attraction
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search attractions..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <CountryFilterSelect
            value={selectedCountryId}
            onChange={(id) => { setSelectedCountryId(id); setSearchTerm(''); }}
            className="sm:w-56"
          />
          {selectedCountryId && (
            <button
              onClick={() => setSelectedCountryId(undefined)}
              className="sm:w-auto px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap"
            >
              Clear filter
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner"></div>
            <p className="mt-2 text-gray-600">Loading attractions...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            Error loading attractions. Please try again.
          </div>
        ) : filteredAttractions?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No attractions found
              {selectedCountryId && countries ? ` in ${countries.find(c => c.id === selectedCountryId)?.name ?? 'selected country'}` : ''}
              {searchTerm ? ' matching your search' : ''}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttractions?.map((attraction) => (
                  <tr key={attraction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{attraction.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{attraction.city || '--'}, {attraction.country?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attraction.duration_minutes ? (
                        <div>
                          {Math.floor(attraction.duration_minutes / 60) > 0 ? 
                            `${Math.floor(attraction.duration_minutes / 60)}h ` : ''}
                          {attraction.duration_minutes % 60 > 0 ? 
                            `${attraction.duration_minutes % 60}m` : ''}
                        </div>
                      ) : (
                        <span className="text-gray-500">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attraction.price ? (
                        <div>${attraction.price.toFixed(2)}</div>
                      ) : (
                        <span className="text-gray-500">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${attraction.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {attraction.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/admin/attractions/${attraction.id}/edit`}
                        className="text-teal hover:text-teal-dark mr-4"
                      >
                        Edit
                      </Link>
                      <Link 
                        to={`/admin/attractions/${attraction.id}/relationships`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Relationships
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmId(attraction.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this attraction? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={deleteAttraction.isPending}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={deleteAttraction.isPending}
              >
                {deleteAttraction.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttractionsListPage;
