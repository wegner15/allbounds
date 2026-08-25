import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Compass, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import { usePopularTrips } from '../../hooks/usePopularTrips';
import { useCountriesWithPackages } from '../../hooks/useRecommendedHotels';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';
import FromPriceDisplay from '../../../../components/ui/FromPriceDisplay';

const PopularSafariPackages: React.FC = () => {
  const { data: availableCountries, isLoading: countriesLoading } = useCountriesWithPackages('safari', true);
  const locations = availableCountries?.map(country => country.name) || [];
  const [activeTab, setActiveTab] = useState<string>('');

  // Set initial active tab when countries load
  useEffect(() => {
    if (locations.length > 0 && (!activeTab || !locations.includes(activeTab))) {
      setActiveTab(locations[0]);
    }
  }, [locations, activeTab]);

  const { data: trips, isLoading, error } = usePopularTrips(activeTab, 'safari');

  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById('popular-safari-packages-container');
    if (container) {
      const scrollAmount = 340;
      const scrollLeft = direction === 'left' ? -scrollAmount : scrollAmount;
      container.scrollBy({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const renderSkeletons = () => (
    [...Array(4)].map((_, index) => (
      <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse flex-shrink-0 w-80">
        <div className="w-full h-80 bg-gray-200"></div>
        <div className="p-5">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 float-right"></div>
        </div>
      </div>
    ))
  );

  if (countriesLoading) {
    return (
      <section className="py-20 bg-amber-50/30 border-y border-amber-100/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-3">
              <span>🦁 Wildlife & Nature</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">Popular Safari Packages</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-2">
              Focused specifically on iconic safari destinations and thrilling wildlife encounters.
            </p>
          </div>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!locations.length) {
    return null; // Gracefully hide if no safari packages exist
  }

  return (
    <section className="py-20 bg-amber-50/30 border-y border-amber-100/60 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/90 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2.5">
              <span>🦁 Safari Adventures</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 tracking-tight">
              Popular Safari Packages
            </h2>
            <p className="text-gray-600 max-w-2xl mt-2 text-sm sm:text-base leading-relaxed">
              Focused specifically on premier safari destinations, game drives, wilderness lodges, and unforgettable wildlife experiences.
            </p>
          </div>

          <Link
            to={activeTab ? `/packages?packageType=safari&country=${encodeURIComponent(activeTab)}` : '/packages?packageType=safari'}
            className="hidden md:inline-flex items-center text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors group"
          >
            <span>Explore {activeTab ? `${activeTab} ` : 'All '}Safari Packages</span>
            <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Destination Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mb-8">
          {locations.map(location => (
            <button
              key={location}
              onClick={() => setActiveTab(location)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === location
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 scale-[1.02]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              {location}
            </button>
          ))}
        </div>

        {/* Packages Carousel */}
        <div className="relative group/carousel">
          <div
            className="flex gap-6 overflow-x-auto pb-6 pt-1 scrollbar-hide snap-x"
            id="popular-safari-packages-container"
          >
            {isLoading ? (
              renderSkeletons()
            ) : error ? (
              <div className="w-full text-center py-12 text-red-500 bg-white rounded-2xl border border-red-100">
                Failed to load popular safari packages.
              </div>
            ) : trips && trips.length > 0 ? (
              trips.slice(0, 10).map((trip: any) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col flex-shrink-0 w-80 snap-start"
                >
                  <Link to={`/packages/${trip.slug}`} className="relative block overflow-hidden">
                    <img
                      src={getImageUrlWithFallback(
                        trip.image_id,
                        IMAGE_VARIANTS.MEDIUM,
                        'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80'
                      )}
                      alt={trip.name}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Safari Badge */}
                    <div className="absolute top-3 left-3 bg-amber-600/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      🦁 Safari
                    </div>

                    {/* Conversion Trigger / Featured Badge (Top Right) */}
                    {(trip.conversion_triggers && trip.conversion_triggers.length > 0) ? (
                      <div className="absolute top-3 right-3 bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
                        <span>⭐</span> {trip.conversion_triggers[0]}
                      </div>
                    ) : trip.is_featured ? (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full shadow-md z-10">
                        Featured
                      </div>
                    ) : null}

                    {/* Duration Badge */}
                    {trip.duration_days && (
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-md">
                        {trip.duration_days} {trip.duration_days === 1 ? 'Day' : 'Days'}
                      </div>
                    )}
                  </Link>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span className="font-semibold text-amber-700 uppercase tracking-wider">
                        {trip.country?.name || activeTab}
                      </span>
                      <div className="flex items-center">
                        <Star className="w-3.5 h-3.5 mr-1 text-yellow-400 fill-current" />
                        <span className="font-bold text-gray-700">{trip.rating || '4.9'}</span>
                      </div>
                    </div>

                    <Link to={`/packages/${trip.slug}`}>
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                        {trip.name}
                      </h3>
                    </Link>

                    <div
                      className="text-xs text-gray-600 mt-2 mb-4 line-clamp-2 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(trip.summary || trip.description || '') }}
                    />

                    {trip.conversion_triggers && trip.conversion_triggers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {trip.conversion_triggers.slice(0, 2).map((trigger: string, i: number) => (
                          <span
                            key={i}
                            className="bg-amber-100/70 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter"
                          >
                            {trigger}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <FromPriceDisplay
                        packageId={trip.id}
                        basePrice={trip.price}
                        className="text-left"
                      />
                      <Link
                        to={`/packages/${trip.slug}`}
                        className="px-3.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100">
                No safari packages currently available for {activeTab}.
              </div>
            )}
          </div>

          {/* Navigation Scroll Buttons */}
          <button
            onClick={() => scrollContainer('left')}
            className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg border border-gray-100 transition-all duration-200 z-10 hidden sm:flex items-center justify-center hover:scale-110"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollContainer('right')}
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg border border-gray-100 transition-all duration-200 z-10 hidden sm:flex items-center justify-center hover:scale-110"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile View All CTA */}
        <div className="text-center mt-6 md:hidden">
          <Link
            to={activeTab ? `/packages?packageType=safari&country=${encodeURIComponent(activeTab)}` : '/packages?packageType=safari'}
            className="inline-flex items-center text-sm font-bold text-amber-700 hover:text-amber-800"
          >
            <span>Explore {activeTab ? `${activeTab} ` : 'All '}Safari Packages</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularSafariPackages;
