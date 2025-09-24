import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ExclusionForm from './ExclusionForm';
import { apiClient } from '../../../lib/api';

interface Exclusion {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  is_active: boolean;
}

const EditExclusionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [exclusion, setExclusion] = useState<Exclusion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExclusion = async () => {
      try {
        const response = await apiClient.get<Exclusion>(`/exclusions/${id}`);
        setExclusion(response as Exclusion);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exclusion:', error);
        toast.error('Failed to fetch exclusion');
        setLoading(false);
      }
    };

    fetchExclusion();
  }, [id]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await apiClient.put(`/exclusions/${id}`, data);
      toast.success('Exclusion updated successfully');
      navigate('/admin/exclusions');
    } catch (error) {
      console.error('Error updating exclusion:', error);
      toast.error('Failed to update exclusion');
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

  if (!exclusion) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          Exclusion not found
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-playfair text-charcoal">Edit Exclusion</h1>
            <p className="mt-2 text-sm text-gray-600">
              Update the exclusion information.
            </p>
          </div>
        </div>
        <div className="max-w-3xl">
          <div className="bg-white shadow-md rounded-lg border border-gray-100">
            <div className="px-6 py-8">
              <ExclusionForm
                initialData={exclusion}
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

export default EditExclusionPage;
