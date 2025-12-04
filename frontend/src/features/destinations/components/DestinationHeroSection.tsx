import React from 'react';
import OptimizedImage from '../../../components/ui/OptimizedImage';
import { getResponsiveImageSizes } from '../../../utils/imageUtils';
import type { CountryWithDetails } from '../../../lib/types/api';

interface DestinationHeroSectionProps {
  country: CountryWithDetails;
}

const DestinationHeroSection: React.FC<DestinationHeroSectionProps> = React.memo(({ country }) => {
  return (
    <section 
      className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden"
      aria-label={`${country.name} destination hero`}
    >
      {/* Background Image or Gradient */}
      {country.image_id ? (
        <div className="absolute inset-0">
          {/* Desktop Image - Large variant */}
          <div className="hidden md:block w-full h-full">
            <OptimizedImage
              imageId={country.image_id}
              alt={`Scenic view of ${country.name}`}
              variant="large"
              className="w-full h-full"
              objectFit="cover"
              loading="eager"
              priority={true}
              showSkeleton={false}
              sizes={getResponsiveImageSizes('hero')}
            />
          </div>
          {/* Mobile Image - Medium variant */}
          <div className="block md:hidden w-full h-full">
            <OptimizedImage
              imageId={country.image_id}
              alt={`Scenic view of ${country.name}`}
              variant="medium"
              className="w-full h-full"
              objectFit="cover"
              loading="eager"
              priority={true}
              showSkeleton={false}
              sizes={getResponsiveImageSizes('hero')}
            />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-teal to-primary-dark" />
      )}

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

      {/* Content Container */}
      <div className="relative h-full flex items-end z-10">
        <div className="container mx-auto px-4 pb-8 md:pb-12">
          {/* Destination Name - H1 for proper heading hierarchy */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-3 md:mb-4 leading-tight drop-shadow-lg animate-slide-up">
            {country.name}
          </h1>

          {/* Summary/Description */}
          {country.summary && (
            <p className="text-base md:text-lg lg:text-xl text-white/95 max-w-3xl leading-relaxed drop-shadow-md animate-fade-in line-clamp-3">
              {country.summary}
            </p>
          )}
        </div>
      </div>
    </section>
  );
});

DestinationHeroSection.displayName = 'DestinationHeroSection';

export default DestinationHeroSection;
