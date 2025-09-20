import React from 'react';
import { useParams } from 'react-router-dom';
import DestinationForm from './DestinationForm';
import { useRegion } from '../../../lib/hooks/useDestinations';

const EditRegionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const regionId = parseInt(id || '0');
  
  const { data: region, isLoading, error } = useRegion(regionId);
  
  if (isLoading) {
    return (
      <>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
          <p className="mt-2">Loading region data...</p>
        </div>
      </>
    );
  }
  
  if (error || !region) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <p>Error loading region data. The region may not exist or there was a problem with the server.</p>
          <p className="mt-2">
            <a href="/admin/destinations" className="text-red-700 underline">
              Return to destinations list
            </a>
          </p>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Region</h3>
        <p className="mt-1 text-sm text-gray-500">
          Update the details of this region
        </p>
      </div>
      
      <DestinationForm type="region" destinationData={region} isEdit={true} />
    </>
  );
};

export default EditRegionPage;
