import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AmenityForm from './AmenityForm';
import { useAmenity, useUpdateAmenity } from '../../../lib/hooks/useAmenities';
import type { AmenityUpdate } from '../../../lib/types/api';

const EditAmenityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const amenityId = id ? parseInt(id, 10) : undefined;
  
  const { data: amenity, isLoading } = useAmenity(amenityId);
  const updateAmenity = useUpdateAmenity();

  const handleSubmit = async (data: AmenityUpdate) => {
    if (!amenityId) return;
    
    try {
      await updateAmenity.mutateAsync({ id: amenityId, data });
      toast.success('Amenity updated successfully');
      navigate('/admin/amenities');
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to update amenity');
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="p-8 text-center">
          <div className="animate-pulse text-charcoal">Loading...</div>
        </div>
      </div>
    );
  }

  if (!amenity) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="p-8 text-center bg-red-50 border border-red-200 rounded-md text-red-700">
          Amenity not found
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-playfair text-charcoal">Edit Amenity</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update amenity details.
        </p>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <AmenityForm
          initialData={amenity}
          onSubmit={handleSubmit}
          isSubmitting={updateAmenity.isPending}
        />
      </div>
    </div>
  );
};

export default EditAmenityPage;
