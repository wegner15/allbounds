import React from 'react';
import { useParams } from 'react-router-dom';
import GroupTripForm from './GroupTripForm';
import { useGroupTrip, useGroupTripDepartures } from '../../../lib/hooks/useGroupTrips';

const EditGroupTripPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const groupTripId = parseInt(id || '0');
  
  const { data: groupTrip, isLoading: isLoadingTrip, error: tripError } = useGroupTrip(groupTripId);
  const { data: departures, isLoading: isLoadingDepartures } = useGroupTripDepartures(groupTripId);
  
  const isLoading = isLoadingTrip || isLoadingDepartures;
  const error = tripError;
  
  // Prepare combined data with departure information
  const prepareFormData = () => {
    if (!groupTrip) return null;
    
    console.log('Raw group trip data:', groupTrip);
    console.log('Raw departures data:', departures);
    
    // Create a copy of the group trip data with type assertion
    const formData: any = { ...groupTrip };
    
    // Add departure data if available
    if (departures && departures.length > 0) {
      // Use the first departure for start/end dates
      const firstDeparture = departures[0];
      console.log('First departure data:', firstDeparture);
      
      // Process date string into format expected by date input (YYYY-MM-DD)
      // The backend returns dates in ISO format, but the date input needs YYYY-MM-DD
      if (firstDeparture.start_date) {
        const startDate = new Date(firstDeparture.start_date);
        // Format as YYYY-MM-DD for the date input
        formData.start_date = startDate.toISOString().split('T')[0];
        console.log('Formatted start_date for form:', formData.start_date);
      }
      
      if (firstDeparture.end_date) {
        const endDate = new Date(firstDeparture.end_date);
        // Format as YYYY-MM-DD for the date input
        formData.end_date = endDate.toISOString().split('T')[0];
        console.log('Formatted end_date for form:', formData.end_date);
      }
    } else {
      console.log('No departures found for this group trip');
    }
    
    console.log('Final form data with dates:', formData);
    return formData;
  };
  
  if (isLoading) {
    return (
      <>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
          <p className="mt-2">Loading group trip data...</p>
        </div>
      </>
    );
  }
  
  if (error || !groupTrip) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <p>Error loading group trip data. The group trip may not exist or there was a problem with the server.</p>
          <p className="mt-2">
            <a href="/admin/group-trips" className="text-red-700 underline">
              Return to group trips list
            </a>
          </p>
        </div>
      </>
    );
  }
  
  const formData = prepareFormData();
  
  return (
    <>
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Group Trip</h3>
        <p className="mt-1 text-sm text-gray-500">
          Update the details of this group trip
        </p>
      </div>
      
      <GroupTripForm groupTripData={formData} isEdit={true} groupTripId={groupTripId} />
    </>
  );
};

export default EditGroupTripPage;
