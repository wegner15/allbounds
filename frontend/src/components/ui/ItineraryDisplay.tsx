import React from 'react';
import { useItinerary } from '../../lib/hooks/useItinerary';
import type { EntityType, ItineraryItem } from '../../lib/types/itinerary';

interface ItineraryDisplayProps {
  entityType: EntityType;
  entityId: number;
  className?: string;
}

export const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({
  entityType,
  entityId,
  className = ''
}) => {
  const { data: itinerary, isLoading, error } = useItinerary(entityType, entityId);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-medium text-red-800">Unable to load itinerary</h3>
        </div>
        <p className="text-sm text-red-700 mt-1">
          There was an error loading the itinerary details. Please try refreshing the page.
        </p>
      </div>
    );
  }

  if (!itinerary || !itinerary.items || itinerary.items.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No itinerary available</h3>
        <p className="text-gray-600">
          The detailed day-by-day itinerary for this {entityType === 'package' ? 'package' : 'trip'} hasn't been created yet.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Itinerary ({itinerary.total_days} {itinerary.total_days === 1 ? 'day' : 'days'})
      </h3>
      
      <div className="space-y-6">
        {itinerary.items.map((item, index) => (
          <ItineraryDayCard key={item.id} item={item} isLast={index === itinerary.items.length - 1} />
        ))}
      </div>
    </div>
  );
};

interface ItineraryDayCardProps {
  item: ItineraryItem;
  isLast: boolean;
}

const ItineraryDayCard: React.FC<ItineraryDayCardProps> = ({ item, isLast }) => {
  return (
    <div className="relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 -z-10"></div>
      )}
      
      <div className="flex items-start space-x-4">
        {/* Day number circle */}
        <div className="flex-shrink-0 w-12 h-12 bg-teal text-white rounded-full flex items-center justify-center font-semibold text-sm z-10">
          {item.day_number}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {item.title}
              </h4>
              {item.date && (
                <p className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>
            
            {item.description && (
              <p className="text-gray-600 mb-4">{item.description}</p>
            )}
            
            {item.location && (
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {item.location}
              </div>
            )}
            
            {/* Accommodation */}
            {item.accommodation_hotel && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center mb-2">
                  <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h5 className="font-medium text-blue-900">Accommodation</h5>
                </div>
                <div>
                  <p className="text-blue-800 font-medium">{item.accommodation_hotel.name}</p>
                  {item.accommodation_hotel.address && (
                    <p className="text-sm text-blue-600 mt-1">{item.accommodation_hotel.address}</p>
                  )}
                </div>
                {item.accommodation_notes && (
                  <p className="text-sm text-blue-600 mt-2">{item.accommodation_notes}</p>
                )}
              </div>
            )}
            
            {/* Activities */}
            {item.activities && item.activities.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Activities
                </h5>
                <div className="space-y-3">
                  {item.activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {activity.time && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {activity.time}
                            </span>
                          )}
                          {activity.is_meal && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                              </svg>
                              {activity.meal_type ? activity.meal_type.charAt(0).toUpperCase() + activity.meal_type.slice(1) : 'Meal'}
                            </span>
                          )}
                          {activity.attraction && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Attraction
                            </span>
                          )}
                          {activity.duration_hours && (
                            <span className="text-xs text-gray-500">
                              {activity.duration_hours}h
                            </span>
                          )}
                        </div>
                        <h6 className="font-medium text-gray-900">{activity.activity_title}</h6>
                        {activity.activity_description && (
                          <p className="text-sm text-gray-600 mt-1">{activity.activity_description}</p>
                        )}
                        {activity.location && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {activity.location}
                          </p>
                        )}
                        {activity.attraction && (
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {activity.attraction.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
