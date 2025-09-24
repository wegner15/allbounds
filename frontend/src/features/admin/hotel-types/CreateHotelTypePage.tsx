import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import HotelTypeForm from './HotelTypeForm';
import { apiClient } from '../../../lib/api';

const CreateHotelTypePage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await apiClient.post('/hotel-types/', data);
      toast.success('Hotel type created successfully');
      navigate('/admin/hotel-types');
    } catch (error) {
      console.error('Error creating hotel type:', error);
      toast.error('Failed to create hotel type');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-playfair text-charcoal">Create Hotel Type</h1>
            <p className="mt-2 text-sm text-gray-600">
              Add a new hotel type to the system.
            </p>
          </div>
        </div>
        <div className="max-w-3xl">
          <div className="bg-white shadow-md rounded-lg border border-gray-100">
            <div className="px-6 py-8">
              <HotelTypeForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateHotelTypePage;
