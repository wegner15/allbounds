import React from 'react';
import HolidayTypeForm from './HolidayTypeForm';

const CreateHolidayTypePage: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Holiday Type</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add a new holiday type to your travel offerings
        </p>
      </div>
      
      <HolidayTypeForm />
    </>
  );
};

export default CreateHolidayTypePage;
