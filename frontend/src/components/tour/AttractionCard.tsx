import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../ui/OptimizedImage';
import { getResponsiveImageSizes } from '../../utils/imageUtils';
import type { AttractionSummary } from '../../lib/types/api';
import { MapPin } from 'lucide-react';

interface AttractionCardProps {
  attraction: AttractionSummary;
}

const AttractionCard: React.FC<AttractionCardProps> = ({ attraction }) => {
  const { name, slug, summary, description, city, image_id } = attraction;

  return (
    <Link
      to={`/attractions/${slug}`}
      className="group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 hover:border-accent/30 animate-fade-in"
    >
      {/* Attraction Image with square aspect ratio */}
      <div className="relative aspect-square overflow-hidden bg-gray-200">
        <OptimizedImage
          imageId={image_id}
          alt={name}
          variant="medium"
          className="w-full h-full transition-transform duration-500 group-hover:scale-110"
          objectFit="cover"
          loading="lazy"
          aspectRatio="1/1"
          showSkeleton={true}
          sizes={getResponsiveImageSizes('card')}
        />
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Attraction Details */}
      <div className="p-5">
        {/* Attraction Name */}
        <h3 className="text-lg font-semibold text-charcoal mb-2 line-clamp-2 group-hover:text-accent transition-colors font-playfair">
          {name}
        </h3>

        {/* Location */}
        {city && (
          <div className="flex items-center gap-1.5 text-gray-600 mb-3">
            <MapPin className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">{city}</span>
          </div>
        )}

        {/* Description - Use summary if available, otherwise description */}
        {(summary || description) && (
          <div 
            className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed prose prose-sm max-w-none prose-p:my-0"
            dangerouslySetInnerHTML={{ __html: summary || description }}
          />
        )}

        {/* Learn More Link */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <span className="text-sm font-semibold text-accent group-hover:text-accent-dark flex items-center gap-1.5 transition-colors">
            Learn More
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default AttractionCard;
