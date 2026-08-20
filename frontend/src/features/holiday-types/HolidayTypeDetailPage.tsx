import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import CloudflareImage from '../../components/ui/CloudflareImage';
import SeoHead from '../../components/seo/SeoHead';

// API Hooks
import { useHolidayTypeBySlug } from '../../lib/hooks/useHolidayTypes';
import { usePackagesByHolidayType } from '../../lib/hooks/usePackages';
import { useGroupTripsByHolidayType } from '../../lib/hooks/useGroupTrips';
import { useCountriesByHolidayType } from '../../lib/hooks/useDestinations';

// Components
import Breadcrumb from '../../components/layout/Breadcrumb';
import Card from '../../components/data/Card';
import Media from '../../components/data/Media';

// Helper function to get highlights for a country based on holiday type
const getCountryHighlights = (countryName: string, holidayTypeName: string) => {
  const lowerCountry = countryName.toLowerCase();
  const lowerHolidayType = holidayTypeName.toLowerCase();

  if (lowerHolidayType.includes('safari') && lowerCountry.includes('kenya')) {
    return ['Big Five Safari', 'Maasai Culture', 'Amboseli National Park'];
  }
  if (lowerHolidayType.includes('safari') && lowerCountry.includes('tanzania')) {
    return ['Serengeti Migration', 'Ngorongoro Crater', 'Zanzibar Beaches'];
  }
  if (lowerHolidayType.includes('beach')) {
    return ['Pristine Beaches', 'Water Sports', 'Beach Resorts'];
  }
  if (lowerHolidayType.includes('luxury')) {
    return ['5-Star Resorts', 'Private Villas', 'Personal Concierge'];
  }

  // Default highlights
  return ['Cultural Experiences', 'Natural Beauty', 'Adventure Activities'];
};



// Helper to strip HTML tags from a string
const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>?/gm, '');
};

// Helper to truncate text to a specific length
const truncateText = (text: string, limit: number) => {
  if (text.length <= limit) return text;
  return text.slice(0, limit).trim() + '...';
};

// Holiday type highlights based on type
const getHolidayHighlights = (holidayTypeName: string) => {
  const lowerName = holidayTypeName.toLowerCase();

  if (lowerName.includes('safari')) {
    return [
      { icon: '🦁', title: 'Wildlife Encounters', description: 'See the Big Five and incredible animal migrations' },
      { icon: '🏕️', title: 'Luxury Camping', description: 'Glamping experiences in the heart of the wilderness' },
      { icon: '📸', title: 'Photography', description: 'Capture stunning wildlife and landscape shots' },
      { icon: '🌅', title: 'Sunrise Safaris', description: 'Early morning game drives for the best sightings' }
    ];
  }

  if (lowerName.includes('beach')) {
    return [
      { icon: '🏖️', title: 'Pristine Beaches', description: 'White sand beaches and crystal clear waters' },
      { icon: '🌊', title: 'Water Activities', description: 'Snorkeling, diving, and marine adventures' },
      { icon: '🍹', title: 'Beach Relaxation', description: 'Spa treatments and sunset cocktails' },
      { icon: '🏝️', title: 'Island Hopping', description: 'Explore multiple islands and coastal areas' }
    ];
  }

  if (lowerName.includes('luxury')) {
    return [
      { icon: '💎', title: 'Premium Service', description: 'Personal concierge and 24/7 support' },
      { icon: '🏨', title: '5-Star Accommodations', description: 'Luxury resorts and private villas' },
      { icon: '✈️', title: 'Private Transfers', description: 'Personal drivers and private jet options' },
      { icon: '🍽️', title: 'Fine Dining', description: 'Michelin-starred chefs and gourmet experiences' }
    ];
  }

  // Default highlights
  return [
    { icon: '✈️', title: 'Expert Planning', description: 'Professional travel consultants design your perfect trip' },
    { icon: '🛡️', title: 'Safe & Secure', description: 'Comprehensive travel insurance and safety protocols' },
    { icon: '🌍', title: 'Local Experiences', description: 'Authentic cultural immersion and unique activities' },
    { icon: '💝', title: 'Memorable Moments', description: 'Create lifelong memories with unforgettable experiences' }
  ];
};

const HolidayTypeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch holiday type details
  const { data: holidayType, isLoading, error } = useHolidayTypeBySlug(slug || '');

  // Fetch packages for this holiday type
  const { data: packages, isLoading: packagesLoading } = usePackagesByHolidayType(slug || '', { limit: 6 });

  // Fetch group trips for this holiday type
  const { data: groupTrips, isLoading: groupTripsLoading } = useGroupTripsByHolidayType(slug || '', { limit: 6 });

  // Fetch featured destinations (countries) for this holiday type
  const { data: featuredDestinations, isLoading: destinationsLoading } = useCountriesByHolidayType(slug || '', { limit: 6 });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get highlights for this holiday type
  const highlights = holidayType ? getHolidayHighlights(holidayType.name) : [];

  if (isLoading) {
    return (
      <>
        <SeoHead
          title="Loading Holiday Type"
          canonicalPath={`/holiday-types/${slug || ''}`}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          </div>
        </div>
      </>
    );
  }

  if (error || !holidayType) {
    return (
      <>
        <SeoHead
          title="Holiday Type Not Found"
          canonicalPath={`/holiday-types/${slug || ''}`}
          noIndex={true}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p>Error loading holiday type details. Please try again later.</p>
            <Link to="/holiday-types" className="text-red-700 underline mt-2 inline-block">
              Back to Holiday Types
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title={`${holidayType.name} Holidays`}
        description={holidayType.description || undefined}
        canonicalPath={`/holiday-types/${holidayType.slug}`}
        image={`https://source.unsplash.com/random/1200x630/?${holidayType.name.toLowerCase()}`}
      />

      {/* Enhanced Hero Section */}
      <div className="relative min-h-screen flex items-center">
        <div className="absolute inset-0">
          {holidayType.image_id ? (
            <CloudflareImage
              imageId={holidayType.image_id}
              variant="large"
              alt={holidayType.name}
              className="w-full h-full"
              objectFit="cover"
              placeholder={`https://source.unsplash.com/random/1920x1080/?${holidayType.name.toLowerCase()}`}
            />
          ) : (
            <img
              src={`https://source.unsplash.com/random/1920x1080/?${holidayType.name.toLowerCase()}`}
              alt={holidayType.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="bg-black/20 backdrop-blur-sm rounded-md px-3 py-1.5 mb-8 inline-block">
              <Breadcrumb
                items={[
                  { label: 'Holiday Types', path: '/holiday-types' },
                  { label: holidayType.name },
                ]}
                variant="dark"
              />
            </div>

            <div className="flex items-center mb-6">
              <span className="text-6xl mr-4">
                {holidayType.icon || (() => {
                  const lowerName = holidayType.name.toLowerCase();
                  if (lowerName.includes('safari') || lowerName.includes('wildlife')) return '🦁';
                  if (lowerName.includes('beach') || lowerName.includes('coastal')) return '🏖️';
                  if (lowerName.includes('city') || lowerName.includes('urban')) return '🏙️';
                  if (lowerName.includes('honeymoon') || lowerName.includes('romantic')) return '💑';
                  if (lowerName.includes('family') || lowerName.includes('kids')) return '👨‍👩‍👧‍👦';
                  if (lowerName.includes('adventure') || lowerName.includes('trekking')) return '🧗‍♂️';
                  if (lowerName.includes('cruise') || lowerName.includes('boat')) return '🚢';
                  if (lowerName.includes('mountain') || lowerName.includes('hiking')) return '🏔️';
                  if (lowerName.includes('luxury') || lowerName.includes('premium')) return '💎';
                  return '✈️';
                })()}
              </span>
              <div>
                <h1 className="text-5xl md:text-7xl font-playfair text-white mb-2">{holidayType.name}</h1>
                <p className="text-xl md:text-2xl text-white/90 font-light">Holidays</p>
              </div>
            </div>

            {/* Description removed from here to follow the new layout */}


            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                to={`/packages?holidayType=${holidayType.slug}`}
                className="bg-teal hover:bg-teal/90 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Explore Packages
              </Link>
              <Link
                to={`/group-trips?holidayType=${holidayType.slug}`}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-lg font-semibold backdrop-blur-sm transition-all duration-300"
              >
                View Group Trips
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">50+</div>
                <div className="text-sm text-white/80">Destinations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">1000+</div>
                <div className="text-sm text-white/80">Happy Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">4.9</div>
                <div className="text-sm text-white/80">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm text-white/80">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-paper">
        {/* Introduction Section */}
        <div className="py-16 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div
                className="text-xl md:text-2xl text-charcoal leading-relaxed font-playfair"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(holidayType.description || '') }}
              />
            </div>
          </div>
        </div>

        {/* Why Choose This Holiday Type */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-playfair text-charcoal mb-4">
                Why Choose {holidayType.name}?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover what makes our {holidayType.name.toLowerCase()} holidays truly exceptional
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {highlights.map((highlight, index) => (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-teal/20 transition-colors duration-300">
                    <span className="text-4xl">{highlight.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal mb-3">{highlight.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Destinations */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-playfair text-charcoal mb-4">
                Featured Destinations
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover the world's most incredible places for your {holidayType.name.toLowerCase()} adventure
              </p>
            </div>

            {destinationsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-2xl shadow-lg animate-pulse">
                    <div className="h-80 bg-gray-200"></div>
                    <div className="p-8">
                      <div className="h-8 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredDestinations && featuredDestinations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {featuredDestinations.map((destination) => (
                  <Link
                    key={destination.id}
                    to={`/destinations/${destination.slug}`}
                    className="group block overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                  >
                    <div className="relative h-80">
                      <CloudflareImage
                        imageId={destination.image_id}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                        <h3 className="text-3xl md:text-4xl font-playfair font-bold text-white mb-3 group-hover:text-teal transition-colors drop-shadow-md">
                          {destination.name}
                        </h3>
                        <p className="text-white/90 mb-4 leading-relaxed line-clamp-3">
                          {truncateText(stripHtml(destination.description || ''), 180) || `Experience ${holidayType.name.toLowerCase()} in ${destination.name}`}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {getCountryHighlights(destination.name, holidayType.name).map((highlight, index) => (
                            <span key={index} className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No featured destinations available for this holiday type yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Packages Section */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-playfair text-charcoal mb-4">
                {holidayType.name} Packages
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Curated experiences designed for the perfect {holidayType.name.toLowerCase()} holiday
              </p>
            </div>

            {packagesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : packages && packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {packages.map((pkg) => (
                  <Link
                    key={pkg.id}
                    to={`/packages/${pkg.country?.slug || 'unknown'}/${pkg.slug}`}
                    className="group block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
                  >
                    <div className="relative h-64">
                      <CloudflareImage
                        imageId={pkg.image_id}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm font-semibold text-charcoal">{pkg.rating || 4.5}</span>
                          <span className="text-xs text-gray-600">({pkg.review_count || 0})</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-playfair font-medium text-charcoal mb-1 group-hover:text-teal transition-colors">
                            {pkg.name}
                          </h3>
                          <p className="text-sm text-gray-600">{pkg.country?.name}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-teal">${pkg.price}</div>
                          <div className="text-sm text-gray-600">per person</div>
                        </div>
                      </div>

                      <div
                        className="text-gray-600 mb-4 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pkg.summary || pkg.description || '') }}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <span>📅</span>
                            <span>{pkg.duration_days} days</span>
                          </span>
                        </div>
                        <span className="text-teal font-semibold group-hover:underline">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No packages available for this holiday type yet.</p>
              </div>
            )}

            <div className="text-center mt-12">
              <Link
                to={`/packages?holidayType=${holidayType.slug}`}
                className="inline-flex items-center space-x-2 bg-charcoal hover:bg-hover text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span>View All {holidayType.name} Packages</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Group Trips Section */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-playfair text-charcoal mb-4">
                {holidayType.name} Group Adventures
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join like-minded travelers on unforgettable group experiences
              </p>
            </div>

            {groupTripsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : groupTrips && groupTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {groupTrips.map((trip) => (
                  <Link
                    key={trip.id}
                    to={`/group-trips/${trip.slug}`}
                    className="group block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
                  >
                    <div className="relative h-64">
                      <CloudflareImage
                        imageId={trip.image_id}
                        alt={trip.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-teal text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Available
                      </div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <div className="flex items-center space-x-1">
                          <span>👥</span>
                          <span className="text-sm font-semibold text-charcoal">{trip.max_participants}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-playfair font-medium text-charcoal mb-2 group-hover:text-teal transition-colors">
                        {trip.name}
                      </h3>

                      <div
                        className="text-gray-600 mb-4 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(trip.description || '') }}
                      />

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <span>📅</span>
                          <span>{trip.duration_days} days</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-teal">${trip.price}</div>
                          <div className="text-sm text-gray-600">per person</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600 font-medium">Available</span>
                        </div>
                        <span className="text-teal font-semibold group-hover:underline">
                          Join Group →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No group trips available for this holiday type yet.</p>
              </div>
            )}

            <div className="text-center mt-12">
              <Link
                to={`/group-trips?holidayType=${holidayType.slug}`}
                className="inline-flex items-center space-x-2 bg-teal hover:bg-teal/90 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span>Explore All Group Trips</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-playfair text-charcoal mb-4">
                What Travelers Say
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Hear from travelers who experienced unforgettable {holidayType.name.toLowerCase()} adventures
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(5)}
                  </div>
                </div>
                <blockquote className="text-gray-600 mb-6 italic">
                  "Our {holidayType.name.toLowerCase()} holiday exceeded all expectations. Every detail was perfectly planned and the experiences were truly memorable."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center text-white font-bold mr-4">
                    S
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal">Sarah Johnson</div>
                    <div className="text-sm text-gray-600">Adventure Traveler</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(5)}
                  </div>
                </div>
                <blockquote className="text-gray-600 mb-6 italic">
                  "The attention to detail and local insights made our {holidayType.name.toLowerCase()} trip truly special. Highly recommend!"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center text-white font-bold mr-4">
                    M
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal">Michael Chen</div>
                    <div className="text-sm text-gray-600">Family Vacation</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(5)}
                  </div>
                </div>
                <blockquote className="text-gray-600 mb-6 italic">
                  "From start to finish, our {holidayType.name.toLowerCase()} experience was flawless. The team knows how to create magical moments."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center text-white font-bold mr-4">
                    E
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal">Emma Rodriguez</div>
                    <div className="text-sm text-gray-600">Luxury Traveler</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What to Expect Section */}
        <div className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-playfair text-charcoal mb-4">
                  What to Expect
                </h2>
                <p className="text-lg text-gray-600">
                  Your journey from planning to unforgettable memories
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-teal rounded-full flex items-center justify-center text-white font-bold text-xl">
                      1
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-charcoal mb-2">Personal Consultation</h3>
                      <p className="text-gray-600">We start with a detailed discussion about your preferences, budget, and dream {holidayType.name.toLowerCase()} experience.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-teal rounded-full flex items-center justify-center text-white font-bold text-xl">
                      2
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-charcoal mb-2">Custom Itinerary Design</h3>
                      <p className="text-gray-600">Our experts craft a personalized itinerary that captures the essence of your chosen {holidayType.name.toLowerCase()} destinations.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-teal rounded-full flex items-center justify-center text-white font-bold text-xl">
                      3
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-charcoal mb-2">Seamless Arrangements</h3>
                      <p className="text-gray-600">We handle all logistics, from flights and accommodations to local transportation and exclusive experiences.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-teal rounded-full flex items-center justify-center text-white font-bold text-xl">
                      4
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-charcoal mb-2">24/7 Support</h3>
                      <p className="text-gray-600">Enjoy peace of mind with round-the-clock assistance from our experienced travel team throughout your journey.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-teal rounded-full flex items-center justify-center text-white font-bold text-xl">
                      5
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-charcoal mb-2">Memorable Experiences</h3>
                      <p className="text-gray-600">Create lifelong memories with authentic local experiences, stunning destinations, and personalized adventures.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-teal rounded-full flex items-center justify-center text-white font-bold text-xl">
                      6
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-charcoal mb-2">Post-Trip Follow-up</h3>
                      <p className="text-gray-600">We stay connected after your trip to ensure you cherish the memories and plan your next adventure with us.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="py-20 bg-gradient-to-r from-teal to-teal/80">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-playfair text-white mb-6">
              Ready for Your {holidayType.name} Adventure?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Let our travel experts create your perfect {holidayType.name.toLowerCase()} holiday tailored to your dreams
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-white text-teal px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Get Free Consultation
              </Link>
              <Link
                to="/packages"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-teal transition-all duration-300"
              >
                Browse All Packages
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HolidayTypeDetailPage;
