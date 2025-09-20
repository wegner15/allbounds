import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Components
import Button from '../../components/ui/Button';

// API Hooks
import { usePackages } from '../../lib/hooks/usePackages';
import { useCountries } from '../../lib/hooks/useCountries';
import { useHolidayTypes } from '../../lib/hooks/useHolidayTypes';


// Utils
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

// Filter options
const priceRanges = ['All', '$0-$1000', '$1000-$2000', '$2000-$3000', '$3000+'];
const durations = ['All', '1-3 days', '4-7 days', '8-14 days', '14+ days'];

const PackagesPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedHolidayType, setSelectedHolidayType] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  
  // Fetch data from API
  const { data: packagesData, isLoading: isLoadingPackages, error: packagesError } = usePackages();
  const { data: countriesData, isLoading: isLoadingCountries } = useCountries();
  const { data: holidayTypesData, isLoading: isLoadingHolidayTypes } = useHolidayTypes();
  
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
      
      {/* Hero Section */}
      <div className="bg-cover bg-center h-64 md:h-80 flex items-center justify-center" style={{ backgroundImage: 'url(https://source.unsplash.com/random/1600x900/?safari)' }}>
        <div className="text-center text-white p-4 bg-black bg-opacity-50 rounded">
          <h1 className="text-3xl md:text-4xl font-playfair mb-2">Vacation Packages</h1>
          <p className="text-lg md:text-xl">Curated experiences for unforgettable journeys</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-medium mb-4">Filter Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Destination</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                disabled={isLoadingCountries}
              >
                {countryOptions.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Holiday Type</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded"
                value={selectedHolidayType}
                onChange={(e) => setSelectedHolidayType(e.target.value)}
                disabled={isLoadingHolidayTypes}
              >
                {holidayTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Price Range</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded"
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
              >
                {priceRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded"
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
              >
                {durations.map(duration => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleResetFilters} variant="secondary" className="mr-2">
              Reset Filters
            </Button>
          </div>
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
                          className="w-full h-48 object-cover"
                        />
                      </Link>
                      <div className="p-4">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {pkg.country && (
                            <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded">
                              {pkg.country.name}
                            </span>
                          )}
                          {pkg.holiday_types && pkg.holiday_types.slice(0, 1).map(type => (
                            <span key={type.id} className="inline-block bg-butter text-charcoal text-xs px-2 py-1 rounded">
                              {type.name}
                            </span>
                          ))}
                        </div>
                        <Link to={`/packages/${pkg.slug}`} className="block">
                          <h3 className="text-lg font-medium text-charcoal hover:text-hover transition-colors mb-2">
                            {pkg.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold text-lg">From ${pkg.price}</span>
                            <span className="text-gray-600 text-sm"> / person</span>
                          </div>
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
