import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// Components
import Button from '../../components/ui/Button';

// Utils
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

// API Hooks
import { useGroupTrips } from '../../lib/hooks/useGroupTrips';
import { useCountries } from '../../lib/hooks/useDestinations';
import { useHolidayTypes } from '../../lib/hooks/useHolidayTypes';

// Filter options
const priceRanges = ['All', '$0-$1000', '$1000-$2000', '$2000-$3000', '$3000+'];
const months = [
  'All', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const GroupTripsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedHolidayType, setSelectedHolidayType] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  
  // Fetch data from API
  const { data: groupTripsData, isLoading: isLoadingGroupTrips, error: groupTripsError } = useGroupTrips();
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
  const tripsPerPage = 6;
  const groupTrips = groupTripsData || [];
  const totalTrips = groupTrips.length;
  const totalPages = Math.ceil(totalTrips / tripsPerPage);
  
  // Apply filters
  const filteredTrips = groupTrips.filter(trip => {
    // Country filter
    if (selectedCountry !== 'All' && trip.country?.name !== selectedCountry) return false;
    
    // Holiday type filter
    if (selectedHolidayType !== 'All') {
      const tripHolidayTypes = trip.holiday_types?.map(ht => ht.name) || [];
      if (!tripHolidayTypes.includes(selectedHolidayType)) return false;
    }
    
    // Price range filter
    if (selectedPriceRange !== 'All') {
      const [min, max] = selectedPriceRange
        .replace('$', '')
        .split('-')
        .map(val => val === '+' ? Infinity : parseInt(val));
      
      if (trip.price < min || trip.price > max) return false;
    }
    
    // Month filter
    if (selectedMonth !== 'All') {
      // Check if any departure is in the selected month
      const monthIndex = months.indexOf(selectedMonth) - 1; // -1 because 'All' is at index 0
      if (monthIndex >= 0) {
        const hasDepartureInMonth = trip.departures?.some(departure => {
          const departureDate = new Date(departure.start_date);
          return departureDate.getMonth() === monthIndex;
        });
        
        if (!hasDepartureInMonth) return false;
      }
    }
    
    return true;
  });
  
  // Get current trips
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);
  
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
    setSelectedMonth('All');
    setCurrentPage(1);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className="bg-paper min-h-screen">
      <Helmet>
        <title>Group Trips | AllBounds Vacations</title>
        <meta name="description" content="Join our scheduled group trips to destinations across Africa and beyond." />
      </Helmet>
      
      {/* Hero Section */}
      <div className="bg-cover bg-center h-64 md:h-80 flex items-center justify-center" style={{ backgroundImage: 'url(https://source.unsplash.com/random/1600x900/?group,travel)' }}>
        <div className="text-center text-white p-4 bg-black bg-opacity-50 rounded">
          <h1 className="text-3xl md:text-4xl font-playfair mb-2">Group Trips</h1>
          <p className="text-lg md:text-xl">Join like-minded travelers on scheduled departures</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-medium mb-4">Filter Group Trips</h2>
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
              <label className="block text-sm font-medium mb-1">Departure Month</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
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
          {isLoadingGroupTrips ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
              <p className="mt-2">Loading group trips...</p>
            </div>
          ) : groupTripsError ? (
            <div className="text-center py-12 text-red-500">
              <p>Error loading group trips. Please try again later.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">{filteredTrips.length} group trips found</p>
              
              {filteredTrips.length === 0 ? (
                <div className="text-center py-12">
                  <p>No group trips match your filters. Try adjusting your criteria.</p>
                  <Button onClick={handleResetFilters} variant="primary" className="mt-4">
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentTrips.map(trip => (
                    <div key={trip.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <Link to={`/group-trips/${trip.slug}`}>
                        <img 
                          src={getImageUrlWithFallback(trip.image_id, IMAGE_VARIANTS.MEDIUM, 'https://source.unsplash.com/random/600x400/?group,travel')} 
                          alt={trip.name}
                          className="w-full h-48 object-cover"
                        />
                      </Link>
                      <div className="p-4">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {trip.country && (
                            <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
                              📍 {trip.country.name}
                            </span>
                          )}
                          {trip.holiday_types && trip.holiday_types.slice(0, 1).map(type => (
                            <span key={type.id} className="inline-block bg-butter text-charcoal text-xs px-2 py-1 rounded-full">
                              {type.name}
                            </span>
                          ))}
                          {trip.duration_days && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              ⏱️ {trip.duration_days} days
                            </span>
                          )}
                        </div>

                        <Link to={`/group-trips/${trip.slug}`} className="block">
                          <h3 className="text-lg font-semibold text-charcoal hover:text-hover transition-colors mb-2">
                            {trip.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{trip.description}</p>
                        
                        {/* Trip Details */}
                        <div className="space-y-2 mb-4">
                          {/* Group Size */}
                          {(trip.max_participants || trip.min_participants) && (
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>
                                Group size: {trip.min_participants && trip.max_participants 
                                  ? `${trip.min_participants}-${trip.max_participants}` 
                                  : trip.max_participants 
                                    ? `Max ${trip.max_participants}` 
                                    : `Min ${trip.min_participants}`} people
                              </span>
                            </div>
                          )}

                          {/* Next Departure */}
                          {trip.departures && trip.departures.length > 0 && (
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Next departure: {formatDate(trip.departures[0].start_date)}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Upcoming departures */}
                        {trip.departures && trip.departures.length > 0 && (
                          <div className="mb-4 bg-gray-50 rounded-lg p-3">
                            <h4 className="text-sm font-medium mb-2 text-gray-700">Available Departures:</h4>
                            <div className="space-y-1">
                              {trip.departures.slice(0, 2).map(departure => (
                                <div key={departure.id} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600">
                                    {formatDate(departure.start_date)} - {formatDate(departure.end_date)}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    {departure.price !== trip.price && (
                                      <span className="text-xs text-gray-500">${departure.price}</span>
                                    )}
                                    {departure.available_spots > 0 ? (
                                      <span className="text-green-600 text-xs font-medium">
                                        {departure.available_spots} spots
                                      </span>
                                    ) : (
                                      <span className="text-red-600 text-xs font-medium">Sold out</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {trip.departures.length > 2 && (
                                <div className="text-center pt-1">
                                  <Link 
                                    to={`/group-trips/${trip.slug}`}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    + {trip.departures.length - 2} more dates available
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Price and Rating */}
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-baseline">
                              <span className="text-sm text-gray-500">From</span>
                              <span className="font-bold text-xl text-primary ml-1">${trip.price}</span>
                            </div>
                            <span className="text-gray-600 text-xs">per person</span>
                          </div>
                          
                          {trip.rating && (
                            <div className="text-right">
                              <div className="flex items-center justify-end">
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-3 h-3 ${i < Math.floor(trip.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="ml-1 text-xs text-gray-600">
                                  {trip.rating}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                ({trip.review_count || 0} reviews)
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <Link to={`/group-trips/${trip.slug}`}>
                            <Button variant="primary" size="sm" className="w-full">
                              View Details & Book
                            </Button>
                          </Link>
                        </div>
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

export default GroupTripsPage;
