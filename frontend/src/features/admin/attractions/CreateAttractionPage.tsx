import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AttractionForm from './AttractionForm';
import { useCreateAttraction } from '../../../lib/hooks/useAttractions';
import type { AttractionCreateInput, AttractionUpdateInput } from '../../../lib/hooks/useAttractions';

const CreateAttractionPage: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createAttraction, isPending } = useCreateAttraction();

  const handleSubmit = (data: AttractionCreateInput | AttractionUpdateInput) => {
    createAttraction(data as AttractionCreateInput, {
      onSuccess: () => {
        navigate('/admin/attractions');
      },
      onError: (error) => {
        console.error('Error creating attraction:', error);
      },
    });
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Create Attraction | AllBounds Admin</title>
      </Helmet>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Create New Attraction</h1>
      </div>

      <AttractionForm 
        onSubmit={handleSubmit} 
        isLoading={isPending} 
      />
    </div>
  );
};

export default CreateAttractionPage;
