import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegions, useCountries } from '../../../lib/hooks/useDestinations';
import CloudflareImageDisplay from '../../../components/ui/CloudflareImageDisplay';

const DestinationsListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'regions' | 'countries'>('regions');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: regions, isLoading: isLoadingRegions, error: regionsError } = useRegions();
  const { data: countries, isLoading: isLoadingCountries, error: countriesError } = useCountries();
  
  // Filter destinations based on search query
  const filteredRegions = regions?.filter(region => 
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredCountries = countries?.filter(country => 
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.region?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Destinations Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage regions and countries for your travel offerings
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to="/admin/destinations/regions/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Region
          </Link>
          <Link
            to="/admin/destinations/countries/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Country
          </Link>
        </div>
      </div>

      {/* Search and tabs */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="search" className="sr-only">
              Search destinations
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-teal focus:border-teal block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search regions or countries"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex">
            <div className="flex border-b border-gray-200">
              <button
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === 'regions'
                    ? 'text-teal border-b-2 border-teal'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('regions')}
              >
                Regions
              </button>
              <button
                className={`ml-8 py-2 px-4 text-sm font-medium ${
                  activeTab === 'countries'
                    ? 'text-teal border-b-2 border-teal'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('countries')}
              >
                Countries
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Regions list */}
      {activeTab === 'regions' && (
        <div className="bg-white shadow rounded-lg">
          {isLoadingRegions ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
              <p className="mt-2">Loading regions...</p>
            </div>
          ) : regionsError ? (
            <div className="text-center py-12 text-red-500">
              <p>Error loading regions. Please try again later.</p>
            </div>
          ) : filteredRegions && filteredRegions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Countries
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRegions.map((region) => (
                    <tr key={region.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <CloudflareImageDisplay
                              imageId={region.image_id}
                              fallbackUrl={region.image_url || 'https://source.unsplash.com/random/100x100/?map'}
                              alt={region.name}
                              className="h-10 w-10 rounded-md object-cover"
                              variant="thumbnail"
                              width="40"
                              height="40"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{region.name}</div>
                            <div className="text-sm text-gray-500">{region.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {countries?.filter(country => country.region_id === region.id).length || 0} countries
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          region.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {region.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/destinations/regions/${region.id}/edit`}
                          className="text-teal hover:text-teal-dark mr-4"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/regions/${region.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No regions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'No regions match your search criteria.' : 'Get started by creating a new region.'}
              </p>
              <div className="mt-6">
                <Link
                  to="/admin/destinations/regions/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Region
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Countries list */}
      {activeTab === 'countries' && (
        <div className="bg-white shadow rounded-lg">
          {isLoadingCountries ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
              <p className="mt-2">Loading countries...</p>
            </div>
          ) : countriesError ? (
            <div className="text-center py-12 text-red-500">
              <p>Error loading countries. Please try again later.</p>
            </div>
          ) : filteredCountries && filteredCountries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Packages
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCountries.map((country) => (
                    <tr key={country.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <CloudflareImageDisplay
                              imageId={country.image_id}
                              fallbackUrl={country.image_url || 'https://source.unsplash.com/random/100x100/?flag'}
                              alt={country.name}
                              className="h-10 w-10 rounded-md object-cover"
                              variant="thumbnail"
                              width="40"
                              height="40"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{country.name}</div>
                            <div className="text-sm text-gray-500">{country.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{country.region?.name || 'No region'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{(country as any).package_count || 0} packages</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          country.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {country.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/destinations/countries/${country.id}/edit`}
                          className="text-teal hover:text-teal-dark mr-4"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/countries/${country.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No countries found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'No countries match your search criteria.' : 'Get started by creating a new country.'}
              </p>
              <div className="mt-6">
                <Link
                  to="/admin/destinations/countries/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Country
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default DestinationsListPage;
