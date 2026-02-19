import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';

// Components
import Breadcrumb from '../../components/layout/Breadcrumb';
import Button from '../../components/ui/Button';
import { TextDisplay } from '../../components/ui/RichTextDisplay';

// Utils
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

// API
import { apiClient, endpoints } from '../../lib/api';
import type { RegionWithCountries, Package, GroupTrip } from '../../lib/types/api';


const RegionDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch region details with countries
  const { data: region, isLoading, error } = useQuery<RegionWithCountries>({
    queryKey: ['region', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Region slug is required');
      const response = await apiClient.get<RegionWithCountries>(endpoints.regions.bySlugWithCountries(slug));
      return response;
    },
  });

  // Fetch packages for all countries in the region
  const { data: packages, isLoading: isLoadingPackages } = useQuery<Package[]>({
    queryKey: ['region-packages', slug],
    queryFn: async () => {
      if (!region?.countries?.length) return [];

      // Get packages for each country and combine them
      const packagePromises = region.countries.map(country =>
        apiClient.get<Package[]>(endpoints.packages.byCountry(country.id))
      );

      const packageArrays = await Promise.all(packagePromises);
      const allPackages = packageArrays.flat();

      // Remove duplicates and limit to 6
      const uniquePackages = allPackages.filter((pkg, index, self) =>
        index === self.findIndex(p => p.id === pkg.id)
      );

      return uniquePackages.slice(0, 6);
    },
    enabled: !!region?.countries?.length,
  });

  // Fetch group trips for all countries in the region
  const { data: groupTrips, isLoading: isLoadingGroupTrips } = useQuery<GroupTrip[]>({
    queryKey: ['region-group-trips', slug],
    queryFn: async () => {
      if (!region?.countries?.length) return [];

      // Get group trips for each country and combine them
      const groupTripPromises = region.countries.map(country =>
        apiClient.get<GroupTrip[]>(endpoints.groupTrips.byCountry(country.id))
      );

      const groupTripArrays = await Promise.all(groupTripPromises);
      const allGroupTrips = groupTripArrays.flat();

      // Remove duplicates and limit to 6
      const uniqueGroupTrips = allGroupTrips.filter((trip, index, self) =>
        index === self.findIndex(t => t.id === trip.id)
      );

      return uniqueGroupTrips.slice(0, 6);
    },
    enabled: !!region?.countries?.length,
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

  if (error || !region) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>Error loading region details. Please try again later.</p>
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
        <title>{region.name} | AllBounds Vacations</title>
        <meta name="description" content={region.description || `Explore ${region.name} with AllBounds Vacations`} />
        <meta property="og:title" content={`${region.name} | AllBounds Vacations`} />
        <meta property="og:description" content={region.description || `Explore ${region.name} with AllBounds Vacations`} />
        <meta property="og:image" content={getImageUrlWithFallback(region.image_id || region.image_url, IMAGE_VARIANTS.LARGE, 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')} />
      </Helmet>

      <div className="bg-paper min-h-screen">
        {/* Hero Section */}
        <div className="relative h-96 md:h-[500px]">
          <img
            src={getImageUrlWithFallback(region.image_id || region.image_url, IMAGE_VARIANTS.LARGE, 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')}
            alt={region.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <h1 className="text-4xl md:text-6xl font-playfair text-white mb-4">{region.name}</h1>
              {region.description && (
                <div className="text-lg md:text-xl text-white max-w-2xl line-clamp-3 bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-white/10 shadow-lg">
                  <TextDisplay
                    content={region.description}
                    className="[&_p]:!text-white [&_h1]:!text-white [&_h2]:!text-white [&_h3]:!text-white [&_li]:!text-white [&_strong]:!text-white [&_span]:!text-white text-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={
              window.location.pathname.startsWith('/regions/')
                ? [
                  { label: 'Regions', path: '/regions' },
                  { label: region.name },
                ]
                : [
                  { label: 'Destinations', path: '/destinations' },
                  { label: 'Regions', path: '/regions' },
                  { label: region.name },
                ]
            }
            className="mb-8"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Region Overview */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-playfair text-charcoal mb-4">About {region.name}</h2>
                {region.description && (
                  <div className="text-gray-700 leading-relaxed mb-6">
                    <TextDisplay content={region.description} />
                  </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{region.countries?.length || 0}</div>
                    <div className="text-sm text-gray-600">Countries</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">50+</div>
                    <div className="text-sm text-gray-600">Destinations</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">100+</div>
                    <div className="text-sm text-gray-600">Experiences</div>
                  </div>
                </div>
              </div>

              {/* Countries in Region */}
              {region.countries && region.countries.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <h2 className="text-2xl font-playfair text-charcoal mb-6">Countries in {region.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {region.countries.map(country => (
                      <Link
                        key={country.id}
                        to={`/destinations/countries/${country.slug}`}
                        className="group block"
                      >
                        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="relative h-48">
                            <img
                              src={getImageUrlWithFallback(country.image_id, IMAGE_VARIANTS.MEDIUM, 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')}
                              alt={country.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="text-white font-playfair text-xl group-hover:text-butter transition-colors">
                                {country.name}
                              </h3>
                            </div>
                          </div>
                          <div className="p-4">
                            {country.description && (
                              <div className="text-gray-600 text-sm line-clamp-3">
                                <TextDisplay content={country.description} />
                              </div>
                            )}
                            <div className="mt-3 flex justify-between items-center">
                              <span className="text-primary font-medium text-sm">Explore {country.name}</span>
                              <svg className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Packages */}
              {packages && packages.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-playfair text-charcoal">Featured Packages</h2>
                    <Link to={`/packages?region=${region.slug}`}>
                      <Button variant="outline" size="sm">
                        View All Packages
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map(pkg => (
                      <Link
                        key={pkg.id}
                        to={`/packages/${pkg.slug}`}
                        className="group block"
                      >
                        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="relative h-48">
                            <img
                              src={getImageUrlWithFallback(pkg.image_id || pkg.image_url, IMAGE_VARIANTS.MEDIUM, 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')}
                              alt={pkg.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="text-white font-playfair text-lg group-hover:text-butter transition-colors line-clamp-2">
                                {pkg.name}
                              </h3>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-primary font-semibold">${pkg.price}</span>
                              <span className="text-sm text-gray-600">{pkg.duration_days} days</span>
                            </div>
                            {pkg.summary && (
                              <div
                                className="text-gray-600 text-sm line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pkg.summary) }}
                              />
                            )}
                            <div className="mt-3 flex justify-between items-center">
                              <span className="text-primary font-medium text-sm">View Package</span>
                              <svg className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Group Trips */}
              {groupTrips && groupTrips.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-playfair text-charcoal">Join Group Adventures</h2>
                    <Link to={`/group-trips?region=${region.slug}`}>
                      <Button variant="outline" size="sm">
                        View All Group Trips
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupTrips.map(trip => (
                      <Link
                        key={trip.id}
                        to={`/group-trips/${trip.slug}`}
                        className="group block"
                      >
                        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="relative h-48">
                            <img
                              src={getImageUrlWithFallback(trip.image_id || trip.image_url, IMAGE_VARIANTS.MEDIUM, 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')}
                              alt={trip.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="text-white font-playfair text-lg group-hover:text-butter transition-colors line-clamp-2">
                                {trip.name}
                              </h3>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-primary font-semibold">From ${trip.price}</span>
                              <span className="text-sm text-gray-600">{trip.duration_days} days</span>
                            </div>
                            {trip.summary && (
                              <div
                                className="text-gray-600 text-sm line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(trip.summary) }}
                              />
                            )}
                            <div className="mt-3 flex justify-between items-center">
                              <span className="text-primary font-medium text-sm">View Group Trip</span>
                              <svg className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Experiences */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-playfair text-charcoal mb-6">Popular Experiences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl">🦁</div>
                    <div>
                      <h3 className="font-semibold text-charcoal">Wildlife Safaris</h3>
                      <p className="text-sm text-gray-600">Experience incredible wildlife in their natural habitat</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl">🏔️</div>
                    <div>
                      <h3 className="font-semibold text-charcoal">Mountain Adventures</h3>
                      <p className="text-sm text-gray-600">Conquer peaks and enjoy breathtaking views</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl">🏖️</div>
                    <div>
                      <h3 className="font-semibold text-charcoal">Beach Escapes</h3>
                      <p className="text-sm text-gray-600">Relax on pristine beaches and crystal waters</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl">🎭</div>
                    <div>
                      <h3 className="font-semibold text-charcoal">Cultural Tours</h3>
                      <p className="text-sm text-gray-600">Immerse yourself in local traditions and history</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">Explore {region.name}</h3>
                <div className="space-y-4">
                  <Link to={`/packages?region=${region.slug}`} className="block">
                    <Button variant="primary" className="w-full">
                      View All Packages
                    </Button>
                  </Link>
                  <Link to={`/group-trips?region=${region.slug}`} className="block">
                    <Button variant="outline" className="w-full">
                      Join Group Adventures
                    </Button>
                  </Link>
                  <Link to="/contact" className="block">
                    <Button variant="outline" className="w-full">
                      Plan Custom Trip
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Region Highlights */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">Region Highlights</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-teal text-xl">🌍</div>
                    <div>
                      <h4 className="font-medium text-charcoal">Diverse Landscapes</h4>
                      <p className="text-sm text-gray-600">From savannas to mountains, experience varied terrains</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-teal text-xl">🦒</div>
                    <div>
                      <h4 className="font-medium text-charcoal">Unique Wildlife</h4>
                      <p className="text-sm text-gray-600">Home to some of the world's most iconic animals</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-teal text-xl">🏛️</div>
                    <div>
                      <h4 className="font-medium text-charcoal">Rich Heritage</h4>
                      <p className="text-sm text-gray-600">Ancient cultures and historical sites</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-teal text-xl">🌅</div>
                    <div>
                      <h4 className="font-medium text-charcoal">Adventure Awaits</h4>
                      <p className="text-sm text-gray-600">Endless opportunities for exploration</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Travel Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">Travel Information</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <span className="text-teal">🌡️</span>
                    <p>Climate varies by country and season - check specific destinations</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-teal">🛂</span>
                    <p>Visa requirements differ by country - verify before travel</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-teal">💰</span>
                    <p>Multiple currencies used across the region</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-teal">🗣️</span>
                    <p>English widely spoken, plus local languages</p>
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

export default RegionDetailPage;
