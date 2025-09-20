import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import HotelForm from './HotelForm';
import { useCreateHotel } from '../../../lib/hooks/useHotels';
import type { HotelCreateInput, HotelUpdateInput } from '../../../lib/hooks/useHotels';

const CreateHotelPage: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createHotel, isPending } = useCreateHotel();

  const handleSubmit = (data: HotelCreateInput | HotelUpdateInput) => {
    createHotel(data as HotelCreateInput, {
      onSuccess: () => {
        navigate('/admin/hotels');
      },
      onError: (error) => {
        console.error('Error creating hotel:', error);
      },
    });
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Create Hotel | AllBounds Admin</title>
      </Helmet>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Create New Hotel</h1>
      </div>

      <HotelForm 
        onSubmit={handleSubmit} 
        isLoading={isPending} 
      />
    </div>
  );
};

export default CreateHotelPage;
