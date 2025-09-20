import React from 'react';
import { useParams } from 'react-router-dom';
import PackageForm from './PackageForm';
import { usePackageDetailsById } from '../../../lib/hooks/usePackages';

const EditPackagePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const packageId = parseInt(id || '0');
  
  const { data: packageData, isLoading, error } = usePackageDetailsById(packageId);
  
  if (isLoading) {
    return (
      <>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
          <p className="mt-2">Loading package data...</p>
        </div>
      </>
    );
  }
  
  if (error || !packageData) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <p>Error loading package data. The package may not exist or there was a problem with the server.</p>
          <p className="mt-2">
            <a href="/admin/packages" className="text-red-700 underline">
              Return to packages list
            </a>
          </p>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Package</h3>
        <p className="mt-1 text-sm text-gray-500">
          Update the details of this vacation package
        </p>
      </div>
      
      <PackageForm packageData={packageData} isEdit={true} />
    </>
  );
};

export default EditPackagePage;
