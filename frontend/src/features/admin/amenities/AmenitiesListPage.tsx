import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';
import { useAmenities, useDeleteAmenity } from '../../../lib/hooks/useAmenities';

const AmenitiesListPage: React.FC = () => {
  const [includeInactive, setIncludeInactive] = useState(false);
  const { data: amenities, isLoading, error } = useAmenities(includeInactive);
  const deleteAmenity = useDeleteAmenity();

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this amenity?')) {
      try {
        await deleteAmenity.mutateAsync(id);
        toast.success('Amenity deleted successfully');
      } catch (err) {
        toast.error('Failed to delete amenity');
      }
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-playfair text-charcoal">Amenities</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage hotel amenities that can be assigned to hotels.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-2">
            <label className="inline-flex items-center text-sm text-gray-600 mr-4">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="mr-2 rounded border-gray-300"
              />
              Show Inactive
            </label>
            <Link to="/admin/amenities/new">
              <Button variant="primary" size="md">
                Add Amenity
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow-md border border-gray-100 md:rounded-lg">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-pulse text-charcoal">Loading...</div>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center bg-red-50 border border-red-200 rounded-md text-red-700">
                    Failed to load amenities
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-charcoal sm:pl-6"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-charcoal"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-charcoal"
                        >
                          Category
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-charcoal"
                        >
                          Icon
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-charcoal"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right"
                        >
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {amenities?.map((amenity) => (
                        <tr key={amenity.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {amenity.name}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {amenity.description?.length > 50
                              ? `${amenity.description.substring(0, 50)}...`
                              : amenity.description || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {amenity.category || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {amenity.icon || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                amenity.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {amenity.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex justify-end space-x-2">
                              <Link to={`/admin/amenities/${amenity.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </Link>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDelete(amenity.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AmenitiesListPage;
