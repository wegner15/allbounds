import React from 'react';
import { Link } from 'react-router-dom';
import { useInspirationArticles } from '../../hooks/useInspirationArticles';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';

const InspirationForNextTrip: React.FC = () => {
  const { data: articles, isLoading, error } = useInspirationArticles();

  const renderMainSkeletons = () =>
    [...Array(2)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="relative h-72 rounded-xl overflow-hidden bg-gray-200" />
        <div className="h-5 bg-gray-200 rounded w-3/4 mt-3" />
      </div>
    ));

  const renderSideSkeletons = () =>
    [...Array(2)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 animate-pulse">
        <div className="w-24 h-24 rounded-xl bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    ));

  const mainArticles = articles?.slice(0, 2) || [];
  const sideArticles = articles?.slice(2, 4) || [];

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-playfair font-bold text-charcoal">
              Get inspiration for your next trip
            </h2>
            <p className="text-charcoal/60 font-lato mt-1">Travel articles to ignite your wanderlust.</p>
          </div>
          <Link
            to="/blog"
            className="text-primary hover:text-primary-dark flex items-center font-medium transition-colors"
          >
            More articles
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {error && <div className="text-center text-red-500 mb-6">Failed to load articles.</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Articles — image with gradient overlay containing the title */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading
              ? renderMainSkeletons()
              : mainArticles.map(article => (
                  <Link key={article.id} to={`/blog/${article.slug}`} className="block group">
                    {/* Image container with overlay — text is INSIDE the overlay, not bare on image */}
                    <div className="relative h-72 rounded-xl overflow-hidden shadow-md">
                      <img
                        src={getImageUrlWithFallback(
                          article.cover_image_id,
                          IMAGE_VARIANTS.MEDIUM,
                          'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80'
                        )}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Dark gradient overlay — text sits clearly on top */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                      {/* Title text pinned to the bottom of the overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-playfair font-bold text-lg leading-snug drop-shadow-sm line-clamp-2 group-hover:text-primary-light transition-colors">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>

          {/* Side Articles — thumbnail + title, no image-text overlap */}
          <div className="space-y-5">
            {isLoading
              ? renderSideSkeletons()
              : sideArticles.map(article => (
                  <Link
                    key={article.id}
                    to={`/blog/${article.slug}`}
                    className="flex items-center gap-4 group"
                  >
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
                      <img
                        src={getImageUrlWithFallback(
                          article.cover_image_id,
                          IMAGE_VARIANTS.THUMBNAIL,
                          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80'
                        )}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* Title is OUTSIDE the image — clearly readable */}
                    <h4 className="font-semibold text-charcoal group-hover:text-primary transition-colors line-clamp-3 leading-snug">
                      {article.title}
                    </h4>
                  </Link>
                ))}

            {/* CTA to blog */}
            {!isLoading && sideArticles.length > 0 && (
              <Link
                to="/blog"
                className="inline-flex items-center mt-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                View all articles →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspirationForNextTrip;
