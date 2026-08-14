import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import SeoHead from '../../../components/seo/SeoHead';
import { useBlogs } from '../../../lib/hooks/useBlogs';
import { getCloudflareImageUrl } from '../../../utils/cloudflareImageUtils';

const BlogListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: blogs, isLoading, error } = useBlogs();

  const filteredBlogs = blogs?.filter(blog => 
    blog.is_published && 
    (blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     blog.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     blog.tags?.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase())))
  ) || [];
 
  const [visibleCount, setVisibleCount] = useState(6);
  const currentBlogs = filteredBlogs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredBlogs.length;
 
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  if (isLoading) {
    return (
      <>
      <SeoHead
        title="Blog"
        description="Discover amazing destinations, travel tips, and inspiring stories from around the world."
        canonicalPath="/blog"
      />
      <div className="min-h-screen bg-gray-50">
      <div className="fluid-container py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SeoHead
          title="Blog"
          description="Discover amazing destinations, travel tips, and inspiring stories from around the world."
          canonicalPath="/blog"
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to load blogs</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title="Blog"
        description="Discover amazing destinations, travel tips, and inspiring stories from around the world."
        canonicalPath="/blog"
      />
      <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="fluid-container py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Travel Stories & Insights
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Discover amazing destinations, travel tips, and inspiring stories from around the world.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="fluid-container py-12">
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2H7V8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No articles found' : 'No articles published yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Check back soon for new content!'}
            </p>
          </div>
        ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {currentBlogs.map((blog) => (
                <article key={blog.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  {blog.cover_image_id && (
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={getCloudflareImageUrl(blog.cover_image_id, 'medium')}
                        alt={blog.title}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <time dateTime={blog.created_at}>
                        {formatDate(blog.created_at)}
                      </time>
                      <span className="mx-2">•</span>
                      <span>{getReadTime(blog.content)}</span>
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      <Link
                        to={`/blog/${blog.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {blog.title}
                      </Link>
                    </h2>
 
                    {blog.summary && (
                      <div
                        className="text-gray-600 mb-4 overflow-hidden"
                        style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.summary) }}
                      />
                    )}
                    
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {blog.tags.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{blog.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    <Link
                      to={`/blog/${blog.slug}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      Read more
                      <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
 
        {/* Load More Button */}
        {hasMore && (
          <div className="mt-12 mb-16 flex justify-center">
            <button
              onClick={handleLoadMore}
              className="px-10 py-4 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl shadow-md hover:bg-blue-50 transition-all duration-300 active:scale-95"
            >
              Load More Articles
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default BlogListPage;
