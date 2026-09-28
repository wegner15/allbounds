import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BlogForm from './BlogForm';
import { useBlog, useUpdateBlog } from '../../../lib/hooks/useBlogs';
import type { BlogPost, BlogPostUpdateInput } from '../../../lib/hooks/useBlogs';

const EditBlogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const blogId = parseInt(id || '0');
  
  const { data: blog, isLoading: isFetching, error } = useBlog(blogId);
  const updateBlogMutation = useUpdateBlog();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: BlogPostUpdateInput) => {
    try {
      setSubmitError(null);
      await updateBlogMutation.mutateAsync({ id: blogId, data });
      toast.success('Blog post updated successfully!');
      navigate('/admin/blog');
    } catch (err: any) {
      console.error('Error updating blog post:', err);
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to update blog post. Please check the details and try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading blog post. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
        <p className="text-gray-600">Update your blog post</p>
      </div>

      <BlogForm
        initialData={blog as BlogPost}
        onSubmit={handleSubmit}
        isLoading={updateBlogMutation.isPending}
        error={submitError}
        onClearError={() => setSubmitError(null)}
      />
    </div>
  );
};

export default EditBlogPage;
