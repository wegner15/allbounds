import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeletePackage, usePackages, usePatchPackage } from '../../../lib/hooks/usePackages';
import CloudflareImage from '../../../components/ui/CloudflareImage';
import CountryFilterSelect from '../../../components/ui/CountryFilterSelect';

const PackagesListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<number | undefined>(undefined);
  const [selectedPackageType, setSelectedPackageType] = useState<'all' | 'safari' | 'holiday'>('all');
  const { data: packages, isLoading, error } = usePackages({
    ...(selectedCountryId ? { country_id: selectedCountryId } : {}),
    ...(selectedPackageType !== 'all' ? { package_type: selectedPackageType } : {}),
  });
  const deletePackage = useDeletePackage();
  const patchPackage = usePatchPackage();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [packageTypeModal, setPackageTypeModal] = useState<{
    isOpen: boolean;
    packageItem: any | null;
    selectedType: 'safari' | 'holiday';
  }>({
    isOpen: false,
    packageItem: null,
    selectedType: 'safari',
  });

  // Filter packages based on search query
  const filteredPackages = packages?.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.country?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    try {
      await deletePackage.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete package:', err);
      alert('Failed to delete package. Please try again.');
    }
  };

  const isUpdating = (id: number, field: string) => {
    return patchPackage.isPending &&
      patchPackage.variables?.id === id &&
      patchPackage.variables?.data &&
      Object.prototype.hasOwnProperty.call(patchPackage.variables.data, field);
  };

  return (
    <>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">All Packages</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage your vacation and safari packages
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/admin/packages/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Package
          </Link>
        </div>
      </div>

      {/* Package Type Category Filter Tabs */}
      <div className="flex items-center space-x-2 mb-4 bg-gray-100 p-1.5 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setSelectedPackageType('all')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            selectedPackageType === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Packages
        </button>
        <button
          type="button"
          onClick={() => setSelectedPackageType('safari')}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center space-x-1.5 transition-all ${
            selectedPackageType === 'safari'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-amber-800'
          }`}
        >
          <span>🦁</span>
          <span>Safari Packages</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedPackageType('holiday')}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center space-x-1.5 transition-all ${
            selectedPackageType === 'holiday'
              ? 'bg-teal text-white shadow-sm'
              : 'text-gray-600 hover:text-teal'
          }`}
        >
          <span>🏖️</span>
          <span>Holiday Packages</span>
        </button>
      </div>

      {/* Search and filters */}
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
            placeholder="Search packages by name or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3">
          <CountryFilterSelect
            value={selectedCountryId}
            onChange={(id) => { setSelectedCountryId(id); setSearchQuery(''); }}
            className="w-full sm:w-56"
          />
          {(selectedCountryId || selectedPackageType !== 'all') && (
            <button
              onClick={() => { setSelectedCountryId(undefined); setSelectedPackageType('all'); }}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Packages list */}
      <div className="bg-white shadow rounded-lg">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
            <p className="mt-2">Loading packages...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>Error loading packages. Please try again later.</p>
          </div>
        ) : filteredPackages && filteredPackages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <CloudflareImage
                            imageId={pkg.image_id || ''}
                            variant="medium"
                            alt={pkg.name}
                            className="h-10 w-10 rounded-md object-cover"
                            placeholder="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=40&h=40&q=80"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                          <div className="text-sm text-gray-500">{pkg.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          setPackageTypeModal({
                            isOpen: true,
                            packageItem: pkg,
                            selectedType: (pkg.package_type as 'safari' | 'holiday') || 'safari',
                          })
                        }
                        title="Click to change package category"
                        className={`group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150 hover:scale-105 active:scale-95 shadow-xs cursor-pointer ${
                          pkg.package_type === 'holiday'
                            ? 'bg-teal/15 text-teal border border-teal/30 hover:bg-teal hover:text-white'
                            : 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-600 hover:text-white'
                        }`}
                      >
                        <span>{pkg.package_type === 'holiday' ? '🏖️' : '🦁'}</span>
                        <span>{pkg.package_type === 'holiday' ? 'Holiday' : 'Safari'}</span>
                        <svg
                          className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{pkg.country?.name}</div>
                      {pkg.countries && pkg.countries.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pkg.countries.map((c: any) => (
                            <span
                              key={c.id}
                              className="inline-block bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full border border-teal-100"
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${pkg.price}</div>
                      <div className="text-sm text-gray-500">per person</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{pkg.duration_days} days</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => patchPackage.mutate({ id: pkg.id, data: { is_active: !pkg.is_active } })}
                        disabled={patchPackage.isPending}
                        className={`${pkg.is_active ? 'bg-teal' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 disabled:opacity-50`}
                      >
                        <span className="sr-only">Toggle active status</span>
                        <span className={`${pkg.is_active ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}>
                          {isUpdating(pkg.id, 'is_active') ? (
                            <span className="absolute inset-0 flex h-full w-full items-center justify-center">
                              <svg className="animate-spin h-3 w-3 text-teal" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </span>
                          ) : (
                            <>
                              <span className={`${pkg.is_active ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`} aria-hidden="true">
                                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                                  <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                              <span className={`${pkg.is_active ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`} aria-hidden="true">
                                <svg className="h-3 w-3 text-teal" fill="currentColor" viewBox="0 0 12 12">
                                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                                </svg>
                              </span>
                            </>
                          )}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => patchPackage.mutate({ id: pkg.id, data: { is_featured: !pkg.is_featured } })}
                        disabled={patchPackage.isPending}
                        className={`${pkg.is_featured ? 'bg-yellow-500' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50`}
                      >
                        <span className="sr-only">Toggle featured status</span>
                        <span className={`${pkg.is_featured ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}>
                          {isUpdating(pkg.id, 'is_featured') ? (
                            <span className="absolute inset-0 flex h-full w-full items-center justify-center">
                              <svg className="animate-spin h-3 w-3 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </span>
                          ) : (
                            <>
                              <span className={`${pkg.is_featured ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`} aria-hidden="true">
                                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                                  <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                              <span className={`${pkg.is_featured ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`} aria-hidden="true">
                                <svg className="h-3 w-3 text-yellow-500" fill="currentColor" viewBox="0 0 12 12">
                                  <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                                </svg>
                              </span>
                            </>
                          )}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => patchPackage.mutate({ id: pkg.id, data: { is_deal: !pkg.is_deal } })}
                        disabled={patchPackage.isPending}
                        className={`${pkg.is_deal ? 'bg-red-500' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50`}
                      >
                        <span className="sr-only">Toggle deal status</span>
                        <span className={`${pkg.is_deal ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}>
                          {isUpdating(pkg.id, 'is_deal') ? (
                            <span className="absolute inset-0 flex h-full w-full items-center justify-center">
                              <svg className="animate-spin h-3 w-3 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </span>
                          ) : (
                            <>
                              <span className={`${pkg.is_deal ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`} aria-hidden="true">
                                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                                  <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                              <span className={`${pkg.is_deal ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out'} absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`} aria-hidden="true">
                                <span className="text-[10px]">🔥</span>
                              </span>
                            </>
                          )}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-4">
                        <Link
                          to={`/admin/packages/${pkg.id}/edit`}
                          className="text-teal hover:text-teal-dark"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/packages/${pkg.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(pkg.id)}
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
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No packages found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'No packages match your search criteria.' : 'Get started by creating a new package.'}
            </p>
            <div className="mt-6">
              <Link
                to="/admin/packages/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Package
              </Link>
            </div>
          </div>
        )}
      </div>
      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this package? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={deletePackage.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={deletePackage.isPending}
              >
                {deletePackage.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Package Type Popup Modal */}
      {packageTypeModal.isOpen && packageTypeModal.packageItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transform transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900">Change Package Type</h4>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs font-medium">
                  {packageTypeModal.packageItem.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPackageTypeModal({ isOpen: false, packageItem: null, selectedType: 'safari' })}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mb-5">
              Select which section on the website this package should appear under:
            </p>

            <div className="space-y-3 mb-6">
              {/* Safari option */}
              <div
                onClick={() => setPackageTypeModal(prev => ({ ...prev, selectedType: 'safari' }))}
                className={`cursor-pointer rounded-xl border-2 p-4 flex items-start space-x-3 transition-all duration-150 ${
                  packageTypeModal.selectedType === 'safari'
                    ? 'border-amber-600 bg-amber-50/80 shadow-sm ring-1 ring-amber-600/30'
                    : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/30'
                }`}
              >
                <input
                  type="radio"
                  id="modal_type_safari"
                  name="modal_package_type"
                  checked={packageTypeModal.selectedType === 'safari'}
                  onChange={() => setPackageTypeModal(prev => ({ ...prev, selectedType: 'safari' }))}
                  className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500 mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="modal_type_safari" className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm">
                      <span>🦁</span>
                      <span>Popular Safari Packages</span>
                    </span>
                    {packageTypeModal.selectedType === 'safari' && (
                      <span className="text-xs bg-amber-600 text-white font-semibold px-2 py-0.5 rounded-full">Selected</span>
                    )}
                  </label>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Wildlife tours, game drives, wilderness lodges, and bush adventures (e.g. Kenya, Uganda, Tanzania).
                  </p>
                </div>
              </div>

              {/* Holiday option */}
              <div
                onClick={() => setPackageTypeModal(prev => ({ ...prev, selectedType: 'holiday' }))}
                className={`cursor-pointer rounded-xl border-2 p-4 flex items-start space-x-3 transition-all duration-150 ${
                  packageTypeModal.selectedType === 'holiday'
                    ? 'border-teal bg-teal/10 shadow-sm ring-1 ring-teal/30'
                    : 'border-gray-200 bg-white hover:border-teal-light hover:bg-teal/5'
                }`}
              >
                <input
                  type="radio"
                  id="modal_type_holiday"
                  name="modal_package_type"
                  checked={packageTypeModal.selectedType === 'holiday'}
                  onChange={() => setPackageTypeModal(prev => ({ ...prev, selectedType: 'holiday' }))}
                  className="h-4 w-4 text-teal border-gray-300 focus:ring-teal mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="modal_type_holiday" className="font-bold text-gray-900 cursor-pointer flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm">
                      <span>🏖️</span>
                      <span>Popular Holiday Packages</span>
                    </span>
                    {packageTypeModal.selectedType === 'holiday' && (
                      <span className="text-xs bg-teal text-white font-semibold px-2 py-0.5 rounded-full">Selected</span>
                    )}
                  </label>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Leisure, beach getaways, city tours, island breaks, and international vacation packages (e.g. Dubai, Zanzibar, Mauritius, Egypt).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setPackageTypeModal({ isOpen: false, packageItem: null, selectedType: 'safari' })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={patchPackage.isPending}
                onClick={async () => {
                  if (packageTypeModal.packageItem) {
                    try {
                      await patchPackage.mutateAsync({
                        id: packageTypeModal.packageItem.id,
                        data: { package_type: packageTypeModal.selectedType }
                      });
                      setPackageTypeModal({ isOpen: false, packageItem: null, selectedType: 'safari' });
                    } catch (err) {
                      console.error('Failed to update package type:', err);
                      alert('Failed to update package type. Please try again.');
                    }
                  }
                }}
                className="px-5 py-2 text-sm font-bold text-white bg-teal hover:bg-teal-dark rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {patchPackage.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PackagesListPage;
