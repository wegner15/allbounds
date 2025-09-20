import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: {
    id: string;
    time?: string;
    title: string;
    description?: string;
    location?: string;
    duration?: string;
    image?: string;
    link?: string;
  }[];
  accommodation?: {
    id: string;
    name: string;
    description?: string;
    stars?: number;
    image?: string;
    link?: string;
  };
}

export interface ItineraryProps {
  days: ItineraryDay[];
  className?: string;
}

const Itinerary: React.FC<ItineraryProps> = ({
  days,
  className = '',
}) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(0); // First day expanded by default

  const toggleDay = (dayNumber: number) => {
    setExpandedDay(expandedDay === dayNumber ? null : dayNumber);
  };

  if (!days || days.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {days.map((day) => {
        const isExpanded = expandedDay === day.day;
        
        return (
          <div key={day.day} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className={`w-full flex items-center justify-between p-4 text-left ${
                isExpanded ? 'bg-paper' : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => toggleDay(day.day)}
              aria-expanded={isExpanded}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-charcoal text-white flex items-center justify-center mr-3">
                  <span className="font-medium">{day.day}</span>
                </div>
                <div>
                  <h3 className="text-lg font-playfair font-medium text-charcoal">{day.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{day.description}</p>
                </div>
              </div>
              <svg
                className={`h-5 w-5 text-charcoal transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="p-4 border-t border-gray-200">
                <div className="space-y-6">
                  {/* Timeline of activities */}
                  <div className="relative">
                    {day.activities.map((activity, index) => (
                      <div key={activity.id} className="mb-6 last:mb-0">
                        <div className="flex">
                          {/* Timeline line and dot */}
                          <div className="flex flex-col items-center mr-4">
                            <div className="h-4 w-4 rounded-full bg-teal flex-shrink-0" />
                            {index < day.activities.length - 1 && (
                              <div className="h-full w-0.5 bg-gray-200 flex-grow mt-1" />
                            )}
                          </div>

                          {/* Activity content */}
                          <div className="flex-grow pb-6">
                            <div className="flex items-center mb-1">
                              {activity.time && (
                                <span className="text-sm font-medium text-teal mr-2">{activity.time}</span>
                              )}
                              <h4 className="text-base font-medium text-charcoal">{activity.title}</h4>
                            </div>

                            {activity.description && (
                              <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                            )}

                            <div className="flex flex-wrap items-center text-xs text-gray-500">
                              {activity.location && (
                                <div className="flex items-center mr-4 mb-1">
                                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {activity.location}
                                </div>
                              )}

                              {activity.duration && (
                                <div className="flex items-center mb-1">
                                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {activity.duration}
                                </div>
                              )}
                            </div>

                            {activity.image && (
                              <div className="mt-2 rounded-md overflow-hidden">
                                <img
                                  src={activity.image}
                                  alt={activity.title}
                                  className="h-40 w-full object-cover"
                                />
                              </div>
                            )}

                            {activity.link && (
                              <div className="mt-2">
                                <Link
                                  to={activity.link}
                                  className="text-sm text-teal hover:text-hover transition-colors"
                                >
                                  Learn more
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Accommodation */}
                  {day.accommodation && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-base font-medium text-charcoal mb-2">Accommodation</h4>
                      <div className="flex">
                        {day.accommodation.image && (
                          <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden mr-4">
                            <img
                              src={day.accommodation.image}
                              alt={day.accommodation.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h5 className="font-medium">{day.accommodation.name}</h5>
                          {day.accommodation.description && (
                            <p className="text-sm text-gray-600 mt-1">{day.accommodation.description}</p>
                          )}
                          {day.accommodation.link && (
                            <Link
                              to={day.accommodation.link}
                              className="text-sm text-teal hover:text-hover transition-colors mt-1 inline-block"
                            >
                              View details
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Itinerary;
