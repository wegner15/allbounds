import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHolidayTypes } from '../../../../lib/hooks/useHolidayTypes';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';

const HolidayByType: React.FC = () => {
  const { data: holidayTypes, isLoading, error } = useHolidayTypes();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400; // Adjust as needed based on card width
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const renderSkeletons = () => (
    [...Array(4)].map((_, index) => (
      <div key={index} className="relative h-80 min-w-[300px] md:min-w-[350px] lg:min-w-[400px] rounded-lg overflow-hidden bg-gray-200 animate-pulse shrink-0 snap-start"></div>
    ))
  );

  if (error) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">Failed to load holiday types.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Holidays By Type</h2>
          <p className="text-gray-600 max-w-4xl mx-auto">
            Explore our diverse range of holidays categorized by type, designed to cater to every traveler's preferences and interests.
            Whether you're craving a Safari, Beach escape, Honeymoon, Family Holidays, or City Breaks, we have the perfect holiday waiting for you.
            Discover our curated selection and embark on an unforgettable travel experience that matches your unique style and desires.
          </p>
        </div>

        <div className="relative group/container">
          {/* Scroll Buttons */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md rounded-full p-2 text-primary hover:bg-primary hover:text-white transition-colors focus:outline-none opacity-0 group-hover/container:opacity-100 disabled:opacity-0"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md rounded-full p-2 text-primary hover:bg-primary hover:text-white transition-colors focus:outline-none opacity-0 group-hover/container:opacity-100 disabled:opacity-0"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 sm:gap-8 pb-8 pt-4 snap-x shrink-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {isLoading ? renderSkeletons() : holidayTypes?.map(type => (
              <div key={type.id} className="relative h-80 min-w-[280px] md:min-w-[350px] lg:min-w-[380px] rounded-lg overflow-hidden group snap-start shrink-0 shadow-sm hover:shadow-xl transition-shadow duration-300">
                <img
                  src={getImageUrlWithFallback(type.image_id, IMAGE_VARIANTS.MEDIUM, 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80')}
                  alt={type.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/70 to-transparent/30"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <h3 className="text-2xl font-playfair font-bold text-white mb-2 drop-shadow-md tracking-wide">{type.name}</h3>
                  <p className="text-gray-100 mb-4 line-clamp-2 font-lato drop-shadow-sm">{type.description}</p>
                  <Link
                    to={`/holiday-types/${type.slug}`}
                    className="inline-block bg-white text-charcoal px-6 py-2 rounded font-bold font-lato hover:bg-primary hover:text-white transition-colors shadow-sm"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/holiday-types"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white hover:bg-primary-dark font-bold font-lato rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            View All
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HolidayByType;
