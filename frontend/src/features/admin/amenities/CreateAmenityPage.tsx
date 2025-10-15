import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AmenityForm from './AmenityForm';
import { useCreateAmenity } from '../../../lib/hooks/useAmenities';
import ErrorAlert from '../../../components/ui/ErrorAlert';
import type { AmenityCreate } from '../../../lib/types/api';

const CreateAmenityPage: React.FC = () => {
  const navigate = useNavigate();
  const createAmenity = useCreateAmenity();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: AmenityCreate) => {
    setError(null);
    try {
      await createAmenity.mutateAsync(data);
      toast.success('Amenity created successfully');
      navigate('/admin/amenities');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to create amenity. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
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
      
      {error && (
        <div className="mb-6">
          <ErrorAlert
            title="Error creating amenity"
            message={error}
            onDismiss={() => setError(null)}
          />
        </div>
      )}
      
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
