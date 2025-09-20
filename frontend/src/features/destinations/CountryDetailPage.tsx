import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';

// Components
import Breadcrumb from '../../components/layout/Breadcrumb';
import Button from '../../components/ui/Button';

// API
import { apiClient, endpoints } from '../../lib/api';
import type { CountryWithDetails } from '../../lib/types/api';

// Utils
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

const CountryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Fetch country details with all related data
  const { data: country, isLoading, error } = useQuery<CountryWithDetails>({
    queryKey: ['country-details', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Country slug is required');
      const response = await apiClient.get<CountryWithDetails>(endpoints.countries.bySlugWithDetails(slug));
      return response;
    },
  });

  if (isLoading) {
    return (
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
    );
  }

  if (error || !country) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>Error loading country details. Please try again later.</p>
          <Link to="/destinations" className="text-red-700 underline mt-2 inline-block">
            Back to Destinations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{country.name} | AllBounds Vacations</title>
        <meta name="description" content={country.description || `Discover ${country.name} with AllBounds Vacations`} />
        <meta property="og:title" content={`${country.name} | AllBounds Vacations`} />
        <meta property="og:description" content={country.description || `Discover ${country.name} with AllBounds Vacations`} />
        {country?.image_id && (
          <meta property="og:image" content={getImageUrlWithFallback(country.image_id, IMAGE_VARIANTS.LARGE)} />
        )}
      </Helmet>

      <div className="bg-paper min-h-screen">
        {/* Hero Section */}
        <div className="relative h-96 md:h-[500px]">
          {country?.image_id ? (
            <img
              src={getImageUrlWithFallback(country.image_id, IMAGE_VARIANTS.LARGE)}
              alt={country.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-teal to-primary"></div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <h1 className="text-4xl md:text-6xl font-playfair text-white mb-4">{country.name}</h1>
              <p className="text-xl text-white/90 max-w-2xl">{country.description}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Destinations', path: '/destinations' },
              { label: country.region?.name || 'Region', path: `/destinations/regions/${country.region?.slug}` },
              { label: country.name },
            ]}
            className="mb-8"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Country Overview */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-playfair text-charcoal mb-4">About {country.name}</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{country.description}</p>
                
                {/* Quick Facts */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {country.capital && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Capital</div>
                      <div className="font-semibold text-charcoal">{country.capital}</div>
                    </div>
                  )}
                  {country.currency && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Currency</div>
                      <div className="font-semibold text-charcoal">{country.currency}</div>
                    </div>
                  )}
                  {country.language && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Language</div>
                      <div className="font-semibold text-charcoal">{country.language}</div>
                    </div>
                  )}
                  {country.timezone && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Timezone</div>
                      <div className="font-semibold text-charcoal">{country.timezone}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Packages Section */}
              {country?.packages && country.packages.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-playfair text-charcoal">Travel Packages</h2>
                    <Link to={`/packages?country=${country.slug}`}>
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {country.packages.slice(0, 4).map(pkg => (
                      <Link key={pkg.id} to={`/packages/${pkg.slug}`} className="group">
                        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <img
                            src={getImageUrlWithFallback(pkg.image_id, IMAGE_VARIANTS.MEDIUM, 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=400&q=80')}
                            alt={pkg.name}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-3">
                            <h3 className="font-semibold text-charcoal group-hover:text-hover transition-colors mb-1">
                              {pkg.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{pkg.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">{pkg.duration_days} days</span>
                              <span className="font-bold text-primary">From ${pkg.price}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Group Trips Section */}
              {country?.group_trips && country.group_trips.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-playfair text-charcoal">Group Trips</h2>
                    <Link to={`/group-trips?country=${country.slug}`}>
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {country.group_trips.slice(0, 4).map(trip => (
                      <Link key={trip.id} to={`/group-trips/${trip.slug}`} className="group">
                        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <img
                            src={getImageUrlWithFallback(trip.image_id, IMAGE_VARIANTS.MEDIUM, 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=400&q=80')}
                            alt={trip.name}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-3">
                            <h3 className="font-semibold text-charcoal group-hover:text-hover transition-colors mb-1">
                              {trip.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{trip.description}</p>
                            
                            {/* Trip Details */}
                            <div className="space-y-1 mb-2">
                              <div className="flex items-center text-xs text-gray-500">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{trip.duration_days} days</span>
                              </div>
                              {trip.max_participants && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.196-2.121M7 20v-2m5-8a3 3 0 110-6 3 3 0 010 6zm-5 6a3 3 0 110-6 3 3 0 010 6z" />
                                  </svg>
                                  <span>Max {trip.max_participants} guests</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-between items-center">
                              {trip.departures && trip.departures.length > 0 ? (
                                <span className="text-xs text-teal font-medium">
                                  Next: {new Date(trip.departures[0].start_date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">No departures scheduled</span>
                              )}
                              <span className="font-bold text-primary">From ${trip.price}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Attractions Section */}
              {country?.attractions && country.attractions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <h2 className="text-2xl font-playfair text-charcoal mb-6">Top Attractions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {country.attractions.slice(0, 6).map(attraction => (
                      <Link key={attraction.id} to={`/attractions/${attraction.slug}`} className="group">
                        <div className="flex space-x-3 p-3 border rounded-lg hover:shadow-md transition-shadow">
                          <img
                            src={getImageUrlWithFallback(attraction.image_id, IMAGE_VARIANTS.THUMBNAIL, 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=100&q=80')}
                            alt={attraction.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-charcoal group-hover:text-hover transition-colors mb-1">{attraction.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{attraction.description}</p>
                            {attraction.location && (
                              <p className="text-xs text-gray-500 mt-1">{attraction.location}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotels Section */}
              {country?.hotels && country.hotels.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-playfair text-charcoal">Featured Hotels</h2>
                    <Link to={`/hotels?country=${country.slug}`}>
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {country.hotels.slice(0, 4).map(hotel => (
                      <Link key={hotel.id} to={`/hotels/${hotel.slug}`} className="group">
                        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <img
                            src={getImageUrlWithFallback(hotel.image_id, IMAGE_VARIANTS.MEDIUM, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80')}
                            alt={hotel.name}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-charcoal group-hover:text-hover transition-colors">
                                {hotel.name}
                              </h3>
                              {hotel.stars && (
                                <div className="flex text-yellow-400 text-sm">
                                  {[...Array(Math.floor(hotel.stars))].map((_, i) => (
                                    <span key={i}>⭐</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {hotel.summary && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{hotel.summary}</p>
                            )}
                            
                            <div className="space-y-1 mb-2">
                              {hotel.city && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{hotel.city}</span>
                                </div>
                              )}
                              {hotel.price_category && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                  </svg>
                                  <span>{hotel.price_category}</span>
                                </div>
                              )}
                            </div>
                            
                            {hotel.amenities && hotel.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {hotel.amenities.slice(0, 3).map((amenity, index) => (
                                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {amenity}
                                  </span>
                                ))}
                                {hotel.amenities.length > 3 && (
                                  <span className="text-xs text-gray-400">+{hotel.amenities.length - 3} more</span>
                                )}
                              </div>
                            )}
                            
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-sm text-teal font-medium">View Details</span>
                              <span className="text-xs text-gray-400">Book Now</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">Plan Your Trip</h3>
                <div className="space-y-3">
                  <Link to={`/packages?country=${country.slug}`}>
                    <Button variant="primary" className="w-full">
                      View Packages
                    </Button>
                  </Link>
                  <Link to={`/group-trips?country=${country.slug}`}>
                    <Button variant="outline" className="w-full">
                      Join Group Trips
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="outline" className="w-full">
                      Custom Itinerary
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Accommodations */}
              {country?.accommodations && country.accommodations.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-playfair text-charcoal mb-6">Where to Stay</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {country.accommodations.slice(0, 6).map(hotel => (
                      <div key={hotel.id} className="flex space-x-3 p-2 border rounded hover:shadow-sm transition-shadow">
                        <img
                          src={getImageUrlWithFallback(hotel.image_url, IMAGE_VARIANTS.THUMBNAIL, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=100&q=80')}
                          alt={hotel.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-charcoal">{hotel.name}</h4>
                          {hotel.stars && (
                            <div className="flex text-yellow-400 text-xs">
                              {[...Array(hotel.stars)].map((_, i) => (
                                <span key={i}>⭐</span>
                              ))}
                            </div>
                          )}
                          {hotel.price_per_night && (
                            <p className="text-xs text-gray-600">From ${hotel.price_per_night}/night</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Travel Tips */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">Travel Tips</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <span className="text-teal">💡</span>
                    <p>Best time to visit varies by region - contact us for seasonal advice</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-teal">🛂</span>
                    <p>Check visa requirements before traveling</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-teal">💉</span>
                    <p>Consult your doctor about recommended vaccinations</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-teal">📱</span>
                    <p>Consider local SIM cards or international roaming plans</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CountryDetailPage;
