import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { MapPin, Navigation, Hotel as HotelIcon, Landmark } from 'lucide-react';
import type { ItineraryItemDetail } from '../../lib/types/api';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

// Fix Leaflet icon issue - do this once when component mounts
let defaultIconFixed = false;
const fixLeafletDefaultIcon = () => {
  if (!defaultIconFixed && typeof window !== 'undefined') {
    try {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: iconRetina,
        iconUrl: icon,
        shadowUrl: iconShadow,
      });
      defaultIconFixed = true;
    } catch (e) {
      console.warn('Failed to fix Leaflet default icon:', e);
    }
  }
};

interface ItineraryMapLeafletProps {
  itineraryItems: ItineraryItemDetail[];
  packageName: string;
}

interface MapLocation {
  day: number;
  location: string;
  title: string;
  lat: number;
  lng: number;
  type: 'itinerary' | 'hotel' | 'attraction';
  isFirst?: boolean;
  isLast?: boolean;
}

const ItineraryMapLeaflet: React.FC<ItineraryMapLeafletProps> = ({ itineraryItems, packageName }) => {
  // Fix Leaflet icon on mount
  useEffect(() => {
    fixLeafletDefaultIcon();
  }, []);

  // Extract all locations with coordinates
  const { locations, routeCoordinates, center, hasCoordinates } = useMemo(() => {
    const locs: MapLocation[] = [];
    const route: LatLngExpression[] = [];
    
    // Extract itinerary locations
    itineraryItems.forEach((item, index) => {
      if (item.latitude && item.longitude) {
        const loc: MapLocation = {
          day: item.day_number,
          location: item.location || `Day ${item.day_number}`,
          title: item.title,
          lat: item.latitude,
          lng: item.longitude,
          type: 'itinerary',
          isFirst: index === 0,
          isLast: index === itineraryItems.length - 1,
        };
        locs.push(loc);
        route.push([item.latitude, item.longitude]);
      }
      
      // Extract hotel locations
      item.hotels?.forEach(hotel => {
        if (hotel.latitude && hotel.longitude) {
          locs.push({
            day: item.day_number,
            location: hotel.city || hotel.name,
            title: hotel.name,
            lat: hotel.latitude,
            lng: hotel.longitude,
            type: 'hotel',
          });
        }
      });
      
      // Extract attraction locations
      item.attractions?.forEach(attraction => {
        if (attraction.latitude && attraction.longitude) {
          locs.push({
            day: item.day_number,
            location: attraction.city || attraction.name,
            title: attraction.name,
            lat: attraction.latitude,
            lng: attraction.longitude,
            type: 'attraction',
          });
        }
      });
    });
    
    // Calculate center point
    let centerPoint: LatLngExpression = [0, 37]; // Default to Kenya
    if (locs.length > 0) {
      const avgLat = locs.reduce((sum, loc) => sum + loc.lat, 0) / locs.length;
      const avgLng = locs.reduce((sum, loc) => sum + loc.lng, 0) / locs.length;
      centerPoint = [avgLat, avgLng];
    }
    
    return {
      locations: locs,
      routeCoordinates: route,
      center: centerPoint,
      hasCoordinates: locs.length > 0,
    };
  }, [itineraryItems]);

  if (!hasCoordinates) {
    return (
      <section className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center shadow-lg">
            <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal font-playfair">
              Tour Route
            </h2>
            <p className="text-sm text-gray-600 mt-1">Map coordinates not available for this tour</p>
          </div>
        </div>
      </section>
    );
  }

  // Custom marker icons
  const createCustomIcon = (color: string, number?: number) => {
    return new L.Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
          <path fill="${color}" d="M16 0C7.2 0 0 7.2 0 16c0 11.2 16 26 16 26s16-14.8 16-26C32 7.2 24.8 0 16 0z"/>
          ${number ? `<text x="16" y="20" font-size="14" font-weight="bold" text-anchor="middle" fill="white">${number}</text>` : ''}
        </svg>
      `)}`,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42],
    });
  };

  return (
    <section className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center shadow-lg">
          <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal font-playfair">
            Tour Route Map
          </h2>
          <p className="text-sm text-gray-600 mt-1">Interactive map of your journey</p>
        </div>
      </div>

      {/* OpenStreetMap */}
      <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg mb-6" style={{ height: '500px' }}>
        <MapContainer
          center={center}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Route line */}
          {routeCoordinates.length > 1 && (
            <Polyline
              positions={routeCoordinates}
              color="#0d9488"
              weight={3}
              opacity={0.7}
              dashArray="10, 10"
            />
          )}
          
          {/* Markers */}
          {locations.map((loc, index) => {
            const icon = loc.type === 'itinerary' 
              ? createCustomIcon(loc.isFirst ? '#10b981' : loc.isLast ? '#ef4444' : '#0d9488', loc.day)
              : loc.type === 'hotel'
              ? createCustomIcon('#f59e0b')
              : createCustomIcon('#8b5cf6');
            
            return (
              <Marker
                key={`${loc.type}-${index}`}
                position={[loc.lat, loc.lng]}
                icon={icon}
              >
                <Popup>
                  <div className="p-2">
                    <div className="flex items-center gap-2 mb-2">
                      {loc.type === 'hotel' && <HotelIcon className="w-4 h-4 text-amber-600" />}
                      {loc.type === 'attraction' && <Landmark className="w-4 h-4 text-purple-600" />}
                      {loc.type === 'itinerary' && <MapPin className="w-4 h-4 text-teal-600" />}
                      <span className="font-semibold text-sm">Day {loc.day}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{loc.title}</h4>
                    <p className="text-sm text-gray-600">{loc.location}</p>
                  </div>
                </Popup>
                <Tooltip direction="top" offset={[0, -40]} opacity={0.9}>
                  <span className="font-semibold">{loc.title}</span>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Map Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="text-sm text-gray-700">Start Point</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-error flex items-center justify-center text-white text-xs font-bold">E</div>
            <span className="text-sm text-gray-700">End Point</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
              <HotelIcon className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-gray-700">Hotels</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
              <Landmark className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-gray-700">Attractions</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <div className="text-2xl font-bold text-primary font-playfair">
            {locations.filter(l => l.type === 'itinerary').length}
          </div>
          <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mt-1">Destinations</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg border border-amber-500/20">
          <div className="text-2xl font-bold text-amber-600 font-playfair">
            {locations.filter(l => l.type === 'hotel').length}
          </div>
          <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mt-1">Hotels</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-500/20 col-span-2 md:col-span-1">
          <div className="text-2xl font-bold text-purple-600 font-playfair">
            {locations.filter(l => l.type === 'attraction').length}
          </div>
          <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mt-1">Attractions</div>
        </div>
      </div>
    </section>
  );
};

export default ItineraryMapLeaflet;
