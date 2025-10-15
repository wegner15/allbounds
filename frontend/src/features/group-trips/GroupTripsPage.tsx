import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';

// Components
import Button from '../../components/ui/Button';
import GroupTripCarousel from '../../components/ui/GroupTripCarousel';

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

  // Filter upcoming group trips (next 3 months, limit 10)
  const { featuredTrips, hasUpcomingTrips } = React.useMemo(() => {
    if (!groupTripsData) return { featuredTrips: [], hasUpcomingTrips: false };

    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(now.getMonth() + 3);

    // First try to find trips with upcoming departures
    const upcomingTrips = groupTripsData
      .filter(trip => {
        // Check if trip has departures in the next 3 months
        if (!trip.departures || trip.departures.length === 0) return false;

        return trip.departures.some(departure => {
          const departureDate = new Date(departure.start_date);
          return departureDate >= now && departureDate <= threeMonthsFromNow;
        });
      })
      .sort((a, b) => {
        // Sort by earliest departure date
        const aEarliest = Math.min(...a.departures.map(d => new Date(d.start_date).getTime()));
        const bEarliest = Math.min(...b.departures.map(d => new Date(d.start_date).getTime()));
        return aEarliest - bEarliest;
      });

    // If we have upcoming trips, return them (limited to 10)
    if (upcomingTrips.length > 0) {
      return { featuredTrips: upcomingTrips.slice(0, 10), hasUpcomingTrips: true };
    }

    // If no upcoming trips, show the first 10 available trips as featured
    return { featuredTrips: groupTripsData.slice(0, 10), hasUpcomingTrips: false };
  }, [groupTripsData]);
  
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
    } catch {
      return dateString;
    }
  };
  
  return (
    <div className="bg-paper min-h-screen">
      <Helmet>
        <title>Group Trips | AllBounds Vacations</title>
        <meta name="description" content="Join our scheduled group trips to destinations across Africa and beyond." />
      </Helmet>
      
       {/* Featured Group Trips Carousel */}
       {featuredTrips.length > 0 && (
        <GroupTripCarousel
          groupTrips={featuredTrips}
          isLoading={isLoadingGroupTrips}
          className="h-96 md:h-[500px]"
          showUpcomingBadge={hasUpcomingTrips}
          title="Group Trips"
          subtitle="Join like-minded travelers on scheduled departures"
        />
       )}

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
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                  {currentTrips.map(trip => (
                     <div key={trip.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <Link to={`/group-trips/${trip.slug}`}>
                         <img
                          src={getImageUrlWithFallback(trip.image_id, IMAGE_VARIANTS.LARGE, 'https://source.unsplash.com/random/1000x800/?group,travel')}
                          alt={trip.name}
                          className="w-full h-72 object-cover"
                        />
                      </Link>
                       <div className="p-6">
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
                          <div 
                            className="text-gray-600 text-sm mb-3 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(trip.summary || trip.description || '') }}
                          />

                          {/* Prominent Next Departure */}
                          {trip.departures && trip.departures.length > 0 && (
                            <div className="group relative bg-teal-50 border-2 border-teal-200 rounded-lg p-3 mb-4 transition-all duration-500 hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-300/40 hover:-translate-y-1 transform cursor-pointer overflow-hidden">
                              {/* Snake-like animated border effect */}
                              <div className="absolute inset-0 rounded-lg overflow-hidden">
                                {/* Top border segments - evenly distributed */}
                                <div className="absolute top-0 left-0 w-6 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-0"></div>
                                <div className="absolute top-0 left-[20%] w-6 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100"></div>
                                <div className="absolute top-0 left-[40%] w-6 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200"></div>
                                <div className="absolute top-0 left-[60%] w-6 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-300"></div>
                                <div className="absolute top-0 left-[80%] w-6 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-400"></div>

                                {/* Right border segments - evenly distributed */}
                                <div className="absolute top-0 right-0 w-1 h-6 bg-gradient-to-b from-blue-500 to-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-500"></div>
                                <div className="absolute top-[20%] right-0 w-1 h-6 bg-gradient-to-b from-blue-500 to-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-600"></div>
                                <div className="absolute top-[40%] right-0 w-1 h-6 bg-gradient-to-b from-blue-500 to-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-700"></div>
                                <div className="absolute top-[60%] right-0 w-1 h-6 bg-gradient-to-b from-blue-500 to-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-800"></div>
                                <div className="absolute top-[80%] right-0 w-1 h-6 bg-gradient-to-b from-blue-500 to-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-900"></div>

                                 {/* Bottom border segments - evenly distributed */}
                                 <div className="absolute bottom-0 left-0 w-6 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-1000"></div>
                                 <div className="absolute bottom-0 left-[20%] w-6 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-1100"></div>
                                 <div className="absolute bottom-0 left-[40%] w-6 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-1200"></div>
                                 <div className="absolute bottom-0 left-[60%] w-6 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-1300"></div>
                                 <div className="absolute bottom-0 left-[80%] w-6 h-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-1400"></div>

                                 {/* Left border segments - evenly distributed */}
                                 <div className="absolute top-0 left-0 w-1 h-6 bg-gradient-to-b from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-1500"></div>
                                 <div className="absolute top-[20%] left-0 w-1 h-6 bg-gradient-to-b from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-1600"></div>
                                 <div className="absolute top-[40%] left-0 w-1 h-6 bg-gradient-to-b from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-1700"></div>
                                 <div className="absolute top-[60%] left-0 w-1 h-6 bg-gradient-to-b from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-1800"></div>
                                 <div className="absolute top-[80%] left-0 w-1 h-6 bg-gradient-to-b from-teal-400 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 delay-1900"></div>
                              </div>

                              {/* Animated gradient background */}
                              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-teal-100 via-blue-50 to-teal-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-pulse"></div>

                              {/* Subtle inner glow */}
                              <div className="absolute inset-1 rounded-md bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                              <div className="relative flex items-center justify-between">
                                <div className="flex items-center">
                                  <svg className="w-5 h-5 mr-2 text-teal-600 group-hover:text-teal-700 group-hover:animate-bounce transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-sm font-medium text-teal-800 group-hover:text-teal-900 transition-colors duration-300">Next Departure</span>
                                </div>
                                <span className="text-lg font-bold text-teal-900 group-hover:text-blue-900 group-hover:scale-110 transform transition-all duration-300 drop-shadow-sm">
                                  {formatDate(trip.departures[0].start_date)}
                                </span>
                              </div>
                              {trip.departures.length > 1 && (
                                <div className="relative mt-1 text-xs text-teal-600 group-hover:text-teal-700 transition-colors duration-300">
                                  +{trip.departures.length - 1} more dates available
                                </div>
                              )}
                            </div>
                          )}
                        
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


                        </div>
                        
                         {/* Additional departures info */}
                         {trip.departures && trip.departures.length > 1 && (
                           <div className="mb-4 text-xs text-gray-500">
                             <Link
                               to={`/group-trips/${trip.slug}`}
                               className="text-blue-600 hover:text-blue-800 font-medium"
                             >
                               View all {trip.departures.length} available departures
                             </Link>
                           </div>
                         )}
                        
                         {/* Rating (if exists) */}
                         {trip.rating && (
                           <div className="flex items-center justify-end mb-3">
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
                             <span className="ml-1 text-xs text-gray-500">
                               ({trip.review_count || 0} reviews)
                             </span>
                           </div>
                         )}

                         {/* Price and Action Button */}
                         <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                           <div className="flex flex-col">
                             <div className="flex items-baseline">
                               <span className="text-sm text-gray-500">From</span>
                               <span className="font-bold text-xl text-primary ml-1">${trip.price}</span>
                             </div>
                             <span className="text-gray-600 text-xs">per person</span>
                           </div>

                           <Link to={`/group-trips/${trip.slug}`}>
                             <Button variant="primary" size="md" className="px-6 py-2">
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
