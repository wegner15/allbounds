import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import SeoHead from '../../../components/seo/SeoHead';
import { useHotels } from '../../../lib/hooks/useHotels';
import { useHotelTypes } from '../../../lib/hooks/useHotelTypes';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../utils/imageUtils';

const HotelListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(() => searchParams.get('country') || '');
  const [minStars, setMinStars] = useState<number | ''>('');

  useEffect(() => {
    const countryParam = searchParams.get('country');
    if (countryParam !== null) {
      setSelectedCountry(countryParam);
    }
  }, [searchParams]);
  const { data: hotels, isLoading, error } = useHotels();
  const { data: hotelTypes, isLoading: isLoadingTypes } = useHotelTypes();

  const filteredHotels = hotels?.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCountry = !selectedCountry || hotel.country?.name === selectedCountry;

    const matchesStars = !minStars || (hotel.stars && hotel.stars >= Number(minStars));

    return matchesSearch && matchesCountry && matchesStars;
  }) || [];

  const countries = Array.from(new Set(hotels?.map(hotel => hotel.country?.name).filter(Boolean).sort())) || [];


  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (isLoading) {
    return (
      <>
        <SeoHead
          title="Hotels & Stays"
          description="Discover amazing hotels and accommodations for your next adventure with Allbound Vacations."
          canonicalPath="/hotels"
        />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SeoHead
          title="Hotels & Stays"
          description="Discover amazing hotels and accommodations for your next adventure with Allbound Vacations."
          canonicalPath="/hotels"
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to load hotels</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title="Hotels & Stays"
        description="Discover amazing hotels and accommodations for your next adventure with Allbound Vacations."
        canonicalPath="/hotels"
      />
      <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white via-gray-50/50 to-gray-50 border-b border-gray-200/80 py-12 md:py-16">
        <div className="fluid-container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-primary uppercase mb-3">
              <span className="w-6 h-[2px] bg-primary/60 rounded-full" />
              ACCOMMODATIONS & STAYS
              <span className="w-6 h-[2px] bg-primary/60 rounded-full" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-playfair text-charcoal mb-4 tracking-tight leading-tight">
              Handpicked Stays & Luxury Accommodations
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-sans leading-relaxed mb-3">
              From beachfront luxury resorts and intimate safari lodges to cozy boutique city hotels, discover curated accommodations designed to elevate your travel experience.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 font-sans leading-relaxed">
              Every property listed with Allbound Vacations is carefully chosen for its hospitality standards, unique setting, and exceptional guest satisfaction. Filter by destination, star rating, or hotel style below.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="fluid-container py-4">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search hotels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Country Filter */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>

            {/* Star Rating Filter */}
            <select
              value={minStars}
              onChange={(e) => setMinStars(e.target.value ? Number(e.target.value) : '')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Star Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center text-sm text-gray-500">
              {filteredHotels.length} hotel{filteredHotels.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Header Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-10 shadow-sm overflow-x-auto">
        <div className="fluid-container py-3">
          <div className="flex space-x-2 min-w-max pb-1">
            <button
              onClick={() => {
                document.getElementById('all-hotels')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              All Hotels
            </button>
            {hotelTypes?.filter(type => filteredHotels.some(h => h.hotel_type_id === type.id)).map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  const element = document.getElementById(`type-${type.id}`);
                  if (element) {
                    const headerOffset = 140; // Approx height of sticky headers
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth"
                    });
                  }
                }}
                className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
              >
                <span>{type.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hotels List - Grouped by Type */}
      <div className="fluid-container py-8" id="all-hotels">
        {isLoading || isLoadingTypes ? (
          <div className="animate-pulse space-y-12">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 4xl:grid-cols-5">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-64 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
            <p className="text-gray-500">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {hotelTypes?.map((type) => {
              const typeHotels = filteredHotels.filter(h => h.hotel_type_id === type.id);
              if (typeHotels.length === 0) return null;

              return (
                <div key={type.id} id={`type-${type.id}`} className="scroll-mt-40">
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{type.name}</h2>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      {typeHotels.length}
                    </span>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 4xl:grid-cols-5">
                    {typeHotels.map((hotel) => (
                      <div key={hotel.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
                        {/* Hotel Image */}
                        <div className="h-56 relative overflow-hidden">
                          <img
                            src={getImageUrlWithFallback(hotel.image_id || hotel.image_url, IMAGE_VARIANTS.MEDIUM, '/home-heros/hero4.jpeg')}
                            alt={hotel.name}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-800 shadow-sm">
                            {hotel.price_category || 'Hotel'}
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition-colors">
                              <Link to={`/hotels/${hotel.slug}`}>
                                {hotel.name}
                              </Link>
                            </h3>
                          </div>

                          <div className="flex items-center mb-3">
                            {hotel.stars && (
                              <div className="flex mr-3">
                                {renderStars(hotel.stars)}
                              </div>
                            )}
                            {hotel.city && (
                              <span className="text-sm text-gray-500 truncate flex items-center">
                                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {hotel.city}
                              </span>
                            )}
                          </div>

                          {hotel.description && (
                            <div
                              className="text-gray-600 text-sm mb-4 line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(hotel.description) }}
                            />
                          )}

                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              {hotel.check_in_time && <span>In: {hotel.check_in_time}</span>}
                            </div>
                            <Link
                              to={`/hotels/${hotel.slug}`}
                              className="text-teal-600 font-semibold text-sm hover:text-teal-700 flex items-center"
                            >
                              Details
                              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Hotels without type */}
            {filteredHotels.some(h => !h.hotel_type_id) && (
              <div id="type-other" className="scroll-mt-40">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Other Accommodations</h2>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                    {filteredHotels.filter(h => !h.hotel_type_id).length}
                  </span>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredHotels.filter(h => !h.hotel_type_id).map((hotel) => (
                    <div key={hotel.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
                      {/* Hotel Image (Same generic card structure) */}
                      <div className="h-56 relative overflow-hidden">
                        <img
                          src={getImageUrlWithFallback(hotel.image_id || hotel.image_url, IMAGE_VARIANTS.MEDIUM, '/home-heros/hero4.jpeg')}
                          alt={hotel.name}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition-colors">
                            <Link to={`/hotels/${hotel.slug}`}>{hotel.name}</Link>
                          </h3>
                        </div>
                        <div className="flex items-center mb-3">
                          {hotel.stars && <div className="flex mr-3">{renderStars(hotel.stars)}</div>}
                          {hotel.city && <span className="text-sm text-gray-500 truncate">{hotel.city}</span>}
                        </div>
                        <Link
                          to={`/hotels/${hotel.slug}`}
                          className="mt-2 text-teal-600 font-semibold text-sm hover:text-teal-700 flex items-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default HotelListPage;
