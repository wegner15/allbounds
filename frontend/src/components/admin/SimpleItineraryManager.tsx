import React, { useState } from 'react';
import { useItinerary, useCreateItineraryItem, useDeleteItineraryItem, useUpdateItineraryItem } from '../../lib/hooks/useItinerary';
import type { EntityType, ItineraryItem, ItineraryActivity } from '../../lib/types/itinerary';
import LocationPicker from '../LocationPicker';
import { useHotels } from '../../lib/hooks/useHotels';
import { useAttractions } from '../../lib/hooks/useAttractions';
import { useActivities } from '../../lib/hooks/useActivities';

interface SimpleItineraryManagerProps {
  entityType: EntityType;
  entityId: number;
  readonly?: boolean;
}

export const SimpleItineraryManager: React.FC<SimpleItineraryManagerProps> = ({
  entityType,
  entityId,
  readonly = false
}) => {
  const [isAddingDay, setIsAddingDay] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [newDayTitle, setNewDayTitle] = useState('');
  const [newDayDescription, setNewDayDescription] = useState('');
  const [newDayLocation, setNewDayLocation] = useState('');
  const [newDayLatitude, setNewDayLatitude] = useState('');
  const [newDayLongitude, setNewDayLongitude] = useState('');
  const [newDayHotelIds, setNewDayHotelIds] = useState<number[]>([]);
  const [newDayAttractionIds, setNewDayAttractionIds] = useState<number[]>([]);
  const [newDayLinkedActivityIds, setNewDayLinkedActivityIds] = useState<number[]>([]);
  const [newDayAccommodationNotes, setNewDayAccommodationNotes] = useState('');

  const { data: itinerary, isLoading, error } = useItinerary(entityType, entityId);
  const createItem = useCreateItineraryItem();
  const updateItem = useUpdateItineraryItem();
  const deleteItem = useDeleteItineraryItem();
  const { data: hotels = [] } = useHotels();
  const { data: attractions = [] } = useAttractions();
  const { data: activities = [] } = useActivities();

  const handleEditDay = (item: ItineraryItem) => {
    setEditingItemId(item.id);
    setNewDayTitle(item.title);
    setNewDayDescription(item.description || '');
    setNewDayLocation(item.location || '');
    setNewDayLatitude(item.latitude?.toString() || '');
    setNewDayLongitude(item.longitude?.toString() || '');
    setNewDayHotelIds(item.hotel_ids || []);
    setNewDayAttractionIds(item.attraction_ids || []);
    setNewDayLinkedActivityIds(item.linked_activity_ids || []);
    setNewDayAccommodationNotes(item.accommodation_notes || '');
    setIsAddingDay(true); // Reuse the same form
  };

  const handleUpdateDay = async () => {
    if (!editingItemId || !newDayTitle.trim()) {
      alert('Please enter a day title');
      return;
    }

    try {
      await updateItem.mutateAsync({
        itemId: editingItemId,
        data: {
          title: newDayTitle,
          description: newDayDescription || undefined,
          location: newDayLocation || undefined,
          latitude: newDayLatitude ? parseFloat(newDayLatitude) : undefined,
          longitude: newDayLongitude ? parseFloat(newDayLongitude) : undefined,
          hotel_ids: newDayHotelIds,
          attraction_ids: newDayAttractionIds,
          linked_activity_ids: newDayLinkedActivityIds,
          accommodation_notes: newDayAccommodationNotes || undefined,
        }
      });

      // Reset form
      setIsAddingDay(false);
      setEditingItemId(null);
      setNewDayTitle('');
      setNewDayDescription('');
      setNewDayLocation('');
      setNewDayLatitude('');
      setNewDayLongitude('');
      setNewDayHotelIds([]);
      setNewDayAttractionIds([]);
      setNewDayLinkedActivityIds([]);
      setNewDayAccommodationNotes('');
    } catch (error) {
      console.error('Error updating itinerary day:', error);
      alert('Failed to update itinerary day. Please try again.');
    }
  };

  const handleAddDay = async () => {
    if (!newDayTitle.trim()) {
      alert('Please enter a day title');
      return;
    }

    console.log('Creating new itinerary day:', {
      entityType,
      entityId,
      title: newDayTitle,
      description: newDayDescription,
      location: newDayLocation,
      latitude: newDayLatitude ? parseFloat(newDayLatitude) : undefined,
      longitude: newDayLongitude ? parseFloat(newDayLongitude) : undefined,
      hotel_ids: newDayHotelIds,
      attraction_ids: newDayAttractionIds,
      linked_activity_ids: newDayLinkedActivityIds,
      accommodation_notes: newDayAccommodationNotes,
    });

    try {
      const nextDayNumber = itinerary ? itinerary.items.length + 1 : 1;
      
      await createItem.mutateAsync({
        entity_type: entityType,
        entity_id: entityId,
        day_number: nextDayNumber,
        title: newDayTitle.trim(),
        description: newDayDescription.trim() || undefined,
        location: newDayLocation.trim() || undefined,
        latitude: newDayLatitude ? parseFloat(newDayLatitude) : undefined,
        longitude: newDayLongitude ? parseFloat(newDayLongitude) : undefined,
        hotel_ids: newDayHotelIds,
        attraction_ids: newDayAttractionIds,
        linked_activity_ids: newDayLinkedActivityIds,
        accommodation_notes: newDayAccommodationNotes.trim() || undefined,
        custom_activities: []
      });

      // Reset form
      setNewDayTitle('');
      setNewDayDescription('');
      setNewDayLocation('');
      setNewDayLatitude('');
      setNewDayLongitude('');
      setNewDayHotelIds([]);
      setNewDayAttractionIds([]);
      setNewDayLinkedActivityIds([]);
      setNewDayAccommodationNotes('');
      setIsAddingDay(false);
      
      console.log('Successfully created itinerary day');
    } catch (error) {
      console.error('Failed to create itinerary day:', error);
      alert('Failed to create itinerary day. Please try again.');
    }
  };

  const handleDeleteDay = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this day?')) {
      return;
    }

    try {
      await deleteItem.mutateAsync(itemId);
      console.log('Successfully deleted itinerary day');
    } catch (error) {
      console.error('Failed to delete itinerary day:', error);
      alert('Failed to delete itinerary day. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-inset ring-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-inset ring-gray-200">
        <div className="text-red-600">
          Error loading itinerary: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm ring-1 ring-inset ring-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Itinerary {itinerary && `(${itinerary.total_days} days)`}
        </h3>
        {!readonly && (
          <button
            type="button"
            onClick={() => setIsAddingDay(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
          >
            <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Day
          </button>
        )}
      </div>

      {/* Add new day form */}
      {isAddingDay && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day Title
              </label>
              <input
                type="text"
                value={newDayTitle}
                onChange={(e) => setNewDayTitle(e.target.value)}
                placeholder="e.g., Arrival in Paris"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal focus:border-teal"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={newDayDescription}
                onChange={(e) => setNewDayDescription(e.target.value)}
                placeholder="Brief description of the day..."
                rows={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal focus:border-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <LocationPicker
                initialLocation={
                  newDayLatitude && newDayLongitude
                    ? {
                        latitude: parseFloat(newDayLatitude),
                        longitude: parseFloat(newDayLongitude),
                        address: newDayLocation,
                      }
                    : undefined
                }
                onLocationSelect={(location) => {
                  setNewDayLocation(location.address || '');
                  setNewDayLatitude(location.latitude.toString());
                  setNewDayLongitude(location.longitude.toString());
                }}
                height="300px"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={newDayLatitude}
                  onChange={(e) => setNewDayLatitude(e.target.value)}
                  placeholder="48.8566"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal focus:border-teal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  value={newDayLongitude}
                  onChange={(e) => setNewDayLongitude(e.target.value)}
                  placeholder="2.3522"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal focus:border-teal"
                />
              </div>
            </div>

            {/* Hotels Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hotels
              </label>
              <div className="border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto">
                {hotels.length === 0 ? (
                  <p className="text-sm text-gray-500">Loading hotels...</p>
                ) : (
                  hotels.map((hotel) => (
                    <label key={hotel.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={newDayHotelIds.includes(hotel.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewDayHotelIds([...newDayHotelIds, hotel.id]);
                          } else {
                            setNewDayHotelIds(newDayHotelIds.filter(id => id !== hotel.id));
                          }
                        }}
                        className="rounded border-gray-300 text-teal focus:ring-teal"
                      />
                      <span className="text-sm text-gray-700">
                        {hotel.name}
                        {hotel.city && <span className="text-gray-500"> - {hotel.city}</span>}
                        {hotel.stars && (
                          <span className="text-yellow-500 ml-1">
                            {'★'.repeat(Math.floor(hotel.stars))}
                          </span>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Attractions Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attractions
              </label>
              <div className="border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto">
                {attractions.length === 0 ? (
                  <p className="text-sm text-gray-500">Loading attractions...</p>
                ) : (
                  attractions.map((attraction) => (
                    <label key={attraction.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={newDayAttractionIds.includes(attraction.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewDayAttractionIds([...newDayAttractionIds, attraction.id]);
                          } else {
                            setNewDayAttractionIds(newDayAttractionIds.filter(id => id !== attraction.id));
                          }
                        }}
                        className="rounded border-gray-300 text-teal focus:ring-teal"
                      />
                      <span className="text-sm text-gray-700">
                        {attraction.name}
                        {attraction.city && <span className="text-gray-500"> - {attraction.city}</span>}
                        {attraction.duration_minutes && (
                          <span className="text-gray-500 ml-1">
                            ({attraction.duration_minutes}min)
                          </span>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Activities Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activities
              </label>
              <div className="border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto">
                {activities.length === 0 ? (
                  <p className="text-sm text-gray-500">Loading activities...</p>
                ) : (
                  activities.map((activity) => (
                    <label key={activity.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={newDayLinkedActivityIds.includes(activity.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewDayLinkedActivityIds([...newDayLinkedActivityIds, activity.id]);
                          } else {
                            setNewDayLinkedActivityIds(newDayLinkedActivityIds.filter(id => id !== activity.id));
                          }
                        }}
                        className="rounded border-gray-300 text-teal focus:ring-teal"
                      />
                      <span className="text-sm text-gray-700">
                        {activity.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Activities Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activities
              </label>
              <div className="border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto">
                {activities.length === 0 ? (
                  <p className="text-sm text-gray-500">Loading activities...</p>
                ) : (
                  activities.map((activity) => (
                    <label key={activity.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={newDayLinkedActivityIds.includes(activity.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewDayLinkedActivityIds([...newDayLinkedActivityIds, activity.id]);
                          } else {
                            setNewDayLinkedActivityIds(newDayLinkedActivityIds.filter(id => id !== activity.id));
                          }
                        }}
                        className="rounded border-gray-300 text-teal focus:ring-teal"
                      />
                      <span className="text-sm text-gray-700">
                        {activity.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accommodation Notes (Optional)
              </label>
              <textarea
                value={newDayAccommodationNotes}
                onChange={(e) => setNewDayAccommodationNotes(e.target.value)}
                placeholder="Special accommodation notes..."
                rows={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal focus:border-teal"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={editingItemId ? handleUpdateDay : handleAddDay}
                disabled={createItem.isPending || updateItem.isPending}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal disabled:opacity-50"
              >
                {editingItemId 
                  ? (updateItem.isPending ? 'Updating...' : 'Update Day')
                  : (createItem.isPending ? 'Adding...' : 'Add Day')
                }
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingDay(false);
                  setEditingItemId(null);
                  setNewDayTitle('');
                  setNewDayDescription('');
                  setNewDayLocation('');
                  setNewDayLatitude('');
                  setNewDayLongitude('');
                  setNewDayHotelIds([]);
                  setNewDayAttractionIds([]);
                  setNewDayLinkedActivityIds([]);
                  setNewDayAccommodationNotes('');
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing itinerary days */}
      {itinerary && itinerary.items && itinerary.items.length > 0 ? (
        <div className="space-y-4">
          {itinerary.items.map((item: ItineraryItem) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">
                    Day {item.day_number}: {item.title}
                  </h4>
                  {item.description && (
                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                  )}
                  {item.location && (
                    <p className="mt-1 text-sm text-gray-500">
                      <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {item.location}
                    </p>
                  )}
                  
                  {/* Hotels */}
                  {item.hotels && item.hotels.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {editingItemId ? 'Edit Day' : 'Add New Day'}
                      </h3>
                      <div className="space-y-1">
                        {item.hotels.map((hotel) => (
                          <div key={hotel.id} className="flex items-center text-sm text-gray-600">
                            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="font-medium">{hotel.name}</span>
                            {hotel.stars && (
                              <span className="ml-2 text-yellow-500">
                                {'★'.repeat(Math.floor(hotel.stars))}
                              </span>
                            )}
                            {hotel.city && (
                              <span className="ml-2 text-gray-500">- {hotel.city}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Attractions */}
                  {item.attractions && item.attractions.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Attractions:</h5>
                      <div className="space-y-1">
                        {item.attractions.map((attraction) => (
                          <div key={attraction.id} className="flex items-center text-sm text-gray-600">
                            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                            </svg>
                            <span className="font-medium">{attraction.name}</span>
                            {attraction.city && (
                              <span className="ml-2 text-gray-500">- {attraction.city}</span>
                            )}
                            {attraction.duration_minutes && (
                              <span className="ml-2 text-gray-500">({attraction.duration_minutes}min)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Linked Activities */}
                  {item.linked_activities && item.linked_activities.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Linked Activities:</h5>
                      <div className="space-y-1">
                        {item.linked_activities.map((activity) => (
                          <div key={activity.id} className="flex items-center text-sm text-gray-600">
                            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="font-medium">{activity.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Accommodation Notes */}
                  {item.accommodation_notes && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Accommodation Notes:</h5>
                      <p className="text-sm text-gray-600">{item.accommodation_notes}</p>
                    </div>
                  )}
                  
                  {/* Linked Activities */}
                  {item.linked_activities && item.linked_activities.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Linked Activities:</h5>
                      <div className="space-y-1">
                        {item.linked_activities.map((activity) => (
                          <div key={activity.id} className="flex items-center text-sm text-gray-600">
                            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="font-medium">{activity.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Activities */}
                  {item.custom_activities && item.custom_activities.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Activities:</h5>
                      <div className="space-y-2">
                        {item.custom_activities.map((activity: ItineraryActivity) => (
                          <div key={activity.id} className="flex items-center text-sm text-gray-600">
                            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{activity.time}</span>
                            <span className="mx-2">-</span>
                            <span>{activity.activity_title}</span>
                            {activity.activity_description && (
                              <span className="ml-2 text-gray-500">({activity.activity_description})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {!readonly && (
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditDay(item)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit day"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDay(item.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete day"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 110 2h-1v9a2 2 0 01-2 2H7a2 2 0 01-2-2V9H4a1 1 0 110-2h4z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No itinerary days</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating the first day of your itinerary.</p>
          {!readonly && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsAddingDay(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add First Day
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
