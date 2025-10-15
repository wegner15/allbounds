import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AmenityForm from './AmenityForm';
import { useCreateAmenity } from '../../../lib/hooks/useAmenities';
import type { AmenityCreate } from '../../../lib/types/api';

const CreateAmenityPage: React.FC = () => {
  const navigate = useNavigate();
  const createAmenity = useCreateAmenity();

  const handleSubmit = async (data: AmenityCreate) => {
    try {
      await createAmenity.mutateAsync(data);
      toast.success('Amenity created successfully');
      navigate('/admin/amenities');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to create amenity');
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-playfair text-charcoal">Create Amenity</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add a new amenity that can be assigned to hotels.
        </p>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <AmenityForm
          onSubmit={handleSubmit}
          isSubmitting={createAmenity.isPending}
        />
      </div>
    </div>
  );
};

export default CreateAmenityPage;
