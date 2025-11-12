import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, DollarSign, Clock } from 'lucide-react';

// API Hooks
import { useSearch, type MeilisearchHit } from '../../lib/hooks/useSearch';

// Components
import Button from '../../components/ui/Button';

// Map index names to display names and routes
const INDEX_CONFIG: Record<string, { label: string; route: (slug: string) => string }> = {
  regions: {
    label: 'Regions',
    route: (slug) => `/destinations/${slug}`
  },
  countries: {
    label: 'Countries',
    route: (slug) => `/destinations/${slug}`
  },
  packages: {
    label: 'Packages',
    route: (slug) => `/packages/${slug}`
  },
  group_trips: {
    label: 'Group Trips',
    route: (slug) => `/group-trips/${slug}`
  },
  activities: {
    label: 'Activities',
    route: (slug) => `/activities/${slug}`
  },
  attractions: {
    label: 'Attractions',
    route: (slug) => `/attractions/${slug}`
  },
  accommodations: {
    label: 'Accommodations',
    route: (slug) => `/accommodations/${slug}`
  },
  blog_posts: {
    label: 'Blog Posts',
    route: (slug) => `/blog/${slug}`
  },
  hotel_types: {
    label: 'Hotel Types',
    route: (slug) => `/hotels/${slug}`
  },
  inclusions: {
    label: 'Inclusions',
    route: (slug) => `#`
  },
  exclusions: {
    label: 'Exclusions',
    route: (slug) => `#`
  },
};

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const [searchInput, setSearchInput] = useState(query);
  
  // Filter states
  const [selectedType, setSelectedType] = useState(type || 'all');
  
  // Map type from URL to index name
  const getIndexFromType = (type: string): string | undefined => {
    const typeMap: Record<string, string> = {
      'tours': 'packages',
      'group-trips': 'group_trips',
      'packages': 'packages',
      'things-to-do': 'activities',
      'hotels': 'accommodations',
      'flights': 'packages', // Fallback to packages
    };
    return type && type !== 'all' ? typeMap[type] : undefined;
  };
  
  const searchIndex = selectedType === 'all' ? undefined : getIndexFromType(selectedType);
  
  // Get search results
  const { data: searchResults, isLoading, error } = useSearch(query, searchIndex);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedType !== 'all') params.set('type', selectedType);
    setSearchParams(params);
  }, [query, selectedType, setSearchParams]);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const params = new URLSearchParams(searchParams);
      params.set('q', searchInput);
      setSearchParams(params);
    }
  };
  
  // Get all results from all indexes
  const allResults: Array<{ index: string; hit: MeilisearchHit }> = [];
  if (searchResults?.results) {
    Object.entries(searchResults.results).forEach(([index, results]) => {
      results.hits.forEach(hit => {
        allResults.push({ index, hit });
      });
    });
  }
  
  // Calculate total results
  const totalResults = allResults.length;
  
  // Get image URL for a hit
  const getImageUrl = (hit: MeilisearchHit, index: string): string => {
    if (hit.image_id) {
      return `https://imagedelivery.net/4J4CgzUI_LpQRpA_N1TErQ/${hit.image_id}/public`;
    }
    // Fallback to Unsplash based on type
    const searchTerm = hit.name || hit.title || index;
    return `https://source.unsplash.com/600x400/?${encodeURIComponent(searchTerm)}`;
  };
  
  // Get title for a hit
  const getTitle = (hit: MeilisearchHit): string => {
    return hit.name || hit.title || 'Untitled';
  };
  
  // Get description for a hit
  const getDescription = (hit: MeilisearchHit): string => {
    return hit.summary || hit.description || '';
  };
  
  // Render result card
  const renderResultCard = (index: string, hit: MeilisearchHit) => {
    const config = INDEX_CONFIG[index];
    if (!config) return null;
    
    const title = getTitle(hit);
    const description = getDescription(hit);
    const imageUrl = getImageUrl(hit, index);
    const route = config.route(hit.slug);
    
    return (
      <div key={`${index}-${hit.id}`} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <Link to={route}>
          <div className="relative h-48 overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://source.unsplash.com/600x400/?travel,${encodeURIComponent(title)}`;
              }}
            />
            <div className="absolute top-3 right-3 bg-teal text-paper px-3 py-1 rounded-full text-xs font-lato font-semibold">
              {config.label}
            </div>
          </div>
        </Link>
        <div className="p-5">
          <Link to={route} className="block">
            <h3 className="text-xl font-playfair font-bold text-charcoal hover:text-teal transition-colors mb-2 line-clamp-2">
              {title}
            </h3>
          </Link>
          {description && (
            <p className="text-charcoal/70 text-sm font-lato mb-4 line-clamp-3">
              {description}
            </p>
          )}
          
          {/* Additional metadata */}
          <div className="flex flex-wrap gap-3 text-xs text-charcoal/60 font-lato mb-4">
            {hit.price && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span>From ${hit.price}</span>
              </div>
            )}
            {hit.duration_days && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{hit.duration_days} days</span>
              </div>
            )}
            {hit.country_id && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>Destination</span>
              </div>
            )}
          </div>
          
          <Link to={route}>
            <Button variant="outline" className="w-full text-sm">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-paper min-h-screen">
      <Helmet>
        <title>{query ? `Search results for "${query}"` : 'Search'} | AllBounds Vacations</title>
        <meta name="description" content="Search for vacation packages, group trips, destinations, and more." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-playfair font-bold text-charcoal mb-2">
            {query ? `Search Results` : 'Search'}
          </h1>
          {query && (
            <p className="text-charcoal/70 font-lato">
              Showing results for <span className="font-semibold">"{query}"</span>
            </p>
          )}
        </div>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for destinations, packages, activities..."
                className="w-full pl-12 pr-4 py-3 border-2 border-teal/30 rounded-lg focus:outline-none focus:border-teal bg-white text-charcoal placeholder-charcoal/50 font-lato transition-colors"
                aria-label="Search query"
              />
            </div>
            <Button type="submit" className="md:w-auto bg-teal hover:bg-teal/90 text-paper px-8">
              Search
            </Button>
          </div>
        </form>
        
        {query && (
          <>
            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-charcoal" />
                <h2 className="text-lg font-playfair font-semibold text-charcoal">Filter Results</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-lato font-medium text-charcoal mb-2">Content Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-3 border-2 border-teal/30 rounded-lg focus:outline-none focus:border-teal bg-white text-charcoal font-lato"
                  >
                    <option value="all">All Types</option>
                    <option value="tours">Tours</option>
                    <option value="group-trips">Group Trips</option>
                    <option value="packages">Packages</option>
                    <option value="things-to-do">Things To Do</option>
                    <option value="hotels">Hotels</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Results */}
            <div>
              {isLoading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal"></div>
                  <p className="mt-4 text-charcoal/70 font-lato">Searching...</p>
                </div>
              ) : error ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-md">
                  <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-charcoal font-lato">Error performing search. Please try again later.</p>
                </div>
              ) : totalResults === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-md">
                  <div className="text-charcoal/40 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <p className="text-xl font-playfair font-semibold text-charcoal mb-2">No results found</p>
                  <p className="text-charcoal/70 font-lato">
                    No results found for "{query}". Try a different search term or adjust your filters.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-charcoal/70 font-lato">
                      <span className="font-semibold text-charcoal">{totalResults}</span> results found
                    </p>
                  </div>
                  
                  {/* Display results grouped by type */}
                  {Object.entries(searchResults?.results || {}).map(([index, results]) => {
                    const config = INDEX_CONFIG[index];
                    if (!config || results.hits.length === 0) return null;
                    
                    return (
                      <div key={index} className="mb-12">
                        <h2 className="text-2xl font-playfair font-bold text-charcoal mb-6 flex items-center gap-2">
                          {config.label}
                          <span className="text-sm font-lato font-normal text-charcoal/60">
                            ({results.hits.length})
                          </span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {results.hits.map((hit) => renderResultCard(index, hit))}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </>
        )}
        
        {!query && (
          <div className="text-center py-20">
            <Search className="w-20 h-20 mx-auto text-charcoal/20 mb-4" />
            <p className="text-xl font-playfair text-charcoal/70">
              Enter a search term to find destinations, packages, and more
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
