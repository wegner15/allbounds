import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePaginatedBlogs, useDeleteBlog, usePublishBlog, useUnpublishBlog, useFeatureBlog, useUnfeatureBlog } from '../../../lib/hooks/useBlogs';
import type { BlogPost } from '../../../lib/hooks/useBlogs';

const BlogsListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, error } = usePaginatedBlogs({
    page,
    limit,
    search: debouncedSearch || undefined,
    include_drafts: true,
  });

  const blogs = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || 0;

  const deleteBlogMutation = useDeleteBlog();
  const publishBlogMutation = usePublishBlog();
  const unpublishBlogMutation = useUnpublishBlog();
  const featureBlogMutation = useFeatureBlog();
  const unfeatureBlogMutation = useUnfeatureBlog();

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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600">Manage your travel stories, guides, and articles</p>
        </div>
        <Link
          to="/admin/blog/create"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
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
          placeholder="Search blog posts by title or summary..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white"
        />
      </div>

      {/* Blog Posts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading blog posts...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 m-4">
            <p className="text-red-800 text-sm">Error loading blog posts. Please try again.</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No blog posts found matching your criteria.</p>
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blogs.map((blog: BlogPost) => (
                  <tr key={blog.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                        {blog.slug && <div className="text-sm text-gray-500">{blog.slug}</div>}
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
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {blog.is_featured ? 'Featured' : 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
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

            {/* Pagination Bar */}
            {total > 0 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-semibold">{(page - 1) * limit + 1}</span> to{' '}
                      <span className="font-semibold">{Math.min(page * limit, total)}</span> of{' '}
                      <span className="font-semibold">{total}</span> posts
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Show</span>
                      <select
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setPage(1);
                        }}
                        className="border border-gray-300 rounded-md py-1 px-2 text-sm bg-white focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>per page</span>
                    </div>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                        if (
                          totalPages > 7 &&
                          pageNum !== 1 &&
                          pageNum !== totalPages &&
                          Math.abs(page - pageNum) > 1
                        ) {
                          if (Math.abs(page - pageNum) === 2) {
                            return (
                              <span
                                key={pageNum}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pageNum
                                ? 'z-10 bg-teal-600 border-teal-600 text-white font-bold'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsListPage;
