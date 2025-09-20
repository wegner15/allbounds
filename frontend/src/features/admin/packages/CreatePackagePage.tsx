import React from 'react';
import PackageForm from './PackageForm';

const CreatePackagePage: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Package</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add a new vacation package to your catalog
        </p>
      </div>
      
      <PackageForm />
    </>
  );
};

export default CreatePackagePage;
