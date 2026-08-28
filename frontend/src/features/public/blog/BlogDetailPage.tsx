import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import SeoHead from '../../../components/seo/SeoHead';
import { RichTextDisplay } from '../../../components/ui/RichTextDisplay';
import { useBlogBySlug as useBlog, useRelatedBlogs } from '../../../lib/hooks/useBlogs';
import { getCloudflareImageUrl } from '../../../utils/cloudflareImageUtils';

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);
  const { data: blog, isLoading, error } = useBlog(slug!);
  const { data: relatedBlogs, isLoading: relatedLoading } = useRelatedBlogs(blog?.id);

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

  const pageTitle = blog?.title || 'Article not found';
  const pageDescription = blog?.summary
    ? blog.summary.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
    : blog?.content
      ? blog.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
      : 'Travel stories, destination insights, and helpful travel tips from Allbound Vacations.';
  const pageImage = blog?.cover_image_id ? getCloudflareImageUrl(blog.cover_image_id, 'large') : undefined;

  const cleanHtmlContent = (html: string) => {
    // Remove TinyMCE data attributes that are not needed for display
    const cleaned = html.replace(/ data-start="[^"]*"/g, '').replace(/ data-end="[^"]*"/g, '');
    // Sanitize the HTML content
    return DOMPurify.sanitize(cleaned, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'hr'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'style']
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog || !blog.is_published) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h2>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/blog"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        canonicalPath={`/blog/${blog.slug}`}
        image={pageImage}
        type="article"
      />
      <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/" className="text-gray-400 hover:text-gray-500">
                  <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span className="sr-only">Home</span>
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link to="/blog" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Blog
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500" aria-current="page">
                    {blog.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-playfair text-gray-900 mb-3 tracking-tight leading-tight">
            {blog.title}
          </h1>
          
          {blog.summary && (
            <div className="text-xl text-gray-600 mb-6">
              <RichTextDisplay content={blog.summary} />
            </div>
          )}
          
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <div className="flex items-center text-sm text-gray-500">
              <time dateTime={blog.created_at}>
                {formatDate(blog.created_at)}
              </time>
              <span className="mx-2">•</span>
              <span>{getReadTime(blog.content)}</span>
              {blog.updated_at !== blog.created_at && (
                <>
                  <span className="mx-2">•</span>
                  <span>Updated {formatDate(blog.updated_at)}</span>
                </>
              )}
            </div>
            
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Cover Image */}
        {blog.cover_image_id && (
          <div className="mb-8">
            <img
              src={getCloudflareImageUrl(blog.cover_image_id, 'large')}
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-sm"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: cleanHtmlContent(blog.content) }}
        />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Link
              to="/blog"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <svg className="mr-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to all articles
            </Link>
            
             <div className="flex items-center space-x-4">
               <span className="text-sm text-gray-500">Share:</span>
               <div className="flex items-center space-x-2">
                 {/* Facebook */}
                 <a
                   href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-gray-400 hover:text-blue-600 transition-colors"
                   title="Share on Facebook"
                 >
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                   </svg>
                 </a>

                 {/* Twitter */}
                 <a
                   href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-gray-400 hover:text-blue-400 transition-colors"
                   title="Share on Twitter"
                 >
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                   </svg>
                 </a>

                 {/* LinkedIn */}
                 <a
                   href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-gray-400 hover:text-blue-700 transition-colors"
                   title="Share on LinkedIn"
                 >
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                   </svg>
                 </a>

                 {/* Copy Link */}
                 <button
                   onClick={async () => {
                     try {
                       await navigator.clipboard.writeText(window.location.href);
                       setCopied(true);
                       setTimeout(() => setCopied(false), 2500);
                      } catch {
                        // Fallback for older browsers
                        const textArea = document.createElement('textarea');
                        textArea.value = window.location.href;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2500);
                      }
                   }}
                   className="text-gray-400 hover:text-gray-600 transition-colors relative flex items-center gap-1.5"
                   title="Copy link"
                 >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                   </svg>
                   {copied && (
                     <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap animate-in fade-in duration-200">
                       Copied!
                     </span>
                   )}
                 </button>
               </div>
             </div>
          </div>
        </footer>
      </article>

      {/* Related Articles */}
      {relatedBlogs && relatedBlogs.length > 0 && !relatedLoading && (
        <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {relatedBlogs.map((relatedBlog) => (
              <article key={relatedBlog.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <Link to={`/blog/${relatedBlog.slug}`} className="block">
                   {relatedBlog.cover_image_id && (
                     <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                       <img
                         src={getCloudflareImageUrl(relatedBlog.cover_image_id, 'medium')}
                         alt={relatedBlog.title}
                         className="w-full h-48 object-cover"
                         loading="lazy"
                       />
                     </div>
                   )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {relatedBlog.title}
                    </h3>
                    {relatedBlog.summary && (
                      <div
                        className="text-gray-600 text-sm mb-4 overflow-hidden"
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(relatedBlog.summary) }}
                      />
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <time dateTime={relatedBlog.created_at}>
                        {formatDate(relatedBlog.created_at)}
                      </time>
                      <span className="mx-2">•</span>
                      <span>{getReadTime(relatedBlog.content)} read</span>
                    </div>
                    {relatedBlog.tags && relatedBlog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {relatedBlog.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
      </div>
    </>
  );
};

export default BlogDetailPage;
