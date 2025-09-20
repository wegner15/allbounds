import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BlogForm from './BlogForm';
import { useBlog, useUpdateBlog } from '../../../lib/hooks/useBlogs';
import type { BlogPost, BlogPostUpdateInput } from '../../../lib/hooks/useBlogs';

const EditBlogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const blogId = parseInt(id || '0');
  
  const { data: blog, isLoading: isFetching, error } = useBlog(blogId);
  const updateBlogMutation = useUpdateBlog();

  const handleSubmit = async (data: BlogPostUpdateInput) => {
    try {
      await updateBlogMutation.mutateAsync({ id: blogId, data });
      navigate('/admin/blog');
    } catch (error) {
      console.error('Error updating blog post:', error);
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
      />
    </div>
  );
};

export default EditBlogPage;
