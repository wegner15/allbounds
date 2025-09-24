import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import InclusionForm from './InclusionForm';
import { apiClient } from '../../../lib/api';

const CreateInclusionPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await apiClient.post('/inclusions/', data);
      toast.success('Inclusion created successfully');
      navigate('/admin/inclusions');
    } catch (error) {
      console.error('Error creating inclusion:', error);
      toast.error('Failed to create inclusion');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-playfair text-charcoal">Create Inclusion</h1>
            <p className="mt-2 text-sm text-gray-600">
              Add a new inclusion that can be assigned to packages and group trips.
            </p>
          </div>
        </div>
        <div className="max-w-3xl">
          <div className="bg-white shadow-md rounded-lg border border-gray-100">
            <div className="px-6 py-8">
              <InclusionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateInclusionPage;
