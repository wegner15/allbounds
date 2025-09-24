import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import HotelTypeForm from './HotelTypeForm';
import { apiClient } from '../../../lib/api';

interface HotelType {
  id: number;
  name: string;
  description: string;
  slug: string;
  is_active: boolean;
}

const EditHotelTypePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hotelType, setHotelType] = useState<HotelType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotelType = async () => {
      try {
        const response = await apiClient.get<HotelType>(`/hotel-types/${id}`);
        setHotelType(response as HotelType);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hotel type:', error);
        toast.error('Failed to fetch hotel type');
        setLoading(false);
      }
    };

    fetchHotelType();
  }, [id]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await apiClient.put(`/hotel-types/${id}`, data);
      toast.success('Hotel type updated successfully');
      navigate('/admin/hotel-types');
    } catch (error) {
      console.error('Error updating hotel type:', error);
      toast.error('Failed to update hotel type');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-32">
          <div className="animate-pulse text-charcoal">Loading...</div>
        </div>
      </div>
    );
  }

  if (!hotelType) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          Hotel type not found
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-playfair text-charcoal">Edit Hotel Type</h1>
            <p className="mt-2 text-sm text-gray-600">
              Update the hotel type information.
            </p>
          </div>
        </div>
        <div className="max-w-3xl">
          <div className="bg-white shadow-md rounded-lg border border-gray-100">
            <div className="px-6 py-8">
              <HotelTypeForm
                initialData={hotelType}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditHotelTypePage;
