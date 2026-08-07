import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import SeoHead from '../../../components/seo/SeoHead';
import { useAttractions } from '../../../lib/hooks/useAttractions';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../utils/imageUtils';

const AttractionListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [selectedCountry, setSelectedCountry] = useState(() => searchParams.get('country') || '');
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || '');

  const filterParams = useMemo(() => ({
    search: searchTerm.trim() || undefined,
    country: selectedCountry || undefined,
    category: selectedCategory || undefined,
  }), [searchTerm, selectedCountry, selectedCategory]);

  const { data: filteredAttractions = [], isLoading, error } = useAttractions(filterParams);
  const { data: allAttractions = [] } = useAttractions(
    { limit: 1000 },
    {
      queryKey: ['attractions', null, null, null, null, 1000],
      staleTime: 5 * 60 * 1000,
    }
  );

  const updateFiltersInUrl = useCallback((updates: { search?: string; country?: string; category?: string }) => {
    const params = new URLSearchParams(searchParams);

    if (updates.search !== undefined) {
      if (updates.search) {
        params.set('search', updates.search);
      } else {
        params.delete('search');
      }
    }

    if (updates.country !== undefined) {
      if (updates.country) {
        params.set('country', updates.country);
      } else {
        params.delete('country');
      }
    }

    if (updates.category !== undefined) {
      if (updates.category) {
        params.set('category', updates.category);
      } else {
        params.delete('category');
      }
    }

    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCountry = searchParams.get('country') || '';
    const urlCategory = searchParams.get('category') || '';

    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }

    if (urlCountry !== selectedCountry) {
      setSelectedCountry(urlCountry);
    }

    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [searchParams, searchTerm, selectedCountry, selectedCategory]);

  const countries = useMemo(() => {
    if (!allAttractions.length) return [] as { value: string; label: string }[];

    const map = new Map<string, { value: string; label: string }>();

    allAttractions.forEach((attraction) => {
      const slug = attraction.country?.slug;
      const name = attraction.country?.name;

      if (slug && name) {
        if (!map.has(slug)) {
          map.set(slug, { value: slug, label: name });
        }
      } else if (name) {
        // fallback if slug missing
        if (!map.has(name)) {
          map.set(name, { value: name, label: name });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [allAttractions]);
  const categories = useMemo(
    () => Array.from(new Set(allAttractions.map((attraction) => attraction.category).filter(Boolean))) || [],
    [allAttractions]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    updateFiltersInUrl({ search: value });
  };

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedCountry(value);
    updateFiltersInUrl({ country: value });
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedCategory(value);
    updateFiltersInUrl({ category: value });
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };


  if (isLoading) {
    return (
      <>
        <SeoHead
          title="Attractions"
          description="Explore museums, parks, monuments, and unique experiences across our destination network."
          canonicalPath="/attractions"
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
          title="Attractions"
          description="Explore museums, parks, monuments, and unique experiences across our destination network."
          canonicalPath="/attractions"
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to load attractions</h2>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title="Attractions"
        description="Explore museums, parks, monuments, and unique experiences across our destination network."
        canonicalPath="/attractions"
      />
      <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white via-gray-50/50 to-gray-50 border-b border-gray-200/80 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-primary uppercase mb-3">
              <span className="w-6 h-[2px] bg-primary/60 rounded-full" />
              DESTINATIONS & LANDMARKS
              <span className="w-6 h-[2px] bg-primary/60 rounded-full" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-playfair text-charcoal mb-4 tracking-tight leading-tight">
              Discover Iconic Sights & Natural Wonders
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-sans leading-relaxed mb-3">
              Explore famous landmarks, national parks, historical monuments, and hidden gems across our destination network.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 font-sans leading-relaxed">
              Whether you are planning a day tour, a cultural walk, or a scenic safari stopover, browse our curated list of attractions to enrich your itinerary. Use the search and category filters below to explore by region or interest.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                placeholder="Search attractions..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Country Filter */}
            <select
              value={selectedCountry}
              onChange={handleCountryChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Results Count */}
            <div className="flex items-center text-sm text-gray-500">
              {filteredAttractions.length} attraction{filteredAttractions.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </div>

      {/* Attractions Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-4 lg:px-6 xl:px-8 py-8">
        {filteredAttractions.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attractions found</h3>
            <p className="text-gray-500">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAttractions.map((attraction) => (
              <div key={attraction.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <Link to={`/attractions/${attraction.slug}`} className="block h-48 md:h-56 overflow-hidden">
                  <img
                    src={getImageUrlWithFallback(attraction.cover_image || attraction.image_id, IMAGE_VARIANTS.MEDIUM, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')}
                    alt={attraction.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 h-14">
                    {attraction.name}
                  </h3>
                  {attraction.description ? (
                    <div
                      className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(attraction.description) }}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                      No description available.
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                    <p className="text-lg font-bold text-teal-600">
                      {attraction.price ? `${formatPrice(attraction.price)}` : 'Free'}
                    </p>
                    <Link
                      to={`/attractions/${attraction.slug}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default AttractionListPage;
