import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PartnerForm from './PartnerForm';
import { usePartner, useUpdatePartner } from '../../../lib/hooks/usePartners';

const EditPartnerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const partnerId = id ? parseInt(id, 10) : 0;
  const navigate = useNavigate();

  const { data: partner, isLoading, error } = usePartner(partnerId);
  const updatePartnerMutation = useUpdatePartner();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await updatePartnerMutation.mutateAsync({ id: partnerId, ...data });
      toast.success('Partner updated successfully');
      navigate('/admin/partners');
    } catch (error) {
      console.error('Failed to update partner:', error);
      toast.error('Failed to update partner');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-gray-500 animate-pulse">Loading partner details...</p>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg">
          Failed to load partner details. It may not exist or has been deleted.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-charcoal">Edit Partner</h1>
        <p className="text-sm text-gray-500">Update details for {partner.name}</p>
      </div>

      <PartnerForm
        initialData={partner}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isEdit={true}
      />
    </div>
  );
};

export default EditPartnerPage;
