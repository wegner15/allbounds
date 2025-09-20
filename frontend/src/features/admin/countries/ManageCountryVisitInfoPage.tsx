import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import CountryVisitInfoEditor from './CountryVisitInfoEditor';
import type { Country } from '../../../lib/types/api';

const ManageCountryVisitInfoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const countryId = parseInt(id || '0', 10);
  
  const { data: country, isLoading, error } = useQuery<Country>({
    queryKey: ['country', countryId],
    queryFn: () => apiClient.get<Country>(endpoints.countries.byId(countryId)),
    enabled: !!countryId && countryId > 0,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>Error loading country. Please try again later.</p>
          <Link to="/admin/countries" className="text-red-700 underline mt-2 inline-block">
            Back to Countries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          Manage Visit Information: {country.name}
        </h1>
        <Link
          to="/admin/countries"
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
        >
          Back to Countries
        </Link>
      </div>
      
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-medium mb-2">Country Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Name:</span> {country.name}</p>
            <p><span className="font-medium">Region:</span> {country.region?.name}</p>
            {country.capital && <p><span className="font-medium">Capital:</span> {country.capital}</p>}
          </div>
          <div>
            {country.language && <p><span className="font-medium">Language:</span> {country.language}</p>}
            {country.currency && <p><span className="font-medium">Currency:</span> {country.currency}</p>}
            {country.timezone && <p><span className="font-medium">Timezone:</span> {country.timezone}</p>}
          </div>
        </div>
      </div>
      
      <CountryVisitInfoEditor countryId={countryId} />
    </div>
  );
};

export default ManageCountryVisitInfoPage;
