import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../../../components/ui/OptimizedImage';
import { getResponsiveImageSizes } from '../../../utils/imageUtils';
import type { CountryWithDetails } from '../../../lib/types/api';
import DestinationBookingModal from '../../../components/forms/DestinationBookingModal';

interface DestinationHeroSectionProps {
  country: CountryWithDetails;
}

const DestinationHeroSection: React.FC<DestinationHeroSectionProps> = React.memo(({ country }) => {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

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

      {/* Content Container - Centered Overlay Card */}
      <div className="relative h-full flex items-center justify-center z-10 px-4">
        <div className="bg-black/40 backdrop-blur-[2px] rounded-lg p-8 md:p-12 max-w-4xl w-full text-center text-white shadow-2xl border border-white/10">
          {/* Destination Name */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold mb-4 md:mb-6 leading-tight drop-shadow-lg text-white">
            Luxury {country.name} Holidays
          </h1>

          {/* Summary/Description */}
          <div className="mb-8 md:mb-10">
            {country.summary ? (
              <p className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                {country.summary}
              </p>
            ) : (
              <p className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                There is no question too small. Start planning your dream trip by talking to our Destination Specialists.
              </p>
            )}
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => setBookingModalOpen(true)}
              className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold tracking-wider transition-all duration-300 uppercase text-sm md:text-base rounded-md shadow-xl hover:scale-105 active:scale-95 cursor-pointer min-w-[180px]"
            >
              Book {country.name}
            </button>

            <Link
              to={`/destinations/${country.slug}/book`}
              className="px-8 py-3.5 border-2 border-white text-white font-semibold tracking-wider hover:bg-white hover:text-black transition-all duration-300 uppercase text-sm md:text-base rounded-md min-w-[180px]"
            >
              Inquire Destination
            </Link>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <DestinationBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        defaultDestination={country.name}
        countryId={country.id}
      />
    </section>
  );
});

DestinationHeroSection.displayName = 'DestinationHeroSection';

export default DestinationHeroSection;
