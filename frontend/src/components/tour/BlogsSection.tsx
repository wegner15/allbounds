import React from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../../lib/types/api';
import { BookOpen, ArrowRight, Calendar } from 'lucide-react';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

interface BlogsSectionProps {
  blogs: BlogPost[];
  showViewAll?: boolean;
}

const BlogsSection: React.FC<BlogsSectionProps> = ({ 
  blogs, 
  showViewAll = true 
}) => {
  // Don't render if no blogs
  if (!blogs || blogs.length === 0) {
    return null;
  }

  return (
    <section id="blogs" className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-white to-gray-50 scroll-mt-20" aria-labelledby="blogs-heading">
      <div className="container mx-auto px-0">
        {/* Section Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 px-4">
          <div className="mb-4 sm:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg" aria-hidden="true">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 id="blogs-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal font-playfair">
                Related Travel Stories & Guides
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 font-medium ml-13 sm:ml-15">
              Read in-depth guides, expert travel tips, and stories related to this tour
            </p>
          </div>

          {/* View All Link - Desktop */}
          {showViewAll && (
            <Link
              to="/blog"
              className="hidden md:flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors group touch-manipulation min-h-[44px]"
            >
              View All Articles
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </header>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4" role="list" aria-label="Related blog articles">
          {blogs.map((blog) => (
            <article 
              key={blog.id} 
              role="listitem"
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col hover:-translate-y-1"
            >
              <Link to={`/blog/${blog.slug}`} className="block relative h-52 sm:h-56 overflow-hidden bg-gray-100">
                <img
                  src={getImageUrlWithFallback(
                    blog.cover_image_id || (blog as any).cover_image_url,
                    IMAGE_VARIANTS.MEDIUM,
                    '/home-heros/hero2.webp'
                  )}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  {blog.created_at && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                  <Link to={`/blog/${blog.slug}`}>
                    <h3 className="text-lg sm:text-xl font-bold font-playfair text-charcoal group-hover:text-primary transition-colors line-clamp-2 mb-2.5">
                      {blog.title}
                    </h3>
                  </Link>
                  {blog.summary && (
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                      {blog.summary}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:text-primary-dark transition-colors"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile View All Link */}
        {showViewAll && (
          <div className="md:hidden mt-6 sm:mt-8 text-center px-4">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark active:text-primary-dark font-medium transition-colors px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 touch-manipulation min-h-[44px]"
            >
              View All Articles
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogsSection;
