import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import InclusionForm from './InclusionForm';
import { apiClient } from '../../../lib/api';

interface Inclusion {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  is_active: boolean;
}

const EditInclusionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [inclusion, setInclusion] = useState<Inclusion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInclusion = async () => {
      try {
        const response = await apiClient.get<Inclusion>(`/inclusions/${id}`);
        setInclusion(response as Inclusion);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inclusion:', error);
        toast.error('Failed to fetch inclusion');
        setLoading(false);
      }
    };

    fetchInclusion();
  }, [id]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await apiClient.put(`/inclusions/${id}`, data);
      toast.success('Inclusion updated successfully');
      navigate('/admin/inclusions');
    } catch (error) {
      console.error('Error updating inclusion:', error);
      toast.error('Failed to update inclusion');
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

  if (!inclusion) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          Inclusion not found
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-playfair text-charcoal">Edit Inclusion</h1>
            <p className="mt-2 text-sm text-gray-600">
              Update the inclusion information.
            </p>
          </div>
        </div>
        <div className="max-w-3xl">
          <div className="bg-white shadow-md rounded-lg border border-gray-100">
            <div className="px-6 py-8">
              <InclusionForm
                initialData={inclusion}
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

export default EditInclusionPage;
