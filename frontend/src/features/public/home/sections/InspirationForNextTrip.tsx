import React from 'react';
import { Link } from 'react-router-dom';
import { useInspirationArticles } from '../../hooks/useInspirationArticles';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';

const InspirationForNextTrip: React.FC = () => {
  const { data: articles, isLoading, error } = useInspirationArticles();

  const renderMainSkeletons = () => (
    [...Array(2)].map((_, index) => (
      <div key={index} className="animate-pulse">
        <div className="relative h-64 rounded-lg overflow-hidden bg-gray-200"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mt-4"></div>
      </div>
    ))
  );

  const renderSideSkeletons = () => (
    [...Array(2)].map((_, index) => (
      <div key={index} className="flex items-center animate-pulse">
        <div className="w-24 h-24 object-cover rounded-lg mr-4 bg-gray-200"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    ))
  );

  const mainArticles = articles?.slice(0, 2) || [];
  const sideArticles = articles?.slice(2, 4) || [];

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Get inspiration for your next trip</h2>
            <p className="text-gray-600">Travel articles to ignite your wanderlust.</p>
          </div>
          <Link 
            to="/blog" 
            className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
          >
            More
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {error && <div className="text-center text-red-500">Failed to load articles.</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Articles */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? renderMainSkeletons() : mainArticles.map(article => (
              <Link 
                key={article.id} 
                to={`/blog/${article.slug}`}
                className="block group"
              >
                <div className="relative h-64 rounded-lg overflow-hidden">
                  <img 
                    src={getImageUrlWithFallback(article.image_url, IMAGE_VARIANTS.MEDIUM, 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80')}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-xl text-gray-800 mt-4 group-hover:text-blue-600 transition-colors line-clamp-2">{article.title}</h3>
              </Link>
            ))}
          </div>

          {/* Side Articles */}
          <div className="space-y-4">
            {isLoading ? renderSideSkeletons() : sideArticles.map(article => (
              <Link 
                key={article.id} 
                to={`/blog/${article.slug}`}
                className="flex items-center group"
              >
                <img 
                  src={getImageUrlWithFallback(article.image_url, IMAGE_VARIANTS.THUMBNAIL, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80')}
                  alt={article.title}
                  className="w-24 h-24 object-cover rounded-lg mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-3">{article.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspirationForNextTrip;
