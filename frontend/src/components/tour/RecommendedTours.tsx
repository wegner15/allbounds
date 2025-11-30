import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, DollarSign, MapPin } from 'lucide-react';
import OptimizedImage from '../ui/OptimizedImage';
import { getResponsiveImageSizes } from '../../utils/imageUtils';
import type { Package } from '../../lib/types/api';

interface RecommendedToursProps {
  tours: Package[];
  title?: string;
  subtitle?: string;
}

const RecommendedTours: React.FC<RecommendedToursProps> = ({ 
  tours, 
  title = "You Might Also Like",
  subtitle = "Discover more amazing tours in this destination"
}) => {
  if (!tours || tours.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal mb-3 font-playfair">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {tours.map((tour) => (
            <Link
              key={tour.id}
              to={`/packages/${tour.slug}`}
              className="group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 hover:border-primary/30 animate-fade-in"
            >
              {/* Tour Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                <OptimizedImage
                  imageId={tour.image_id}
                  alt={tour.name}
                  variant="medium"
                  className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                  objectFit="cover"
                  loading="lazy"
                  aspectRatio="4/3"
                  showSkeleton={true}
                  sizes={getResponsiveImageSizes('card')}
                />
                
                {/* Featured Badge */}
                {tour.is_featured && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    <i className="fas fa-star mr-1" />
                    Featured
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Tour Details */}
              <div className="p-5">
                {/* Tour Name */}
                <h3 className="text-lg font-semibold text-charcoal mb-3 line-clamp-2 group-hover:text-primary transition-colors font-playfair min-h-[3.5rem]">
                  {tour.name}
                </h3>

                {/* Tour Info */}
                <div className="space-y-2 mb-4">
                  {/* Country */}
                  {tour.country && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="truncate">{tour.country.name}</span>
                    </div>
                  )}
                  
                  {/* Duration */}
                  {tour.duration_days && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                      <span>{tour.duration_days} {tour.duration_days === 1 ? 'Day' : 'Days'}</span>
                    </div>
                  )}
                  
                  {/* Price */}
                  {tour.price && tour.price > 0 && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-success">
                      <DollarSign className="w-4 h-4 flex-shrink-0" />
                      <span>From ${tour.price.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Summary */}
                {tour.summary && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {tour.summary}
                  </p>
                )}

                {/* View Details Link */}
                <div className="pt-4 border-t border-gray-100">
                  <span className="text-sm font-semibold text-primary group-hover:text-primary-dark flex items-center gap-2 transition-colors">
                    View Details
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            Explore All Tours
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecommendedTours;
