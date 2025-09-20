import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  useHotel, 
  useHotelRelationships,
  useAssignPackageToHotel, 
  useRemovePackageFromHotel,
  useAssignGroupTripToHotel,
  useRemoveGroupTripFromHotel
} from '../../../lib/hooks/useHotels';
import { usePackages } from '../../../lib/hooks/usePackages';
import { useGroupTrips } from '../../../lib/hooks/useGroupTrips';

const HotelRelationshipsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const hotelId = parseInt(id || '0');
  const navigate = useNavigate();
  
  const [selectedPackageId, setSelectedPackageId] = useState<number | ''>('');
  const [selectedGroupTripId, setSelectedGroupTripId] = useState<number | ''>('');
  
  const { data: hotel, isLoading: isLoadingHotel } = useHotel(hotelId);
  const { data: relationships, isLoading: isLoadingRelationships, refetch } = useHotelRelationships(hotelId);
  const { data: allPackages, isLoading: isLoadingPackages } = usePackages();
  const { data: allGroupTrips, isLoading: isLoadingGroupTrips } = useGroupTrips();
  
  const { mutate: assignPackage, isPending: isAssigningPackage } = useAssignPackageToHotel();
  const { mutate: removePackage, isPending: isRemovingPackage } = useRemovePackageFromHotel();
  const { mutate: assignGroupTrip, isPending: isAssigningGroupTrip } = useAssignGroupTripToHotel();
  const { mutate: removeGroupTrip, isPending: isRemovingGroupTrip } = useRemoveGroupTripFromHotel();

  if (isLoadingHotel || isLoadingRelationships || isLoadingPackages || isLoadingGroupTrips) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="spinner"></div>
        <p className="ml-2">Loading data...</p>
      </div>
    );
  }

  if (!hotel || !relationships) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        Error loading data. Please try again or go back to the hotels list.
      </div>
    );
  }

  const handleAssignPackage = () => {
    if (selectedPackageId !== '') {
      assignPackage(
        { hotelId, packageId: Number(selectedPackageId) },
        {
          onSuccess: () => {
            refetch();
            setSelectedPackageId('');
          }
        }
      );
    }
  };

  const handleRemovePackage = (packageId: number) => {
    removePackage(
      { hotelId, packageId },
      {
        onSuccess: () => {
          refetch();
        }
      }
    );
  };

  const handleAssignGroupTrip = () => {
    if (selectedGroupTripId !== '') {
      assignGroupTrip(
        { hotelId, groupTripId: Number(selectedGroupTripId) },
        {
          onSuccess: () => {
            refetch();
            setSelectedGroupTripId('');
          }
        }
      );
    }
  };

  const handleRemoveGroupTrip = (groupTripId: number) => {
    removeGroupTrip(
      { hotelId, groupTripId },
      {
        onSuccess: () => {
          refetch();
        }
      }
    );
  };

  // Filter out packages that are already assigned to the hotel
  const unassignedPackages = allPackages?.filter(
    pkg => !relationships.package_ids?.includes(pkg.id)
  );

  // Filter out group trips that are already assigned to the hotel
  const unassignedGroupTrips = allGroupTrips?.filter(
    trip => !relationships.group_trip_ids?.includes(trip.id)
  );

  // Find the assigned package and group trip details
  const assignedPackages = allPackages?.filter(
    pkg => relationships.package_ids?.includes(pkg.id)
  );

  const assignedGroupTrips = allGroupTrips?.filter(
    trip => relationships.group_trip_ids?.includes(trip.id)
  );

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Hotel Relationships | AllBounds Admin</title>
      </Helmet>
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Hotel Relationships: {hotel.name}
        </h1>
        <button
          onClick={() => navigate(`/admin/hotels/${hotelId}/edit`)}
          className="bg-teal hover:bg-teal-dark text-white py-2 px-4 rounded-md flex items-center"
        >
          Edit Hotel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Package Relationships */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Associated Packages</h2>
          
          <div className="mb-6">
            <div className="flex space-x-2">
              <select
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(Number(e.target.value) || '')}
                className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
              >
                <option value="">Select a package to add...</option>
                {unassignedPackages?.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignPackage}
                disabled={!selectedPackageId || isAssigningPackage}
                className={`bg-teal hover:bg-teal-dark text-white py-2 px-4 rounded-md ${
                  !selectedPackageId || isAssigningPackage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isAssigningPackage ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>

          {assignedPackages?.length === 0 ? (
            <p className="text-gray-500 italic">No packages assigned to this hotel.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {assignedPackages?.map(pkg => (
                <li key={pkg.id} className="py-3 flex justify-between items-center">
                  <span>{pkg.name}</span>
                  <button
                    onClick={() => handleRemovePackage(pkg.id)}
                    disabled={isRemovingPackage}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Group Trip Relationships */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Associated Group Trips</h2>
          
          <div className="mb-6">
            <div className="flex space-x-2">
              <select
                value={selectedGroupTripId}
                onChange={(e) => setSelectedGroupTripId(Number(e.target.value) || '')}
                className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
              >
                <option value="">Select a group trip to add...</option>
                {unassignedGroupTrips?.map(trip => (
                  <option key={trip.id} value={trip.id}>
                    {trip.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignGroupTrip}
                disabled={!selectedGroupTripId || isAssigningGroupTrip}
                className={`bg-teal hover:bg-teal-dark text-white py-2 px-4 rounded-md ${
                  !selectedGroupTripId || isAssigningGroupTrip ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isAssigningGroupTrip ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>

          {assignedGroupTrips?.length === 0 ? (
            <p className="text-gray-500 italic">No group trips assigned to this hotel.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {assignedGroupTrips?.map(trip => (
                <li key={trip.id} className="py-3 flex justify-between items-center">
                  <span>{trip.name}</span>
                  <button
                    onClick={() => handleRemoveGroupTrip(trip.id)}
                    disabled={isRemovingGroupTrip}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => navigate('/admin/hotels')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md"
        >
          Back to Hotels
        </button>
      </div>
    </div>
  );
};

export default HotelRelationshipsPage;
