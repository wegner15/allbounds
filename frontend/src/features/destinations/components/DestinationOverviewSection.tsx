import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { MapPin } from 'lucide-react';
import type { CountryWithDetails } from '../../../lib/types/api';

interface DestinationOverviewSectionProps {
  country: CountryWithDetails;
}

const DestinationOverviewSection: React.FC<DestinationOverviewSectionProps> = React.memo(({ country }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate word count for description
  const getWordCount = (html: string): number => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.trim().split(/\s+/).length;
  };

  const wordCount = country.description ? getWordCount(country.description) : 0;
  const shouldShowReadMore = wordCount > 500;

  // Sanitize HTML content
  const sanitizedDescription = country.description 
    ? DOMPurify.sanitize(country.description, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'hr', 'span', 'div'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'style', 'class']
      })
    : '';

  return (
    <section aria-label="Destination overview">
      {/* Description Section */}
      <div className="bg-white rounded-lg p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
            About {country.name}
          </h2>
          
          {/* Region Information */}
          {country.region && (
            <Link
              to={`/regions/${country.region.slug}`}
              className="text-teal-600 hover:text-teal-700 transition-colors duration-200 flex items-center gap-2 text-sm md:text-base min-h-[44px] sm:min-h-0"
              aria-label={`View ${country.region.name} region`}
            >
              <MapPin className="w-4 h-4" aria-hidden="true" />
              <span>{country.region.name}</span>
            </Link>
          )}
        </div>

        {/* Description Content */}
        {sanitizedDescription ? (
          <div className="relative">
            <div
              className={`prose prose-sm md:prose-base lg:prose-lg max-w-none text-gray-700 leading-relaxed ${
                shouldShowReadMore && !isExpanded ? 'line-clamp-[20]' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
            
            {/* Read More Button */}
            {shouldShowReadMore && (
              <div className="mt-4">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-teal-600 hover:text-teal-700 font-semibold transition-colors duration-200 flex items-center gap-2 min-h-[44px] text-sm md:text-base"
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? 'Show less content' : 'Show more content'}
                >
                  {isExpanded ? 'Read Less' : 'Read More'}
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm md:text-base text-gray-600 italic">
            No description available for this destination.
          </p>
        )}
      </div>
    </section>
  );
});

DestinationOverviewSection.displayName = 'DestinationOverviewSection';

export default DestinationOverviewSection;
