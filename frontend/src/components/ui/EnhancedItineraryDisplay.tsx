import React, { useState } from 'react';
import { useItinerary } from '../../lib/hooks/useItinerary';
import type { EntityType, ItineraryItem } from '../../lib/types/itinerary';
import { ItineraryMap } from './ItineraryMap';

interface EnhancedItineraryDisplayProps {
  entityType: EntityType;
  entityId: number;
  className?: string;
}

export const EnhancedItineraryDisplay: React.FC<EnhancedItineraryDisplayProps> = ({
  entityType,
  entityId,
  className = ''
}) => {
  const { data: itinerary, isLoading, error } = useItinerary(entityType, entityId);
  const [activeView, setActiveView] = useState<'timeline' | 'map'>('timeline');

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="flex space-x-4 mb-6">
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="flex-1 bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-6 ${className}`}>
        <div className="flex items-center">
          <svg className="h-6 w-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800">Unable to load itinerary</h3>
        </div>
        <p className="text-red-700 mt-2">
          There was an error loading the itinerary details. Please try refreshing the page.
        </p>
      </div>
    );
  }

  if (!itinerary || !itinerary.items || itinerary.items.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-8 text-center ${className}`}>
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No itinerary available</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          The detailed day-by-day itinerary for this {entityType === 'package' ? 'package' : 'trip'} hasn't been created yet.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Your Journey
          </h3>
          <p className="text-gray-600">
            {itinerary.total_days} {itinerary.total_days === 1 ? 'day' : 'days'} of unforgettable experiences
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mt-4 sm:mt-0">
          <button
            onClick={() => setActiveView('timeline')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'timeline'
                ? 'bg-white text-teal shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Timeline
          </button>
          <button
            onClick={() => setActiveView('map')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'map'
                ? 'bg-white text-teal shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Map View
          </button>
        </div>
      </div>

      {/* Content */}
      {activeView === 'timeline' ? (
        <TimelineView items={itinerary.items} />
      ) : (
        <ItineraryMap items={itinerary.items} />
      )}
    </div>
  );
};

interface TimelineViewProps {
  items: ItineraryItem[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ items }) => {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal via-teal-light to-teal opacity-30"></div>
      
      <div className="space-y-8">
        {items.map((item, index) => (
          <EnhancedItineraryDayCard 
            key={item.id} 
            item={item} 
            index={index}
            isLast={index === items.length - 1} 
          />
        ))}
      </div>
    </div>
  );
};

interface EnhancedItineraryDayCardProps {
  item: ItineraryItem;
  index: number;
  isLast: boolean;
}

const EnhancedItineraryDayCard: React.FC<EnhancedItineraryDayCardProps> = ({ item, index, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(index < 2); // First 2 days expanded by default

  return (
    <div className="relative">
      <div className="flex items-start space-x-6">
        {/* Enhanced Day Circle */}
        <div className="relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-teal to-teal-dark text-white rounded-full flex flex-col items-center justify-center font-bold shadow-lg border-4 border-white">
            <span className="text-xs uppercase tracking-wide">Day</span>
            <span className="text-lg leading-none">{item.day_number}</span>
          </div>
          {!isLast && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-teal-light to-transparent"></div>
          )}
        </div>
        
        {/* Enhanced Content Card */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
            {/* Header */}
            <div 
              className="p-6 cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h4>
                  {item.date && (
                    <p className="text-sm text-gray-500 mb-3">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                  {item.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 mr-2 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {item.location}
                    </div>
                  )}
                </div>
                <button className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg 
                    className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Expandable Content */}
            {isExpanded && (
              <div className="px-6 pb-6 border-t border-gray-100">
                {item.description && (
                  <p className="text-gray-600 mb-6 leading-relaxed">{item.description}</p>
                )}
                
                {/* Accommodation */}
                {item.accommodation_hotel && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h5 className="font-semibold text-blue-900">Your Accommodation</h5>
                    </div>
                    <div>
                      <p className="text-blue-800 font-medium text-lg">{item.accommodation_hotel.name}</p>
                      {item.accommodation_hotel.address && (
                        <p className="text-sm text-blue-600 mt-1">{item.accommodation_hotel.address}</p>
                      )}
                      {item.accommodation_notes && (
                        <p className="text-sm text-blue-600 mt-2 italic">{item.accommodation_notes}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Activities */}
                {item.activities && item.activities.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Today's Activities
                    </h5>
                    <div className="grid gap-4">
                      {item.activities.map((activity) => (
                        <div key={activity.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:bg-gray-100 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h6 className="font-medium text-gray-900 text-lg">{activity.activity_title}</h6>
                            <div className="flex items-center space-x-2 ml-4">
                              {activity.time && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {activity.time}
                                </span>
                              )}
                              {activity.duration_hours && (
                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                  {activity.duration_hours}h
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {activity.activity_description && (
                            <p className="text-gray-600 mb-3 leading-relaxed">{activity.activity_description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2">
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
                                {activity.attraction.name}
                              </span>
                            )}
                          </div>
                          
                          {activity.location && (
                            <p className="text-sm text-gray-500 mt-2 flex items-center">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {activity.location}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
