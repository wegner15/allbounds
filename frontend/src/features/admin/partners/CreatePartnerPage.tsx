import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PartnerForm from './PartnerForm';
import { useCreatePartner } from '../../../lib/hooks/usePartners';

const CreatePartnerPage: React.FC = () => {
  const navigate = useNavigate();
  const createPartnerMutation = useCreatePartner();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createPartnerMutation.mutateAsync(data);
      toast.success('Partner created successfully');
      navigate('/admin/partners');
    } catch (error) {
      console.error('Failed to create partner:', error);
      toast.error('Failed to create partner');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-charcoal">Add Partner</h1>
        <p className="text-sm text-gray-500">Add a new partner or affiliation to the website display.</p>
      </div>

      <PartnerForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CreatePartnerPage;
