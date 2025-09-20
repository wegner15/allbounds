import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';

// API Hooks
import { useSearch } from '../../lib/hooks/useSearch';

// Components
import Button from '../../components/ui/Button';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  
  // Filter states
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || 'all');
  
  // Get search results
  const { data: searchResults, isLoading, error } = useSearch(query);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedType !== 'all') params.set('type', selectedType);
    if (selectedRegion !== 'all') params.set('region', selectedRegion);
    setSearchParams(params);
  }, [query, selectedType, selectedRegion, setSearchParams]);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const params = new URLSearchParams(searchParams);
      params.set('q', searchInput);
      setSearchParams(params);
    }
  };
  
  // Filter results by type
  const filteredResults = searchResults?.items.filter(result => {
    if (selectedType === 'all') return true;
    return result.type === selectedType;
  }) || [];
  
  // Group results by type for display
  const groupedResults = filteredResults.reduce((acc, result) => {
    const type = result.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(result);
    return acc;
  }, {} as Record<string, typeof filteredResults>);
  
  return (
    <div className="bg-paper min-h-screen">
      <Helmet>
        <title>{query ? `Search results for "${query}"` : 'Search'} | AllBounds Vacations</title>
        <meta name="description" content="Search for vacation packages, group trips, destinations, and more." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-playfair mb-6">Search</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for destinations, packages, activities..."
              className="flex-grow p-3 border border-gray-300 rounded"
              aria-label="Search query"
            />
            <Button type="submit" variant="primary" className="md:w-auto">
              Search
            </Button>
          </div>
        </form>
        
        {query && (
          <>
            {/* Filters */}
            <div className="bg-white p-4 rounded shadow mb-6">
              <h2 className="text-lg font-medium mb-4">Filter Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Content Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="all">All Types</option>
                    <option value="package">Packages</option>
                    <option value="group_trip">Group Trips</option>
                    <option value="country">Countries</option>
                    <option value="region">Regions</option>
                    <option value="holiday_type">Holiday Types</option>
                    <option value="blog_post">Blog Posts</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Region</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="all">All Regions</option>
                    <option value="africa">Africa</option>
                    <option value="asia">Asia</option>
                    <option value="europe">Europe</option>
                    <option value="middle_east">Middle East</option>
                    <option value="americas">Americas</option>
                    <option value="oceania">Oceania</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Results */}
            <div>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
                  <p className="mt-2">Searching...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">
                  <p>Error performing search. Please try again later.</p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-12">
                  <p>No results found for "{query}". Try a different search term or adjust your filters.</p>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-gray-600">{filteredResults.length} results found for "{query}"</p>
                  
                  {/* Display results grouped by type */}
                  {Object.entries(groupedResults).map(([type, results]) => (
                    <div key={type} className="mb-8">
                      <h2 className="text-xl font-medium mb-4 capitalize">
                        {type.replace('_', ' ')}s ({Array.isArray(results) ? results.length : 0})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.isArray(results) && results.map((result) => (
                          <div key={`${result.type}-${result.id}`} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <Link to={result.url}>
                              <img
                                src={result.image_url || `https://source.unsplash.com/random/600x400/?${result.title.toLowerCase()}`}
                                alt={result.title}
                                className="w-full h-48 object-cover"
                              />
                            </Link>
                            <div className="p-4">
                              <Link to={result.url} className="block">
                                <h3 className="text-lg font-medium text-charcoal hover:text-hover transition-colors mb-2">
                                  {result.title}
                                </h3>
                              </Link>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{result.description}</p>
                              
                              {/* Highlight matches */}
                              {result.highlights && result.highlights.length > 0 && (
                                <div className="mb-3 text-sm">
                                  <p className="font-medium mb-1">Matches:</p>
                                  <ul className="list-disc pl-5">
                                    {result.highlights.map((highlight, index) => (
                                      <li key={index} className="text-gray-600">
                                        <span dangerouslySetInnerHTML={{ __html: highlight }} />
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-charcoal">
                                  {type.replace('_', ' ')}
                                </span>
                                <span className="text-sm text-gray-500">
                                  Score: {Math.round(result.score * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
