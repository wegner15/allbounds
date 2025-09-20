import React from 'react';
import { useNavigate } from 'react-router-dom';
import BlogForm from './BlogForm';
import { useCreateBlog } from '../../../lib/hooks/useBlogs';
import type { BlogPostCreateInput, BlogPostUpdateInput } from '../../../lib/hooks/useBlogs';

const CreateBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const createBlogMutation = useCreateBlog();

  const handleSubmit = async (data: BlogPostCreateInput | BlogPostUpdateInput) => {
    try {
      await createBlogMutation.mutateAsync(data as BlogPostCreateInput);
      navigate('/admin/blog');
    } catch (error) {
      console.error('Error creating blog post:', error);
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
      />
    </div>
  );
};

export default CreateBlogPage;
