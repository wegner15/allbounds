import React from 'react';
import GroupTripForm from './GroupTripForm';

const CreateGroupTripPage: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Group Trip</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add a new group trip to your travel offerings
        </p>
      </div>
      
      <GroupTripForm />
    </>
  );
};

export default CreateGroupTripPage;
