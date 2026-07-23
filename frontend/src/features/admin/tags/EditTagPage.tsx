import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import TagForm from './TagForm';
import { useContentTag, useUpdateContentTag } from '../../../lib/hooks/useContentTags';

const EditTagPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const tagId = Number(id);
  const navigate = useNavigate();

  const { data: tag, isLoading, error } = useContentTag(tagId);
  const updateMutation = useUpdateContentTag(tagId);

  const handleSubmit = async (data: any) => {
    try {
      await updateMutation.mutateAsync(data);
      toast.success('Tag updated successfully!');
      navigate('/admin/tags');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update tag.');
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="animate-pulse text-charcoal">Loading tag...</div>
      </div>
    );
  }

  if (error || !tag) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Tag not found or failed to load.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-playfair text-charcoal">Edit Tag: {tag.name}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Update the details for this content tag.
            </p>
          </div>
        </div>
        <div className="max-w-2xl">
          <div className="bg-white shadow-md rounded-lg border border-gray-100 px-6 py-8">
            <TagForm
              initialData={tag}
              onSubmit={handleSubmit}
              isSubmitting={updateMutation.isPending}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTagPage;
