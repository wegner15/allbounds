import React from 'react';
import DestinationForm from './DestinationForm';

const CreateRegionPage: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Region</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add a new region to your destinations catalog
        </p>
      </div>
      
      <DestinationForm type="region" />
    </>
  );
};

export default CreateRegionPage;
