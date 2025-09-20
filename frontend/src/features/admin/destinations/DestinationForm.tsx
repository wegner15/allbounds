import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRegion, useUpdateRegion } from '../../../lib/hooks/useDestinations';
import RegionForm from './RegionForm';
import CountryForm from './CountryForm';

interface DestinationFormProps {
  type: 'region' | 'country';
  destinationData?: any; // The destination data to edit, if any
  isEdit?: boolean;
}

const DestinationForm: React.FC<DestinationFormProps> = ({ type, destinationData, isEdit = false }) => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mutations
  const createRegionMutation = useCreateRegion();
  const updateRegionMutation = useUpdateRegion(destinationData?.id);
  
  // Handle region form submission
  const handleRegionSubmit = async (data: any) => {
    setIsSubmitting(true);
    setServerError(null);
    
    try {
      if (isEdit) {
        await updateRegionMutation.mutateAsync(data);
      } else {
        await createRegionMutation.mutateAsync(data);
      }
      
      navigate('/admin/destinations');
    } catch (error) {
      console.error('Error saving region:', error);
      setServerError('An error occurred while saving the region. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Country form handles its own submission
  
  // Render the appropriate form based on type
  if (type === 'region') {
    return (
      <RegionForm
        initialData={destinationData}
        isEdit={isEdit}
        onSubmit={handleRegionSubmit}
        isSubmitting={isSubmitting}
        serverError={serverError}
      />
    );
  } 
  
  return (
    <CountryForm
      countryData={destinationData}
      isEdit={isEdit}
    />
  );
};

export default DestinationForm;
