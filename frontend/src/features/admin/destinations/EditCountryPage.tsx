import React from 'react';
import { useParams, Link } from 'react-router-dom';
import CountryForm from './CountryForm';
import { useCountry } from '../../../lib/hooks/useDestinations';
import Button from '../../../components/ui/Button';

const EditCountryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const countryId = parseInt(id || '0');
  
  const isQueryEnabled = !isNaN(countryId) && countryId > 0;
  const { data: country, isLoading, error } = useCountry(countryId, isQueryEnabled);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-3 border-b-3 border-teal"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading country data...</p>
        </div>
      </div>
    );
  }
  
  if (!isQueryEnabled) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-red-800">Invalid Country ID</h3>
        <p className="mt-2 text-red-700">The ID in the URL is not a valid number. Please check the URL and try again.</p>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-red-800">Error Loading Country</h3>
            <p className="mt-2 text-red-700">The country may not exist or there was a problem with the server.</p>
            <div className="mt-4">
              <Link to="/admin/destinations">
                <Button variant="outline" size="md">
                  <span className="flex items-center">
                    <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Return to Destinations List
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Country: {country.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update the details of this country
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to={`/admin/countries/${country.id}/visit-info`}>
            <Button variant="secondary" size="md">
              <span className="flex items-center">
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                Manage Visit Friendliness
              </span>
            </Button>
          </Link>
        </div>
      </div>
      
      <CountryForm countryData={country} isEdit={true} />
    </div>
  );
};

export default EditCountryPage;
