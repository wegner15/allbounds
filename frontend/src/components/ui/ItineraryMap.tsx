import React, { useEffect, useRef, useState } from 'react';
import type { ItineraryItem } from '../../lib/types/itinerary';
import L from 'leaflet';

interface ItineraryMapProps {
  items: ItineraryItem[];
  className?: string;
}

interface LocationPoint {
  lat: number;
  lng: number;
  title: string;
  day: number;
  description?: string;
  activities: string[];
  accommodation?: string;
}

export const ItineraryMap: React.FC<ItineraryMapProps> = ({ items, className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Extract location points from itinerary items
  const locationPoints: LocationPoint[] = items
    .filter(item => item.location)
    .map(item => {
      // Try to extract coordinates from location string or use geocoding
      const activities = item.activities?.map(a => a.activity_title) || [];
      
      return {
        lat: 0, // Will be geocoded
        lng: 0, // Will be geocoded
        title: item.title,
        day: item.day_number,
        description: item.description,
        activities,
        accommodation: item.hotels?.[0]?.name
      };
    });

  // Geocoding function (simplified - in production, use a proper geocoding service)
  const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Using Nominatim (OpenStreetMap's geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  };

  useEffect(() => {
    const loadMap = async () => {
      // Load Leaflet CSS and JS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => initializeMap();
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = async () => {
      if (!mapRef.current || !L) return;

      // Initialize map
      const map = L.map(mapRef.current).setView([0, 0], 2);
      mapInstanceRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Geocode locations and add markers
      const geocodedPoints: LocationPoint[] = [];
      
      for (const point of locationPoints) {
        const item = items.find(i => i.day_number === point.day);
        if (item?.location) {
          const coords = await geocodeLocation(item.location);
          if (coords) {
            geocodedPoints.push({
              ...point,
              lat: coords.lat,
              lng: coords.lng
            });
          }
        }
      }

      if (geocodedPoints.length > 0) {
        // Create markers and polyline
        const markers: L.Layer[] = [];
        const polylinePoints: [number, number][] = [];

        geocodedPoints.forEach((point) => {
          // Create custom marker icon
          const markerIcon = L.divIcon({
            html: `
              <div class="relative">
                <div class="w-10 h-10 bg-teal text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">
                  ${point.day}
                </div>
                <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-teal"></div>
              </div>
            `,
            className: 'custom-marker',
            iconSize: [40, 50],
            iconAnchor: [20, 45]
          });

          const marker = L.marker([point.lat, point.lng], { icon: markerIcon })
            .addTo(map);

          // Create popup content
          const popupContent = `
            <div class="p-2 max-w-xs">
              <h3 class="font-semibold text-lg text-gray-900 mb-2">Day ${point.day}: ${point.title}</h3>
              ${point.description ? `<p class="text-gray-600 text-sm mb-2">${point.description}</p>` : ''}
              ${point.accommodation ? `
                <div class="mb-2 p-2 bg-blue-50 rounded border border-blue-100">
                  <div class="flex items-center text-sm text-blue-800">
                    <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    ${point.accommodation}
                  </div>
                </div>
              ` : ''}
              ${point.activities.length > 0 ? `
                <div class="text-sm">
                  <p class="font-medium text-gray-700 mb-1">Activities:</p>
                  <ul class="text-gray-600 space-y-1">
                    ${point.activities.slice(0, 3).map(activity => `<li>• ${activity}</li>`).join('')}
                    ${point.activities.length > 3 ? `<li class="text-gray-500">... and ${point.activities.length - 3} more</li>` : ''}
                  </ul>
                </div>
              ` : ''}
            </div>
          `;

          marker.bindPopup(popupContent);
          markers.push(marker);
          polylinePoints.push([point.lat, point.lng]);

          // Handle marker click
          marker.on('click', () => {
            setSelectedDay(point.day);
          });
        });

        // Add route polyline
        if (polylinePoints.length > 1) {
          const polyline = L.polyline(polylinePoints, {
            color: '#14b8a6',
            weight: 3,
            opacity: 0.8,
            dashArray: '10, 5'
          }).addTo(map);

          // Fit map to show all points
          const layers: L.Layer[] = [...markers, polyline];
          const group = L.featureGroup(layers);
          map.fitBounds(group.getBounds().pad(0.1));
        } else if (polylinePoints.length === 1) {
          map.setView(polylinePoints[0], 10);
        }
      }

      setIsLoading(false);
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [items, locationPoints]);

  if (locationPoints.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-xl p-8 text-center ${className}`}>
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No locations available</h3>
        <p className="text-gray-600">
          Location information hasn't been added to the itinerary items yet.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Map Container */}
      <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal"></div>
              <p className="mt-2 text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="h-96 w-full" />
        
        {/* Map Legend */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <h4 className="font-medium text-gray-900 mb-2 text-sm">Your Journey</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
                1
              </div>
              <span className="text-gray-600">Day markers</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-0.5 bg-teal mr-2" style={{ borderStyle: 'dashed' }}></div>
              <span className="text-gray-600">Travel route</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Quick Navigation</h4>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedDay(item.day_number)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDay === item.day_number
                  ? 'bg-teal text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Day {item.day_number}
              {item.location && (
                <span className="block text-xs opacity-75 truncate max-w-20">
                  {item.location}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {(() => {
            const selectedItem = items.find(item => item.day_number === selectedDay);
            if (!selectedItem) return null;

            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Day {selectedDay}: {selectedItem.title}
                  </h4>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {selectedItem.description && (
                  <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                )}
                
                {selectedItem.location && (
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <svg className="h-4 w-4 mr-2 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {selectedItem.location}
                  </div>
                )}

                {selectedItem.activities && selectedItem.activities.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Activities</h5>
                    <div className="grid gap-2">
                      {selectedItem.activities.map((activity) => (
                        <div key={activity.id} className="flex items-center p-2 bg-gray-50 rounded">
                          <svg className="h-4 w-4 text-teal mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-700">{activity.activity_title}</span>
                          {activity.time && (
                            <span className="ml-auto text-xs text-gray-500">{activity.time}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
