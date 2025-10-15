import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import AttractionForm from './AttractionForm';
import { useCreateAttraction } from '../../../lib/hooks/useAttractions';
import type { AttractionCreateInput, AttractionUpdateInput } from '../../../lib/hooks/useAttractions';

const CreateAttractionPage: React.FC = () => {
  const navigate = useNavigate();
  const { mutate: createAttraction, isPending } = useCreateAttraction();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (data: AttractionCreateInput | AttractionUpdateInput) => {
    setError(null);
    createAttraction(data as AttractionCreateInput, {
      onSuccess: () => {
        toast.success('Attraction created successfully!');
        navigate('/admin/attractions');
      },
      onError: (error: any) => {
        console.error('Error creating attraction:', error);
        const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to create attraction. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
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

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error creating attraction</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-400 hover:text-red-500"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <AttractionForm 
        onSubmit={handleSubmit} 
        isLoading={isPending} 
      />
    </div>
  );
};

export default CreateAttractionPage;
