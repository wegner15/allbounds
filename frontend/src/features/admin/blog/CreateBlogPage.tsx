import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BlogForm from './BlogForm';
import { useCreateBlog } from '../../../lib/hooks/useBlogs';
import type { BlogPostCreateInput, BlogPostUpdateInput } from '../../../lib/hooks/useBlogs';

const CreateBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const createBlogMutation = useCreateBlog();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: BlogPostCreateInput | BlogPostUpdateInput) => {
    try {
      setError(null);
      await createBlogMutation.mutateAsync(data as BlogPostCreateInput);
      toast.success('Blog post published successfully!');
      navigate('/admin/blog');
    } catch (err: any) {
      console.error('Error creating blog post:', err);
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to create blog post. Please check the details and try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
        <p className="text-gray-600">Write and publish a new blog post</p>
      </div>

      <BlogForm
        onSubmit={handleSubmit}
        isLoading={createBlogMutation.isPending}
        error={error}
        onClearError={() => setError(null)}
      />
    </div>
  );
};

export default CreateBlogPage;

