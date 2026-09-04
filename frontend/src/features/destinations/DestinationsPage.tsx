import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/seo/SeoHead';

// Components
import Button from '../../components/ui/Button';

// Utils
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

// Components
import { TextDisplay } from '../../components/ui/RichTextDisplay';

// API Hooks
import { useRegionsWithCountries, useCountries } from '../../lib/hooks/useDestinations';

const DestinationsPage: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // Fetch data from API
  const { data: regionsData, isLoading: isLoadingRegions, error: regionsError } = useRegionsWithCountries();
  const { data: countriesData, isLoading: isLoadingCountries } = useCountries();

  const regions = regionsData || [];

  return (
    <div className="bg-paper min-h-screen">
      <SeoHead
        title="Destinations"
        description="Discover amazing destinations across Africa and beyond. Explore countries, regions, and unique travel experiences."
        canonicalPath="/destinations"
      />

      {/* Hero Section */}
      <div className="bg-cover bg-center h-80 md:h-96 flex items-center justify-center relative"
        style={{ backgroundImage: 'url(/home-heros/hero1.jpeg)' }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="text-center text-white p-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-white mb-4 drop-shadow-xl">Discover Amazing Destinations</h1>
          <p className="text-xl md:text-2xl mb-8 font-light drop-shadow-md">Explore the beauty and culture of Africa and beyond</p>
          <Link to="/packages">
            <Button variant="primary" size="lg">
              Explore Packages
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Regions Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-playfair text-charcoal mb-4">Browse by Region</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRegion('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedRegion === 'All'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All Regions
            </button>
            {regions.map(region => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedRegion === region.name
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoadingRegions ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
            <p className="mt-2">Loading destinations...</p>
          </div>
        ) : regionsError ? (
          <div className="text-center py-12 text-red-500">
            <p>Error loading destinations. Please try again later.</p>
          </div>
        ) : (
          <>
            {/* Regions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regions
                .filter(region => selectedRegion === 'All' || region.name === selectedRegion)
                .map(region => (
                  <div key={region.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
                    <Link to={`/destinations/regions/${region.slug}`}>
                      <img
                        src={getImageUrlWithFallback(region.image_id || region.image_url, IMAGE_VARIANTS.LARGE, '/home-heros/hero2.webp')}
                        alt={region.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <div className="p-6 flex-1 flex flex-col">
                      <Link to={`/destinations/regions/${region.slug}`}>
                        <h3 className="text-xl font-playfair text-charcoal hover:text-hover transition-colors mb-3">
                          {region.name}
                        </h3>
                      </Link>
                      {region.description && (
                        <div className="text-gray-600 text-sm mb-4 line-clamp-3">
                          <TextDisplay content={region.description} />
                        </div>
                      )}

                      {/* Countries in Region */}
                      {region.countries && region.countries.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Countries:</h4>
                          <div className="flex flex-wrap gap-1">
                            {region.countries.slice(0, 4).map(country => (
                              <Link
                                key={country.id}
                                to={`/destinations/${country.slug}`}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                              >
                                {country.name}
                              </Link>
                            ))}
                            {region.countries.length > 4 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{region.countries.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <Link to={`/destinations/regions/${region.slug}`} className="mt-auto">
                        <Button variant="primary" className="w-full">
                          Explore Region
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>

            {/* Featured Countries Section */}
            <div className="mt-16">
              <h2 className="text-3xl font-playfair text-charcoal mb-8 text-center">Popular Countries</h2>
              {isLoadingCountries ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
                  <p className="mt-2">Loading countries...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(countriesData || [])
                    .filter(country => country.is_active)
                    .slice(0, 9)
                    .map(country => (
                      <div key={country.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
                        <Link to={`/destinations/${country.slug}`}>
                          <img
                            src={getImageUrlWithFallback(country.image_id || country.image_url, IMAGE_VARIANTS.LARGE, '/home-heros/hero1.jpeg')}
                            alt={country.name}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                        <div className="p-6 flex-1 flex flex-col">
                          <Link to={`/destinations/${country.slug}`}>
                            <h3 className="text-xl font-playfair text-charcoal hover:text-hover transition-colors mb-3">
                              {country.name}
                            </h3>
                          </Link>
                          {country.summary && (
                            <div className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                              <TextDisplay content={country.summary} />
                            </div>
                          )}
                          <Link to={`/destinations/${country.slug}`} className="mt-auto">
                            <Button variant="outline" size="sm" className="w-full">
                              Explore {country.name}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DestinationsPage;
