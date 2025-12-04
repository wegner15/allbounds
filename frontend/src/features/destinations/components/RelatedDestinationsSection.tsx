import React from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCountriesByRegion } from '../../../lib/hooks/useCountries';
import { apiClient, endpoints } from '../../../lib/api';
import DestinationCard from './DestinationCard';
import type { CountryWithDetails } from '../../../lib/types/api';

interface RelatedDestinationsSectionProps {
  country: CountryWithDetails;
}

const RelatedDestinationsSection: React.FC<RelatedDestinationsSectionProps> = ({ country }) => {
  const queryClient = useQueryClient();
  
  // Don't render if country doesn't have a region
  if (!country || !country.region || !country.region_id) {
    return null;
  }
  
  // Fetch countries from the same region
  const { data: regionCountries, isLoading } = useCountriesByRegion(country.region_id);

  // Prefetch destination details on hover
  const handlePrefetch = React.useCallback((slug: string) => {
    queryClient.prefetchQuery({
      queryKey: ['country-details', slug],
      queryFn: async () => {
        return apiClient.get<CountryWithDetails>(endpoints.countries.bySlugWithDetails(slug));
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [queryClient]);

  // Filter out the current country and limit to 4 destinations
  const relatedDestinations = React.useMemo(() => {
    if (!regionCountries) return [];
    
    return regionCountries
      .filter(dest => dest.id !== country.id && dest.is_active)
      .slice(0, 4);
  }, [regionCountries, country.id]);

  // Don't render if no related destinations or still loading
  if (isLoading || !relatedDestinations || relatedDestinations.length === 0) {
    return null;
  }

  return (
    <section 
      className="bg-white rounded-lg shadow-sm p-6 md:p-8"
      aria-labelledby="related-destinations-title"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Globe className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 
              id="related-destinations-title"
              className="text-2xl md:text-3xl font-playfair font-bold text-gray-900"
            >
              Related Destinations
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Explore more destinations in {country.region.name}
            </p>
          </div>
        </div>

        {/* View All Link - Show if there are more countries in the region */}
        {regionCountries && regionCountries.length > 5 && (
          <Link
            to={`/regions/${country.region.slug}`}
            className="hidden md:flex items-center space-x-2 text-teal-600 hover:text-teal-700 font-medium transition-colors group"
            aria-label={`View all destinations in ${country.region.name}`}
          >
            <span>View All</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Destinations Grid - 4 columns on desktop, 2 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedDestinations.map((destination) => (
          <div 
            key={destination.id}
            onMouseEnter={() => handlePrefetch(destination.slug)}
          >
            <DestinationCard destination={destination} />
          </div>
        ))}
      </div>

      {/* Mobile View All Button */}
      {regionCountries && regionCountries.length > 5 && (
        <div className="mt-6 md:hidden">
          <Link
            to={`/regions/${country.region.slug}`}
            className="flex items-center justify-center space-x-2 w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
            aria-label={`View all destinations in ${country.region.name}`}
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {/* Destination Count Info */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600 text-center">
          Showing {relatedDestinations.length} of {regionCountries.filter(c => c.id !== country.id && c.is_active).length} destinations in {country.region.name}
        </p>
      </div>
    </section>
  );
};

export default RelatedDestinationsSection;
