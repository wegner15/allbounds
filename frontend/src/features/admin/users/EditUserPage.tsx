import React from 'react';
import { useParams } from 'react-router-dom';
import UserForm from './UserForm';
import { useUser } from '../../../lib/hooks/useUsers';

const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id || '0');
  
  const { data: user, isLoading, error } = useUser(userId);
  
  if (isLoading) {
    return (
      <>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
          <p className="mt-2">Loading user data...</p>
        </div>
      </>
    );
  }
  
  if (error || !user) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <p>Error loading user data. The user may not exist or there was a problem with the server.</p>
          <p className="mt-2">
            <a href="/admin/users" className="text-red-700 underline">
              Return to users list
            </a>
          </p>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Edit User</h3>
        <p className="mt-1 text-sm text-gray-500">
          Update user details and permissions
        </p>
      </div>
      
      <UserForm userData={user} isEdit={true} />
    </>
  );
};

export default EditUserPage;
