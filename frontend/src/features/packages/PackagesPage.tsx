import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Components
import Button from '../../components/ui/Button';
import PackageCarousel from '../../components/ui/PackageCarousel';

// API Hooks
import { usePackages } from '../../lib/hooks/usePackages';
import { useFeaturedPackages } from '../../lib/hooks/usePackages';
import { useCountries } from '../../lib/hooks/useCountries';
import { useHolidayTypes } from '../../lib/hooks/useHolidayTypes';
import { useActivePackagePriceCharts } from '../../lib/hooks/usePackagePriceCharts';


// Utils
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

// Filter options
const priceRanges = ['All', '$0-$1000', '$1000-$2000', '$2000-$3000', '$3000+'];
const durations = ['All', '1-3 days', '4-7 days', '8-14 days', '14+ days'];

// Component for package price display
const PackagePriceDisplay: React.FC<{ packageId: number; basePrice: number }> = ({ packageId, basePrice }) => {
  const { data: priceCharts } = useActivePackagePriceCharts(packageId);

  const lowestPrice = priceCharts && priceCharts.length > 0
    ? Math.min(...priceCharts.map(chart => chart.price))
    : basePrice;

  return (
    <div>
      <span className="font-bold text-lg">From ${lowestPrice.toFixed(2)}</span>
      <span className="text-gray-600 text-sm"> / person</span>
    </div>
  );
};

const PackagesPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedHolidayType, setSelectedHolidayType] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  
  // Fetch data from API
  const { data: packagesData, isLoading: isLoadingPackages, error: packagesError } = usePackages();
  const { data: featuredPackagesData, isLoading: isLoadingFeaturedPackages } = useFeaturedPackages(10);
  const { data: countriesData, isLoading: isLoadingCountries } = useCountries();
  const { data: holidayTypesData, isLoading: isLoadingHolidayTypes } = useHolidayTypes();

  // State for hero packages (featured or latest)
  const [heroPackages, setHeroPackages] = useState([]);

  // Determine hero packages: featured first, then latest
  useEffect(() => {
    if (featuredPackagesData && featuredPackagesData.length > 0) {
      setHeroPackages(featuredPackagesData);
    } else if (packagesData && packagesData.length > 0) {
      // Fallback to latest packages ordered by creation date
      const latestPackages = [...packagesData]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
      setHeroPackages(latestPackages);
    }
  }, [featuredPackagesData, packagesData]);
  
  // Prepare filter options from API data
  const countryOptions = !isLoadingCountries && countriesData 
    ? ['All', ...countriesData.map(country => country.name)]
    : ['All'];
    
  const holidayTypeOptions = !isLoadingHolidayTypes && holidayTypesData
    ? ['All', ...holidayTypesData.map(type => type.name)]
    : ['All'];
  
  // Pagination
  const packagesPerPage = 6;
  const packages = packagesData || [];
  const totalPackages = packages.length;
  const totalPages = Math.ceil(totalPackages / packagesPerPage);
  
  // Apply filters
  const filteredPackages = packages.filter(pkg => {
    // Country filter
    if (selectedCountry !== 'All' && pkg.country?.name !== selectedCountry) return false;
    
    // Holiday type filter
    if (selectedHolidayType !== 'All') {
      const packageHolidayTypes = pkg.holiday_types?.map(ht => ht.name) || [];
      if (!packageHolidayTypes.includes(selectedHolidayType)) return false;
    }
    
    // Price range filter
    if (selectedPriceRange !== 'All') {
      const [min, max] = selectedPriceRange
        .replace('$', '')
        .split('-')
        .map(val => val === '+' ? Infinity : parseInt(val));
      
      if (pkg.price < min || pkg.price > max) return false;
    }
    
    // Duration filter
    if (selectedDuration !== 'All') {
      const [min, max] = selectedDuration
        .split(' ')[0]
        .split('-')
        .map(val => val === '+' ? Infinity : parseInt(val));
      
      if (pkg.duration_days < min || pkg.duration_days > max) return false;
    }
    
    return true;
  });
  
  // Get current packages
  const indexOfLastPackage = currentPage * packagesPerPage;
  const indexOfFirstPackage = indexOfLastPackage - packagesPerPage;
  const currentPackages = filteredPackages.slice(indexOfFirstPackage, indexOfLastPackage);
  
  // Change page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCountry('All');
    setSelectedHolidayType('All');
    setSelectedPriceRange('All');
    setSelectedDuration('All');
    setCurrentPage(1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section - Package Carousel */}
      <PackageCarousel
        packages={heroPackages}
        isLoading={isLoadingFeaturedPackages || isLoadingPackages}
        className="h-80 md:h-96"
        autoPlay={true}
        autoPlayInterval={6000}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Find Your Perfect Package</h2>
                <p className="text-sm text-gray-600">Refine your search with these filters</p>
              </div>
            </div>
            <Button
              onClick={handleResetFilters}
              variant="secondary"
              className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Destination Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Destination
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 appearance-none pr-10"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  disabled={isLoadingCountries}
                >
                  {countryOptions.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Holiday Type Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Holiday Type
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 appearance-none pr-10"
                  value={selectedHolidayType}
                  onChange={(e) => setSelectedHolidayType(e.target.value)}
                  disabled={isLoadingHolidayTypes}
                >
                  {holidayTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Price Range
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 appearance-none pr-10"
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                >
                  {priceRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Duration Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Duration
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 appearance-none pr-10"
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                >
                  {durations.map(duration => (
                    <option key={duration} value={duration}>{duration}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(selectedCountry !== 'All' || selectedHolidayType !== 'All' || selectedPriceRange !== 'All' || selectedDuration !== 'All') && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Active filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedCountry !== 'All' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                        {selectedCountry}
                      </span>
                    )}
                    {selectedHolidayType !== 'All' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                        {selectedHolidayType}
                      </span>
                    )}
                    {selectedPriceRange !== 'All' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                        {selectedPriceRange}
                      </span>
                    )}
                    {selectedDuration !== 'All' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                        {selectedDuration}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Results */}
        <div className="mt-8">
          {isLoadingPackages ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
              <p className="mt-2">Loading packages...</p>
            </div>
          ) : packagesError ? (
            <div className="text-center py-12 text-red-500">
              <p>Error loading packages. Please try again later.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">{filteredPackages.length} packages found</p>
              
              {filteredPackages.length === 0 ? (
                <div className="text-center py-12">
                  <p>No packages match your filters. Try adjusting your criteria.</p>
                  <Button onClick={handleResetFilters} variant="primary" className="mt-4">
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentPackages.map(pkg => (
                    <div key={pkg.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <Link to={`/packages/${pkg.slug}`}>
                         <img
                           src={getImageUrlWithFallback(pkg.image_id, IMAGE_VARIANTS.MEDIUM)}
                           alt={pkg.name}
                           className="w-full h-64 object-cover"
                         />
                      </Link>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          {pkg.country && (
                            <div className="flex items-center text-sm font-medium text-gray-700">
                              <svg className="w-4 h-4 mr-1 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {pkg.country.name}
                            </div>
                          )}
                          {pkg.holiday_types && pkg.holiday_types.length > 0 && (
                            <span className="inline-block bg-butter text-charcoal text-xs px-2 py-1 rounded font-medium">
                              {pkg.holiday_types[0].name}
                            </span>
                          )}
                        </div>
                        <Link to={`/packages/${pkg.slug}`} className="block">
                          <h3 className="text-lg font-medium text-charcoal hover:text-hover transition-colors mb-2">
                            {pkg.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.summary || pkg.description}</p>
                        <div className="flex justify-between items-center">
                          <PackagePriceDisplay packageId={pkg.id} basePrice={pkg.price} />
                          <div className="text-sm text-gray-600">{pkg.duration_days} days</div>
                        </div>
                        {pkg.rating && (
                          <div className="mt-2 flex items-center">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < Math.floor(pkg.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-1 text-sm text-gray-600">
                              {pkg.rating} ({pkg.review_count || 0} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-l border ${
                        currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-charcoal hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-3 py-1 border-t border-b ${
                          currentPage === i + 1
                            ? 'bg-charcoal text-white'
                            : 'bg-white text-charcoal hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-r border ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-charcoal hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackagesPage;
