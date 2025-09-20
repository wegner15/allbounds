import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import HotelForm from './HotelForm';
import { useHotel, useUpdateHotel } from '../../../lib/hooks/useHotels';
import type { HotelUpdateInput } from '../../../lib/hooks/useHotels';

const EditHotelPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const hotelId = parseInt(id || '0');
  const navigate = useNavigate();
  
  const { data: hotel, isLoading: isLoadingHotel, error } = useHotel(hotelId);
  const { mutate: updateHotel, isPending: isUpdating } = useUpdateHotel();

  const handleSubmit = (data: HotelUpdateInput) => {
    updateHotel(
      { id: hotelId, ...data },
      {
        onSuccess: () => {
          navigate('/admin/hotels');
        },
        onError: (error) => {
          console.error('Error updating hotel:', error);
        },
      }
    );
  };

  if (isLoadingHotel) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="spinner"></div>
        <p className="ml-2">Loading hotel data...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        Error loading hotel data. Please try again or go back to the hotels list.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Edit Hotel | AllBounds Admin</title>
      </Helmet>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Edit Hotel: {hotel.name}</h1>
      </div>

      <HotelForm 
        initialData={hotel}
        onSubmit={handleSubmit} 
        isLoading={isUpdating} 
      />
    </div>
  );
};

export default EditHotelPage;
