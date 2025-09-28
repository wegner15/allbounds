import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';
import { cleanTextForDisplay } from '../../lib/utils/text';
import type { GroupTrip } from '../../lib/types/api';

interface GroupTripCarouselProps {
  groupTrips: GroupTrip[];
  isLoading?: boolean;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showUpcomingBadge?: boolean;
  title?: string;
  subtitle?: string;
}

const GroupTripCarousel: React.FC<GroupTripCarouselProps> = ({
  groupTrips,
  isLoading = false,
  className = '',
  autoPlay = true,
  autoPlayInterval = 5000,
  showUpcomingBadge = true,
  title,
  subtitle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && groupTrips.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % groupTrips.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, groupTrips.length]);

  if (isLoading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        <div className="h-64 md:h-80 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal mb-2"></div>
            <p>Loading featured group trips...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!groupTrips || groupTrips.length === 0) {
    return (
      <div className={`bg-gray-200 ${className}`}>
        <div className="h-64 md:h-80 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p>No upcoming group trips available</p>
          </div>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + groupTrips.length) % groupTrips.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % groupTrips.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentTrip = groupTrips[currentIndex];

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  // Get next departure date
  const getNextDeparture = (trip: GroupTrip) => {
    if (!trip.departures || trip.departures.length === 0) return null;

    const now = new Date();
    const upcomingDepartures = trip.departures
      .filter(departure => new Date(departure.start_date) > now)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

    return upcomingDepartures.length > 0 ? upcomingDepartures[0] : null;
  };

  const nextDeparture = getNextDeparture(currentTrip);

  return (
    <div className={`relative overflow-hidden bg-gray-900 ${className}`}>
      {/* Main Group Trip Display */}
      <div className="relative w-full h-full">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={getImageUrlWithFallback(currentTrip.image_id, IMAGE_VARIANTS.LARGE)}
            alt={currentTrip.name}
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-2xl">
              {/* Page Title */}
              {title && (
                <div className="mb-6">
                  <h1 className="text-4xl md:text-6xl font-playfair font-bold text-white mb-2">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-xl md:text-2xl text-white/90">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}

              {/* Featured Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal text-white mb-4">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                {showUpcomingBadge ? 'Upcoming Group Trip' : 'Featured Group Trip'}
              </div>

              {/* Trip Title */}
              <h2 className="text-2xl md:text-4xl font-playfair font-bold text-white mb-2">
                {currentTrip.name}
              </h2>

              {/* Trip Description */}
              {(currentTrip.summary || currentTrip.description) && (
                <p className="text-white/90 text-sm md:text-base mb-4 max-w-lg line-clamp-2">
                  {cleanTextForDisplay(currentTrip.summary || currentTrip.description || '')}
                </p>
              )}

              {/* Trip Details */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-white/80 text-sm">
                {currentTrip.country && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {currentTrip.country.name}
                  </div>
                )}

                {currentTrip.duration_days && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {currentTrip.duration_days} days
                  </div>
                )}

                {nextDeparture && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Departs {formatDate(nextDeparture.start_date)}
                  </div>
                )}

                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  From ${currentTrip.price}
                </div>
              </div>

              {/* CTA Button */}
              <Link
                to={`/group-trips/${currentTrip.slug}`}
                className="inline-flex items-center px-6 py-3 bg-teal hover:bg-teal-dark text-white font-medium rounded-lg transition-colors duration-200"
              >
                View Trip Details & Book
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {groupTrips.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
              aria-label="Previous group trip"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
              aria-label="Next group trip"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {groupTrips.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {groupTrips.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to group trip ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Trip Counter */}
        {groupTrips.length > 1 && (
          <div className="absolute top-6 right-6 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
            {currentIndex + 1} / {groupTrips.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupTripCarousel;