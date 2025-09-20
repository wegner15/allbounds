import React from 'react';
import CountryForm from './CountryForm';

const CreateCountryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Country</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new country to your destinations catalog
          </p>
        </div>
      </div>
      
      <CountryForm />
    </div>
  );
};

export default CreateCountryPage;
