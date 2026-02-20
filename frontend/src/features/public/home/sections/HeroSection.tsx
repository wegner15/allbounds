import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import {
  Search,
  Hotel as HotelIcon,
  Compass,
  Map as MapIcon,
  Palmtree,
  Plane,
  Briefcase,
  Calendar,
  Users
} from 'lucide-react';
import LocationSearchInput from '../../../../components/ui/LocationSearchInput';
import DateRangePicker from '../../../../components/ui/DateRangePicker';
import GuestsInput, { type GuestConfig } from '../../../../components/ui/GuestsInput';
import HeroSearchInput, { type SearchResult } from './components/HeroSearchInput';
import ActivityTypeSelector from './components/ActivityTypeSelector';
import { apiClient } from '../../../../lib/api';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  fields: ('location' | 'dates' | 'guests' | 'activiy_types')[];
}

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('safaris'); // Default to Safaris

  // Search State
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [location, setLocation] = useState<any | null>(null); // For legacy LocationSearchInput fallback
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [queryText, setQueryText] = useState('');
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    console.log('HeroSection: Date Range Selected:', range);
    setDateRange(range);
  };
  const [guests, setGuests] = useState<GuestConfig>({ adults: 2, children: 0, rooms: 1 });
  const [activityTypes, setActivityTypes] = useState<string[]>([]);

  const tabs: TabConfig[] = [
    {
      id: 'safaris',
      label: 'Safaris',
      icon: <Compass className="w-4 h-4" />,
      fields: ['location', 'dates', 'guests']
    },
    {
      id: 'group_trips',
      label: 'Group Trips',
      icon: <MapIcon className="w-4 h-4" />,
      fields: ['location', 'dates', 'guests']
    },
    {
      id: 'packages',
      label: 'Packages',
      icon: <Briefcase className="w-4 h-4" />,
      fields: ['location', 'dates', 'guests']
    },
    {
      id: 'things_to_do',
      label: 'Things To Do',
      icon: <Palmtree className="w-4 h-4" />,
      fields: ['location', 'dates', 'activiy_types']
    },
    {
      id: 'hotels',
      label: 'Hotels',
      icon: <HotelIcon className="w-4 h-4" />,
      fields: ['location', 'dates', 'guests']
    },
    {
      id: 'flights',
      label: 'Flights',
      icon: <Plane className="w-4 h-4" />,
      fields: ['location', 'dates', 'guests']
    }
  ];

  const activeTabConfig = tabs.find(tab => tab.id === activeTab) || tabs[0];

  const handleLiveSearch = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.length < 2) return [];

    try {
      // Call global search to get results from all indices
      const response = await apiClient.post<any>('/search/', {
        query: query,
        limit: 5
      });

      const hits: SearchResult[] = [];
      const results = response.results || response.data?.results;

      if (results) {
        Object.entries(results).forEach(([indexName, idx]: [string, any]) => {
          if (idx.hits && Array.isArray(idx.hits)) {
            // Filter hits based on active tab
            let shouldInclude = false;

            // Logic: Map tabs to indices
            // Safaris -> packages, group_trips
            // Group Trips -> group_trips
            // Packages -> packages
            // Things To Do -> activities, attractions
            // Hotels -> accommodations
            // Flights -> none (for now)

            if (activeTab === 'safaris' && (indexName === 'packages' || indexName === 'group_trips')) shouldInclude = true;
            if (activeTab === 'group_trips' && indexName === 'group_trips') shouldInclude = true;
            if (activeTab === 'packages' && indexName === 'packages') shouldInclude = true;
            if (activeTab === 'things_to_do' && (indexName === 'activities' || indexName === 'attractions')) shouldInclude = true;
            if (activeTab === 'hotels' && indexName === 'accommodations') shouldInclude = true;

            // Always include destinations (regions/countries) for "Where" suggestions
            if (indexName === 'regions' || indexName === 'countries') shouldInclude = true;

            if (shouldInclude) {
              const mappedHits = idx.hits.map((hit: any) => ({
                id: hit.id.toString(),
                title: hit.name || hit.title,
                description: hit.location || hit.city || hit.country?.name || hit.description?.substring(0, 50) + '...',
                image: hit.image_url || hit.cover_image,
                type: indexName === 'packages' ? 'package' :
                  indexName === 'group_trips' ? 'trip' :
                    indexName === 'accommodations' ? 'stay' :
                      indexName === 'activities' ? 'activity' :
                        indexName === 'attractions' ? 'attraction' :
                          indexName === 'countries' ? 'country' : 'region',
                url: hit.slug ? `/${indexName === 'packages' ? 'packages' :
                  indexName === 'group_trips' ? 'group-trips' :
                    indexName === 'accommodations' ? 'hotels' :
                      indexName === 'countries' ? 'destinations/countries' :
                        indexName === 'regions' ? 'destinations/regions' :
                          indexName === 'attractions' ? 'attractions' :
                            indexName // Default fallback
                  }/${hit.slug}` : '#'
              }));
              hits.push(...mappedHits);
            }
          }
        });
      }

      return hits;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const onResultSelect = (result: SearchResult) => {
    // Navigate immediately to the result page
    if (result.url && result.url !== '#') {
      navigate(result.url);
    } else {
      setSelectedResult(result);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();

    // Query/Location
    if (selectedResult) {
      searchParams.append('q', selectedResult.title);
    } else if (location && location.value) {
      searchParams.append('q', location.value);
    } else if (queryText) {
      searchParams.append('q', queryText);
    }

    // Dates
    if (dateRange?.from) searchParams.append('from', format(dateRange.from, 'yyyy-MM-dd'));
    if (dateRange?.to) searchParams.append('to', format(dateRange.to, 'yyyy-MM-dd'));

    // Guests
    if (activeTabConfig.fields.includes('guests')) {
      searchParams.append('adults', guests.adults.toString());
      searchParams.append('children', guests.children.toString());
      searchParams.append('rooms', guests.rooms.toString());
    }

    // Activity Types
    if (activeTab === 'things_to_do' && activityTypes.length > 0) {
      searchParams.append('types', activityTypes.join(','));
    }

    // Route logic
    switch (activeTab) {
      case 'hotels':
        navigate(`/hotels?${searchParams.toString()}`);
        break;
      case 'safaris':
        // Specifically route to Africa Region Page for Safaris as per user request
        navigate(`/destinations/africa?${searchParams.toString()}`);
        break;
      case 'group_trips':
        navigate(`/group-trips?${searchParams.toString()}`);
        break;
      case 'packages':
        navigate(`/packages?${searchParams.toString()}`);
        break;
      case 'things_to_do':
        navigate(`/activities?${searchParams.toString()}`);
        break;
      case 'flights':
        navigate(`/flights?${searchParams.toString()}`);
        break;
      default:
        navigate(`/search?${searchParams.toString()}`);
    }
  };

  const heroImages = [
    '/home-heros/hero1.jpeg',
    '/home-heros/hero2.webp',
    '/home-heros/hero3.webp',
    '/home-heros/hero4.jpeg',
    '/home-heros/hero5.jpeg',
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="relative h-[650px] bg-charcoal">
      {/* Background with advanced overlay and crossfade carousel */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((img, index) => (
          <img
            key={img}
            src={img}
            alt={`Travel Hero ${index + 1}`}
            className={`absolute w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent opacity-90 z-10"></div>
        <div className="absolute inset-0 bg-black/20 z-10"></div>
      </div>

      <div className="relative z-20 max-w-[1600px] mx-auto px-4 h-full flex flex-col justify-center items-center pt-16">

        {/* Headline */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-6 leading-tight drop-shadow-xl tracking-wide">
            Your Dream Holiday. Designed. Booked. Perfected.
          </h1>
          <p className="text-lg md:text-xl text-gray-200 font-lato max-w-3xl mx-auto font-light leading-relaxed">
            Luxury Safaris, Family Holidays, Beach Escapes & Group Trips – All in One Place.
          </p>
        </div>

        {/* Search Component Container */}
        <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">

          {/* Tabs */}
          <div className="flex justify-center mb-6 overflow-x-auto">
            <div className="inline-flex bg-black/30 backdrop-blur-md p-1 rounded-full border border-white/10 whitespace-nowrap">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300
                    ${activeTab === tab.id
                      ? 'bg-white text-charcoal shadow-lg scale-105'
                      : 'text-white hover:bg-white/10'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unified Search Bar */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-4 relative group"
          >
            {/* Location / Search Section */}
            <div className="flex-1 w-full md:w-auto relative border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-300 transition-colors bg-gray-50/50">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                <MapIcon className="w-4 h-4 text-teal" />
                Destination
              </label>
              <HeroSearchInput
                placeholder="Where are you going?"
                onSearch={handleLiveSearch}
                onResultSelect={onResultSelect}
                className="w-full"
              />
            </div>

            {/* Dates Section */}
            <div className="flex-1 w-full md:w-auto relative border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-300 transition-colors bg-gray-50/50">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4 text-teal" />
                {activeTab === 'things_to_do' ? 'When' : 'Travel Dates'}
              </label>
              <div className="w-full h-[24px]">
                <DateRangePicker
                  range={dateRange}
                  setRange={handleDateRangeSelect}
                  variant="transparent"
                  className="h-full"
                />
              </div>
            </div>

            {/* Third Section: Guests or Activity Type */}
            <div className="flex-1 w-full md:w-auto relative border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-300 transition-colors bg-gray-50/50">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                <Users className="w-4 h-4 text-teal" />
                {activeTabConfig.fields.includes('guests') ? 'Guests' : 'Type'}
              </label>

              {activeTabConfig.fields.includes('guests') ? (
                <GuestsInput
                  value={guests}
                  onChange={setGuests}
                  showRooms={activeTab === 'hotels'}
                />
              ) : (
                <ActivityTypeSelector
                  selectedTypes={activityTypes}
                  onChange={setActivityTypes}
                />
              )}
            </div>

            {/* Search Button */}
            <div className="md:w-auto w-full">
              <button
                type="submit"
                className="w-full md:w-auto bg-teal hover:bg-teal-dark text-white rounded-xl px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 h-full min-h-[50px]"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
