import React from 'react';
import UserForm from './UserForm';

const CreateUserPage: React.FC = () => {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Create New User</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add a new user to the system
        </p>
      </div>
      
      <UserForm />
    </>
  );
};

export default CreateUserPage;
