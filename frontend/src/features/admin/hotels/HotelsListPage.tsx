import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useHotels, useDeleteHotel } from '../../../lib/hooks/useHotels';
import type { Hotel } from '../../../lib/hooks/useHotels';
import { useCountries } from '../../../lib/hooks/useCountries';
import CountryFilterSelect from '../../../components/ui/CountryFilterSelect';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../utils/imageUtils';

const HotelsListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<number | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const { data: hotels, isLoading, error } = useHotels(selectedCountryId);
  const { data: countries } = useCountries();
  const deleteHotel = useDeleteHotel();

  // Filter hotels based on search term
  const filteredHotels = hotels?.filter((hotel: Hotel) =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.country?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    try {
      await deleteHotel.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete hotel:', error);
      alert('Failed to delete hotel. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Hotels | AllBounds Admin</title>
      </Helmet>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Hotels</h1>
        <Link
          to="/admin/hotels/new"
          className="bg-teal hover:bg-teal-dark text-white py-2 px-4 rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Hotel
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Search and filters */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 text-sm placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal transition-colors shadow-sm"
              placeholder="Search hotels by name..."
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

        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner"></div>
            <p className="mt-2 text-gray-600">Loading hotels...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            Error loading hotels. Please try again.
          </div>
        ) : filteredHotels?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No hotels found
              {selectedCountryId && countries ? ` in ${countries.find(c => c.id === selectedCountryId)?.name ?? 'selected country'}` : ''}
              {searchTerm ? ' matching your search' : ''}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stars</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHotels?.map((hotel) => (
                  <tr key={hotel.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-14 w-14 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                        {hotel.cover_image || hotel.image_url || hotel.image_id ? (
                          <img
                            src={getImageUrlWithFallback(hotel.cover_image || hotel.image_url || hotel.image_id, IMAGE_VARIANTS.THUMBNAIL, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80')}
                            alt={hotel.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-gray-300"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l3-4 2 3 3-4 4 5z" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{hotel.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{hotel.city || '--'}, {hotel.country?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex">
                        {Array.from({ length: Math.floor(hotel.stars || 0) }).map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        {hotel.stars && hotel.stars % 1 !== 0 && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${hotel.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {hotel.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/admin/hotels/${hotel.id}/edit`}
                        className="text-teal hover:text-teal-dark mr-4"
                      >
                        Edit
                      </Link>
                      <Link 
                        to={`/admin/hotels/${hotel.id}/relationships`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Relationships
                      </Link>
                      <button
                        onClick={() => setDeleteConfirmId(hotel.id)}
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
              Are you sure you want to delete this hotel? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={deleteHotel.isPending}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={deleteHotel.isPending}
              >
                {deleteHotel.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelsListPage;
