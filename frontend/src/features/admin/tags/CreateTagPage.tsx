import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import TagForm from './TagForm';
import { useCreateContentTag } from '../../../lib/hooks/useContentTags';

const CreateTagPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateContentTag();

  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Tag created successfully!');
      navigate('/admin/tags');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create tag.');
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-playfair text-charcoal">Create New Tag</h1>
            <p className="mt-2 text-sm text-gray-600">
              Tags are shared across all content types (Packages, Hotels, Activities, etc.) and power dynamic filters.
            </p>
          </div>
        </div>
        <div className="max-w-2xl">
          <div className="bg-white shadow-md rounded-lg border border-gray-100 px-6 py-8">
            <TagForm
              onSubmit={handleSubmit}
              isSubmitting={createMutation.isPending}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTagPage;
