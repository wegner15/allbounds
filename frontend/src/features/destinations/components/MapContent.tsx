import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { MapPin, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CountryWithDetails } from '../../../lib/types/api';
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

interface MapContentProps {
  country: CountryWithDetails;
}

interface MapLocation {
  id: number;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  type: 'country' | 'attraction';
  description?: string;
}

const MapContent: React.FC<MapContentProps> = ({ country }) => {
  // Fix Leaflet icon on mount
  useEffect(() => {
    fixLeafletDefaultIcon();
  }, []);

  // Extract all locations with coordinates
  const { locations, center } = useMemo(() => {
    const locs: MapLocation[] = [];
    
    // Add country center marker
    if (country.latitude && country.longitude) {
      locs.push({
        id: country.id,
        name: country.name,
        slug: country.slug,
        lat: country.latitude,
        lng: country.longitude,
        type: 'country',
        description: country.summary || country.description?.replace(/<[^>]*>/g, '').substring(0, 150),
      });
    }
    
    // Add attraction markers
    country.attractions?.forEach(attraction => {
      if (attraction.latitude && attraction.longitude) {
        locs.push({
          id: attraction.id,
          name: attraction.name,
          slug: attraction.slug,
          lat: attraction.latitude,
          lng: attraction.longitude,
          type: 'attraction',
          description: attraction.description?.replace(/<[^>]*>/g, '').substring(0, 100),
        });
      }
    });
    
    // Calculate center point (use country coordinates)
    const centerPoint: LatLngExpression = country.latitude && country.longitude
      ? [country.latitude, country.longitude]
      : [0, 37]; // Default fallback
    
    return {
      locations: locs,
      center: centerPoint,
    };
  }, [country]);

  // Custom marker icons
  const createCustomIcon = (color: string, isCountry: boolean = false) => {
    const size = isCountry ? 40 : 32;
    const height = isCountry ? 52 : 42;
    
    return new L.Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${height}" viewBox="0 0 ${size} ${height}">
          <path fill="${color}" d="M${size/2} 0C${size*0.225} 0 0 ${size*0.225} 0 ${size/2}c0 ${size*0.35} ${size/2} ${size*0.8125} ${size/2} ${size*0.8125}s${size/2}-${size*0.4625} ${size/2}-${size*0.8125}C${size} ${size*0.225} ${size*0.775} 0 ${size/2} 0z"/>
          <circle cx="${size/2}" cy="${size/2}" r="${size*0.25}" fill="white"/>
        </svg>
      `)}`,
      iconSize: [size, height],
      iconAnchor: [size/2, height],
      popupAnchor: [0, -height],
    });
  };

  const countryIcon = createCustomIcon('#0d9488', true);
  const attractionIcon = createCustomIcon('#8b5cf6', false);

  // Determine zoom level based on number of attractions
  const zoomLevel = locations.length > 5 ? 6 : locations.length > 2 ? 7 : 8;

  return (
    <>
      {/* OpenStreetMap */}
      <div 
        className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg mb-6"
        style={{ height: '400px' }}
      >
        <MapContainer
          center={center}
          zoom={zoomLevel}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          className="md:h-[400px] h-[300px]"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Markers */}
          {locations.map((loc) => {
            const icon = loc.type === 'country' ? countryIcon : attractionIcon;
            
            return (
              <Marker
                key={`${loc.type}-${loc.id}`}
                position={[loc.lat, loc.lng]}
                icon={icon}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      {loc.type === 'country' && <MapPin className="w-4 h-4 text-teal-600" />}
                      {loc.type === 'attraction' && <Landmark className="w-4 h-4 text-purple-600" />}
                      <span className="font-semibold text-xs uppercase text-gray-500">
                        {loc.type === 'country' ? 'Destination' : 'Attraction'}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{loc.name}</h4>
                    {loc.description && (
                      <p className="text-sm text-gray-600 mb-2">{loc.description}</p>
                    )}
                    {loc.type === 'attraction' && (
                      <Link
                        to={`/attractions/${loc.slug}`}
                        className="text-sm text-primary hover:text-primary-dark font-medium inline-flex items-center gap-1"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </Popup>
                <Tooltip direction="top" offset={[0, loc.type === 'country' ? -52 : -42]} opacity={0.9}>
                  <span className="font-semibold">{loc.name}</span>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Map Legend</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shadow-md">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-700">Destination Center</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-md">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-gray-700">Attractions</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {locations.length > 1 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-teal-600/10 to-teal-600/5 rounded-lg border border-teal-600/20">
            <div className="text-2xl font-bold text-teal-600 font-playfair">
              {locations.filter(l => l.type === 'attraction').length}
            </div>
            <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mt-1">
              Attractions on Map
            </div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <div className="text-2xl font-bold text-primary font-playfair">
              {country.attractions?.length || 0}
            </div>
            <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mt-1">
              Total Attractions
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MapContent;
