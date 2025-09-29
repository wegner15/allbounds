import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlogs, useDeleteBlog, usePublishBlog, useUnpublishBlog, useFeatureBlog, useUnfeatureBlog } from '../../../lib/hooks/useBlogs';
import type { BlogPost } from '../../../lib/hooks/useBlogs';

const BlogsListPage: React.FC = () => {
  const { data: blogs, isLoading, error } = useBlogs(true); // Include drafts for admin
  const deleteBlogMutation = useDeleteBlog();
  const publishBlogMutation = usePublishBlog();
  const unpublishBlogMutation = useUnpublishBlog();
  const featureBlogMutation = useFeatureBlog();
  const unfeatureBlogMutation = useUnfeatureBlog();
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlogMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting blog post:', error);
      }
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await publishBlogMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error publishing blog post:', error);
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await unpublishBlogMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error unpublishing blog post:', error);
    }
  };

  const handleFeature = async (id: number) => {
    try {
      await featureBlogMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error featuring blog post:', error);
    }
  };

  const handleUnfeature = async (id: number) => {
    try {
      await unfeatureBlogMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error unfeaturing blog post:', error);
    }
  };

  const filteredBlogs = (blogs as BlogPost[] || []).filter((blog: BlogPost) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading blog posts. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600">Manage your blog posts</p>
        </div>
        <Link
          to="/admin/blog/create"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Post
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search blog posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {/* Blog Posts List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredBlogs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No blog posts found.</p>
            <Link
              to="/admin/blog/create"
              className="inline-flex items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create your first blog post
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBlogs.map((blog: BlogPost) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {blog.title}
                        </div>
                        {blog.summary && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {blog.summary}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          blog.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {blog.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          blog.is_featured
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {blog.is_featured ? 'Featured' : 'Regular'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/admin/blog/edit/${blog.id}`}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        Edit
                      </Link>
                       {blog.is_published ? (
                         <button
                           onClick={() => handleUnpublish(blog.id)}
                           disabled={unpublishBlogMutation.isPending}
                           className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                         >
                           Unpublish
                         </button>
                       ) : (
                         <button
                           onClick={() => handlePublish(blog.id)}
                           disabled={publishBlogMutation.isPending}
                           className="text-green-600 hover:text-green-900 disabled:opacity-50"
                         >
                           Publish
                         </button>
                       )}
                       {blog.is_featured ? (
                         <button
                           onClick={() => handleUnfeature(blog.id)}
                           disabled={unfeatureBlogMutation.isPending}
                           className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                         >
                           Unfeature
                         </button>
                       ) : (
                         <button
                           onClick={() => handleFeature(blog.id)}
                           disabled={featureBlogMutation.isPending}
                           className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                         >
                           Feature
                         </button>
                       )}
                       <button
                         onClick={() => handleDelete(blog.id)}
                         disabled={deleteBlogMutation.isPending}
                         className="text-red-600 hover:text-red-900 disabled:opacity-50"
                       >
                         Delete
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsListPage;
