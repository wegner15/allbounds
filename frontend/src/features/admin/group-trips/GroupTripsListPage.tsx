import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGroupTrips } from '../../../lib/hooks/useGroupTrips';
import { useCountries } from '../../../lib/hooks/useDestinations';
import { apiClient } from '../../../lib/api';
import CloudflareImage from '../../../components/ui/CloudflareImage';

// Define the GroupTrip interface
interface GroupTrip {
  id: string;
  name: string;
  slug: string;
  image_id?: string;
  country_id: number;
  is_active: boolean;
}

interface Country {
  id: number;
  name: string;
}


const GroupTripsListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: groupTrips, isLoading: tripsLoading, error: tripsError } = useGroupTrips();
  const { data: countries, isLoading: countriesLoading } = useCountries();
  const [tripDates, setTripDates] = useState<Record<string, {start?: string, end?: string}>>({});
  
  // Simplified direct approach to get dates
  useEffect(() => {
    if (!groupTrips || !Array.isArray(groupTrips)) return;
    
    // We'll use this function for each trip when rendering instead of pre-fetching all
    const loadDatesForTrips = async () => {
      const dates: Record<string, {start?: string, end?: string}> = {};
      
      for (let i = 0; i < groupTrips.length; i++) {
        const trip = groupTrips[i];
        try {
          // Direct API call for each trip's departures
          const departures = await apiClient.get(`/api/v1/group-trips/${trip.id}/departures`);
          console.log(`Trip ${trip.id} departures:`, departures);
          
          // If we have departures, use the first one's dates
          if (Array.isArray(departures) && departures.length > 0) {
            dates[trip.id] = {
              start: departures[0].start_date,
              end: departures[0].end_date
            };
          }
        } catch (err) {
          console.error(`Error loading dates for trip ${trip.id}:`, err);
        }
      }
      
      setTripDates(dates);
    };
    
    loadDatesForTrips();
  }, [groupTrips]);
  
  // Get country name by ID
  const getCountryName = (countryId: number): string => {
    if (!countries) return 'Loading...';
    const country = countries.find((c: Country) => c.id === countryId);
    return country ? country.name : 'Unknown';
  };
  
  // Get formatted dates for a trip
  const getFormattedDates = (tripId: string): string => {
    const dates = tripDates[tripId];
    if (!dates || !dates.start || !dates.end) return 'No dates set';
    
    try {
      const startDate = new Date(dates.start).toLocaleDateString();
      const endDate = new Date(dates.end).toLocaleDateString();
      return `${startDate} - ${endDate}`;
    } catch (error) {
      console.error('Error formatting dates:', error);
      return 'Invalid dates';
    }
  };
  
  const isLoading = tripsLoading || countriesLoading;
  const error = tripsError;
  
  // Filter group trips based on search query
  const filteredGroupTrips = (groupTrips as GroupTrip[] | undefined)?.filter(trip => {
    const nameMatch = trip.name.toLowerCase().includes(searchQuery.toLowerCase());
    // Check country name
    const countryName = getCountryName(trip.country_id).toLowerCase();
    const destinationMatch = countryName.includes(searchQuery.toLowerCase());
    return nameMatch || destinationMatch;
  });

  return (
    <>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Group Trips</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage group trips for your travel offerings
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/admin/group-trips/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Group Trip
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="search" className="sr-only">
              Search group trips
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="focus:ring-teal focus:border-teal block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search group trips"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Group Trips list */}
      <div className="bg-white shadow rounded-lg">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
            <p className="mt-2">Loading group trips...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>Error loading group trips. Please try again later.</p>
          </div>
        ) : filteredGroupTrips && filteredGroupTrips.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGroupTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {trip.image_id ? (
                            <CloudflareImage
                              imageId={trip.image_id}
                              variant="thumbnail"
                              className="h-10 w-10 rounded-md"
                              objectFit="cover"
                              alt={trip.name}
                            />
                          ) : (
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src="https://source.unsplash.com/random/100x100/?travel"
                              alt={trip.name}
                            />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{trip.name}</div>
                          <div className="text-sm text-gray-500">{trip.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCountryName(trip.country_id)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getFormattedDates(trip.id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        trip.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {trip.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/admin/group-trips/${trip.id}/edit`}
                        className="text-teal hover:text-teal-dark mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/group-trips/${trip.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No group trips found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'No group trips match your search criteria.' : 'Get started by creating a new group trip.'}
            </p>
            <div className="mt-6">
              <Link
                to="/admin/group-trips/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Group Trip
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GroupTripsListPage;
