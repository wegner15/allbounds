import React from 'react';
import { useParams } from 'react-router-dom';
import HolidayTypeForm from './HolidayTypeForm';
import { useHolidayType } from '../../../lib/hooks/useHolidayTypes';

const EditHolidayTypePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const holidayTypeId = parseInt(id || '0');
  
  const { data: holidayType, isLoading, error } = useHolidayType(holidayTypeId);
  
  if (isLoading) {
    return (
      <>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
          <p className="mt-2">Loading holiday type data...</p>
        </div>
      </>
    );
  }
  
  if (error || !holidayType) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <p>Error loading holiday type data. The holiday type may not exist or there was a problem with the server.</p>
          <p className="mt-2">
            <a href="/admin/holiday-types" className="text-red-700 underline">
              Return to holiday types list
            </a>
          </p>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Holiday Type</h3>
        <p className="mt-1 text-sm text-gray-500">
          Update the details of this holiday type
        </p>
      </div>
      
      <HolidayTypeForm holidayTypeData={holidayType} isEdit={true} />
    </>
  );
};

export default EditHolidayTypePage;
