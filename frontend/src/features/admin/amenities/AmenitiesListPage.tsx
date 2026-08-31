import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';
import { useAmenities, useDeleteAmenity } from '../../../lib/hooks/useAmenities';

const AmenitiesListPage: React.FC = () => {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useAmenities(page, limit, includeInactive);
  const deleteAmenity = useDeleteAmenity();

  const amenities = data?.items || [];
  const totalPages = data?.pages || 0;

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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
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
                onChange={(e) => {
                  setIncludeInactive(e.target.checked);
                  setPage(1); // Reset to first page when filtering
                }}
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
                  <>
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
                            Popular
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
                        {amenities.map((amenity) => (
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
                              {amenity.is_popular ? (
                                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                  ⭐ Popular
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <span
                                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${amenity.is_active
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, data?.total || 0)}</span> of{' '}
                              <span className="font-medium">{data?.total}</span> results
                            </p>
                          </div>
                          <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                              <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === 1 ? 'cursor-not-allowed opacity-50' : ''
                                  }`}
                              >
                                <span className="sr-only">Previous</span>
                                {/* Chevron Left */}
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>

                              {/* Page Numbers */}
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                                // Simple logic to show limited pages could be added here, but for now showing all if not too many
                                // or just simple window.
                                // Let's just show all for now as it's admin or adding simple logic
                                if (
                                  totalPages > 7 &&
                                  pageNum !== 1 &&
                                  pageNum !== totalPages &&
                                  Math.abs(page - pageNum) > 1
                                ) {
                                  if (Math.abs(page - pageNum) === 2) return <span key={pageNum} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>;
                                  return null;
                                }

                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pageNum
                                        ? 'z-10 bg-teal border-teal text-white'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                      }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}

                              <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${page === totalPages ? 'cursor-not-allowed opacity-50' : ''
                                  }`}
                              >
                                <span className="sr-only">Next</span>
                                {/* Chevron Right */}
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </nav>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
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
