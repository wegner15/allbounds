import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AttractionForm from './AttractionForm';
import { useAttraction, useUpdateAttraction } from '../../../lib/hooks/useAttractions';
import type { AttractionUpdateInput } from '../../../lib/hooks/useAttractions';

const EditAttractionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const attractionId = parseInt(id || '0');
  const navigate = useNavigate();
  
  const { data: attraction, isLoading: isLoadingAttraction, error } = useAttraction(attractionId);
  const { mutate: updateAttraction, isPending: isUpdating } = useUpdateAttraction();

  const handleSubmit = (data: AttractionUpdateInput) => {
    updateAttraction(
      { id: attractionId, ...data },
      {
        onSuccess: () => {
          navigate('/admin/attractions');
        },
        onError: (error) => {
          console.error('Error updating attraction:', error);
        },
      }
    );
  };

  if (isLoadingAttraction) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="spinner"></div>
        <p className="ml-2">Loading attraction data...</p>
      </div>
    );
  }

  if (error || !attraction) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        Error loading attraction data. Please try again or go back to the attractions list.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Edit Attraction | AllBounds Admin</title>
      </Helmet>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Edit Attraction: {attraction.name}</h1>
      </div>

      <AttractionForm 
        initialData={attraction}
        onSubmit={handleSubmit} 
        isLoading={isUpdating} 
      />
    </div>
  );
};

export default EditAttractionPage;
