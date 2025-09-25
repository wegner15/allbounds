import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    road?: string;
    house_number?: string;
  };
}

interface LocationPickerProps {
  initialLocation?: LocationData;
  onLocationSelect: (location: LocationData) => void;
  height?: string;
}

// Component to handle map clicks and update marker position
const MapClickHandler: React.FC<{
  onLocationSelect: (location: LocationData) => void;
  setMarkerPosition: (pos: [number, number]) => void;
}> = ({ onLocationSelect, setMarkerPosition }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      
      // Reverse geocoding to get address details
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        );
        const data = await response.json();
        
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: data.display_name,
          city: data.address?.city || data.address?.town || data.address?.village,
          country: data.address?.country,
        });
      } catch (error) {
        console.error('Error getting address:', error);
        onLocationSelect({
          latitude: lat,
          longitude: lng,
        });
      }
    },
  });
  
  return null;
};

// Component to update map view when search result is selected
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  
  return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  initialLocation,
  onLocationSelect,
  height = '400px'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : [0, 0]
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : [0, 0]
  );
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search for locations using Nominatim API
  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    console.log('Searching for:', query);
    setIsSearching(true);
    try {
      // Use a CORS proxy or try direct request
      const baseUrl = 'https://nominatim.openstreetmap.org/search';
      const params = new URLSearchParams({
        format: 'json',
        q: query,
        addressdetails: '1',
        limit: '5',
        'accept-language': 'en'
      });
      
      const url = `${baseUrl}?${params.toString()}`;
      console.log('API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Remove mode: 'cors' to let browser handle it
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SearchResult[] = await response.json();
      console.log('Search results:', data);
      console.log('Number of results:', data.length);
      
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
      } else {
        console.log('No results found');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      
      // For development/testing, show some sample results
      if (query.toLowerCase().includes('london')) {
        const mockResults: SearchResult[] = [
          {
            display_name: 'London, Greater London, England, United Kingdom',
            lat: '51.5074456',
            lon: '-0.1277653',
            address: {
              city: 'London',
              country: 'United Kingdom'
            }
          }
        ];
        setSearchResults(mockResults);
      } else if (query.toLowerCase().includes('paris')) {
        const mockResults: SearchResult[] = [
          {
            display_name: 'Paris, Île-de-France, France',
            lat: '48.8566969',
            lon: '2.3514616',
            address: {
              city: 'Paris',
              country: 'France'
            }
          }
        ];
        setSearchResults(mockResults);
      } else {
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(searchQuery);
      }, 500);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Debug searchResults changes
  useEffect(() => {
    console.log('SearchResults changed:', searchResults.length, searchResults);
  }, [searchResults]);

  const handleSearchResultSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setMarkerPosition([lat, lng]);
    setMapCenter([lat, lng]);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    
    onLocationSelect({
      latitude: lat,
      longitude: lng,
      address: result.display_name,
      city: result.address?.city || result.address?.town || result.address?.village,
      country: result.address?.country,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
        />
        
        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal"></div>
          </div>
        )}
        
        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto" style={{ zIndex: 1000, top: '100%' }}>
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSearchResultSelect(result)}
                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50 block"
              >
                <div className="font-medium text-gray-900 truncate">
                  {result.display_name}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div style={{ height }} className="border border-gray-300 rounded-md overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={initialLocation ? 15 : 2}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Marker */}
          {(markerPosition[0] !== 0 || markerPosition[1] !== 0) && (
            <Marker position={markerPosition} />
          )}
          
          {/* Map click handler */}
          <MapClickHandler 
            onLocationSelect={onLocationSelect}
            setMarkerPosition={setMarkerPosition}
          />
          
          {/* Map updater for search results */}
          <MapUpdater center={mapCenter} />
        </MapContainer>
      </div>

      {/* Instructions */}
      <p className="text-sm text-gray-600">
        Search for a location above or click on the map to select a position. The selected location will be used for the hotel coordinates.
      </p>
    </div>
  );
};

export default LocationPicker;
