import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCountries, useRegions } from '../../../lib/hooks/useDestinations';
import Button from '../../../components/ui/Button';
import FormInputWithIcon from '../../../components/ui/FormInputWithIcon';

const CountriesListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  const { data: countries, isLoading, error } = useCountries();
  const { data: regions } = useRegions();
  
  // Filter countries based on search query, region, and status
  const filteredCountries = countries?.filter(country => {
    const matchesSearch = 
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.region?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = regionFilter === 'all' || country.region_id === regionFilter;
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && country.is_active) || 
      (statusFilter === 'inactive' && !country.is_active);
    
    return matchesSearch && matchesRegion && matchesStatus;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Countries</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage countries for your travel offerings
          </p>
        </div>
        <Link to="/admin/destinations/countries/new">
          <Button variant="primary" size="md">
            <span className="flex items-center">
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Country
            </span>
          </Button>
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">
            Filter Countries
          </h2>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Search */}
            <div>
              <FormInputWithIcon
                id="search"
                type="text"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="filled"
                icon={
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                iconPosition="left"
              />
            </div>
            
            {/* Region filter */}
            <div>
              <label htmlFor="region-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Region
              </label>
              <select
                id="region-filter"
                className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-teal focus:border-teal rounded-md bg-gray-100"
                value={regionFilter === 'all' ? 'all' : regionFilter}
                onChange={(e) => setRegionFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              >
                <option value="all">All Regions</option>
                {regions?.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Status filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="status-filter"
                className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-teal focus:border-teal rounded-md bg-gray-100"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Countries list */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-teal"></div>
              <p className="mt-4 text-lg font-medium text-gray-700">Loading countries...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-red-800">Error Loading Countries</h3>
                <p className="mt-2 text-red-700">There was a problem loading the countries. Please try again later.</p>
              </div>
            </div>
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
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Packages
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCountries.map((country) => (
                  <tr key={country.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-md object-cover shadow-sm"
                            src={country.image_url || 'https://source.unsplash.com/random/100x100/?flag'}
                            alt={country.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{country.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {country.description.length > 100 
                              ? `${country.description.substring(0, 100)}...` 
                              : country.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                          {country.region?.name || 'No region'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        country.is_active 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {country.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {(country as any).package_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-3">
                        <Link
                          to={`/admin/destinations/countries/${country.id}/edit`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/countries/${country.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No countries found</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery || regionFilter !== 'all' || statusFilter !== 'all'
                ? 'No countries match your search criteria. Try adjusting your filters.'
                : 'Get started by creating a new country.'}
            </p>
            <div className="mt-6">
              <Link to="/admin/destinations/countries/new">
                <Button variant="primary" size="md">
                  <span className="flex items-center">
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Country
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountriesListPage;
