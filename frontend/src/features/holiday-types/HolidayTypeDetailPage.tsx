import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import CloudflareImage from '../../components/ui/CloudflareImage';

// API Hooks
import { useHolidayTypeBySlug } from '../../lib/hooks/useHolidayTypes';

// Components
import Breadcrumb from '../../components/layout/Breadcrumb';
import Card from '../../components/data/Card';
import Media from '../../components/data/Media';

// Mock data for featured destinations, packages, and group trips
const mockFeaturedDestinations = [
  {
    id: '1',
    name: 'Kenya',
    slug: 'kenya',
    image: 'https://source.unsplash.com/random/600x400/?kenya',
    description: 'Experience the magic of safari in Kenya',
    type: 'country' as const
  },
  {
    id: '2',
    name: 'Tanzania',
    slug: 'tanzania',
    image: 'https://source.unsplash.com/random/600x400/?tanzania',
    description: 'Home to the Serengeti and Mount Kilimanjaro',
    type: 'country' as const
  }
];

const mockPackages = [
  {
    id: '1',
    title: 'Safari Adventure',
    slug: 'safari-adventure',
    description: 'Explore the wildlife of East Africa',
    image: 'https://source.unsplash.com/random/600x400/?safari',
    duration: 7,
    price: 2499,
    country: {
      name: 'Kenya',
      slug: 'kenya'
    }
  },
  {
    id: '2',
    title: 'Beach Getaway',
    slug: 'beach-getaway',
    description: 'Relax on the pristine beaches of Zanzibar',
    image: 'https://source.unsplash.com/random/600x400/?beach',
    duration: 5,
    price: 1899,
    country: {
      name: 'Tanzania',
      slug: 'tanzania'
    }
  }
];

const mockGroupTrips = [
  {
    id: '1',
    title: 'Group Safari',
    slug: 'group-safari',
    description: 'Join our group safari adventure',
    image: 'https://source.unsplash.com/random/600x400/?group,safari',
    startDate: '2025-11-15',
    endDate: '2025-11-22',
    price: 2199
  },
  {
    id: '2',
    title: 'Beach Retreat',
    slug: 'beach-retreat',
    description: 'Group beach vacation with activities',
    image: 'https://source.unsplash.com/random/600x400/?group,beach',
    startDate: '2025-12-10',
    endDate: '2025-12-17',
    price: 1799
  }
];

const HolidayTypeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Fetch holiday type details
  const { data: holidayType, isLoading, error } = useHolidayTypeBySlug(slug || '');
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
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
  
  if (error || !holidayType) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>Error loading holiday type details. Please try again later.</p>
          <Link to="/holiday-types" className="text-red-700 underline mt-2 inline-block">
            Back to Holiday Types
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{holidayType.name} Holidays | AllBounds Vacations</title>
        <meta name="description" content={holidayType.description || ''} />
        <meta property="og:title" content={`${holidayType.name} Holidays | AllBounds Vacations`} />
        <meta property="og:description" content={holidayType.description || ''} />
        <meta property="og:image" content={`https://source.unsplash.com/random/1200x630/?${holidayType.name.toLowerCase()}`} />
      </Helmet>
      
      {/* Hero Banner */}
      <div className="relative h-96 mb-8">
        <div className="absolute inset-0">
          {holidayType.image_id ? (
            <CloudflareImage
              imageId={holidayType.image_id}
              variant="thumbnail"
              alt={holidayType.name}
              className="w-full h-full"
              objectFit="cover"
              placeholder={`https://source.unsplash.com/random/1600x900/?${holidayType.name.toLowerCase()}`}
            />
          ) : (
            <img
              src={`https://source.unsplash.com/random/1600x900/?${holidayType.name.toLowerCase()}`}
              alt={holidayType.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12 relative">
          <Breadcrumb
            items={[
              { label: 'Holiday Types', path: '/holiday-types' },
              { label: holidayType.name },
            ]}
            className="mb-4 text-white"
          />
          <h1 className="text-4xl md:text-5xl font-playfair text-white mb-4">{holidayType.name} Holidays</h1>
          <p className="text-lg text-white/90 max-w-2xl">{holidayType.description}</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="prose prose-lg mx-auto">
            <p>{holidayType.description}</p>
          </div>
        </div>
        
        {/* Featured Destinations */}
        {mockFeaturedDestinations.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-playfair text-charcoal mb-6">Featured Destinations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockFeaturedDestinations.map((destination) => (
                <Link
                  key={destination.id}
                  to={`/${destination.type === 'country' ? 'countries' : 'regions'}/${destination.slug}`}
                  className="group block"
                >
                  <Media
                    src={destination.image}
                    alt={destination.name}
                    aspectRatio="4:3"
                    overlay={
                      <div>
                        <h3 className="text-xl font-playfair font-medium mb-1 group-hover:text-butter transition-colors">
                          {destination.name}
                        </h3>
                        <p className="text-sm text-white/90 line-clamp-2">
                          {destination.description}
                        </p>
                      </div>
                    }
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Packages */}
        {mockPackages.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-playfair text-charcoal mb-6">
              {holidayType.name} Packages
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockPackages.map((pkg) => (
                <Card
                  key={pkg.id}
                  title={pkg.title}
                  image={pkg.image}
                  description={`${pkg.duration} days in ${pkg.country.name}`}
                  badge={`$${pkg.price}`}
                  link={`/packages/${pkg.slug}`}
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to={`/packages?holidayType=${holidayType.slug}`}
                className="inline-block bg-charcoal hover:bg-hover text-white px-6 py-3 rounded-md transition-colors"
              >
                View All {holidayType.name} Packages
              </Link>
            </div>
          </div>
        )}
        
        {/* Group Trips */}
        {mockGroupTrips.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-playfair text-charcoal mb-6">
              {holidayType.name} Group Trips
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockGroupTrips.map((trip) => (
                <Card
                  key={trip.id}
                  title={trip.title}
                  image={trip.image}
                  description={`${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`}
                  badge={`$${trip.price}`}
                  link={`/group-trips/${trip.slug}`}
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to={`/group-trips?holidayType=${holidayType.slug}`}
                className="inline-block bg-charcoal hover:bg-hover text-white px-6 py-3 rounded-md transition-colors"
              >
                View All {holidayType.name} Group Trips
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HolidayTypeDetailPage;
