import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { 
  Users, 
  Search, 
  MapPin, 
  Calendar,
  Plane,
  Hotel as HotelIcon,
  Compass,
  Map
} from 'lucide-react';
import Button from '../../../../components/ui/Button';
import LocationSearchInput from '../../../../components/ui/LocationSearchInput';
import DateRangePicker from '../../../../components/ui/DateRangePicker';

interface LocationOption {
  label: string;
  value: string;
}

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  fields: ('location' | 'dates' | 'guests' | 'destination' | 'activity')[];
}

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tours');
  const [location, setLocation] = useState<LocationOption | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState('2');
  const [destination, setDestination] = useState<LocationOption | null>(null);
  const [activity, setActivity] = useState('');

  const tabs: TabConfig[] = [
    {
      id: 'tours',
      label: 'Tours',
      icon: <Compass className="w-4 h-4" />,
      fields: ['destination', 'dates', 'guests']
    },
    {
      id: 'group-trips',
      label: 'Group Trips',
      icon: <Users className="w-4 h-4" />,
      fields: ['destination', 'dates']
    },
    {
      id: 'packages',
      label: 'Packages',
      icon: <Map className="w-4 h-4" />,
      fields: ['destination', 'dates', 'guests']
    },
    {
      id: 'things-to-do',
      label: 'Things To Do',
      icon: <Compass className="w-4 h-4" />,
      fields: ['location', 'activity']
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    
    // Add search query based on active fields
    if (activeTabConfig.fields.includes('destination') && destination) {
      searchParams.append('q', destination.value);
    } else if (activeTabConfig.fields.includes('location') && location) {
      searchParams.append('q', location.value);
    } else if (activeTabConfig.fields.includes('activity') && activity) {
      searchParams.append('q', activity);
    }
    
    searchParams.append('type', activeTab);
    
    if (dateRange?.from) searchParams.append('from', format(dateRange.from, 'yyyy-MM-dd'));
    if (dateRange?.to) searchParams.append('to', format(dateRange.to, 'yyyy-MM-dd'));
    if (guests && activeTabConfig.fields.includes('guests')) searchParams.append('guests', guests);

    navigate(`/search?${searchParams.toString()}`);
  };

  const renderSearchFields = () => {
    const fields = activeTabConfig.fields;
    const fieldCount = fields.length;
    const gridCols = fieldCount === 4 ? 'md:grid-cols-4' : fieldCount === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

    return (
      <div className={`grid grid-cols-1 ${gridCols} gap-4 items-end`}>
        {fields.includes('destination') && (
          <div className="text-left">
            <label className="block text-sm font-lato font-semibold text-charcoal mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Destination
            </label>
            <LocationSearchInput
              value={destination}
              onChange={setDestination}
              variant="light"
            />
          </div>
        )}

        {fields.includes('location') && (
          <div className="text-left">
            <label className="block text-sm font-lato font-semibold text-charcoal mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <LocationSearchInput
              value={location}
              onChange={setLocation}
              variant="light"
            />
          </div>
        )}

        {fields.includes('activity') && (
          <div className="text-left">
            <label className="block text-sm font-lato font-semibold text-charcoal mb-2">
              <Compass className="w-4 h-4 inline mr-1" />
              Activity
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="What do you want to do?"
                className="w-full px-4 py-3 border-2 border-teal/30 rounded-lg focus:outline-none focus:border-teal bg-white text-charcoal placeholder-charcoal/50 font-lato transition-colors"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
              />
            </div>
          </div>
        )}

        {fields.includes('dates') && (
          <div className="text-left">
            <label className="block text-sm font-lato font-semibold text-charcoal mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              {activeTab === 'hotels' ? 'Check in - Check out' : 'Travel Dates'}
            </label>
            <DateRangePicker range={dateRange} setRange={setDateRange} variant="light" />
          </div>
        )}

        {fields.includes('guests') && (
          <div className="text-left">
            <label className="block text-sm font-lato font-semibold text-charcoal mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Guests
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                placeholder="Number of guests"
                className="w-full px-4 py-3 border-2 border-teal/30 rounded-lg focus:outline-none focus:border-teal bg-white text-charcoal placeholder-charcoal/50 font-lato transition-colors"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full bg-teal hover:bg-teal/90 text-paper py-3 px-6 rounded-lg flex items-center justify-center text-base font-lato font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <Search className="w-5 h-5 mr-2" />
          Search
        </Button>
      </div>
    );
  };

  return (
    <div className="relative h-[600px] bg-charcoal overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/50 to-charcoal/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-[100] container mx-auto px-4 h-full flex flex-col justify-center items-center">
        {/* Hero Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-paper mb-4 leading-tight drop-shadow-lg">
            Discover Your Next Adventure
          </h1>
          <p className="text-lg md:text-xl text-paper/90 font-lato max-w-2xl mx-auto">
            Perfect timing for ideal destinations - explore the world with confidence
          </p>
        </div>

        {/* Search Card */}
        <form 
          onSubmit={handleSearch} 
          className="relative bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl w-full max-w-5xl border border-teal/20"
        >
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-teal/20">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-lato font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-teal text-paper shadow-md'
                    : 'bg-paper/50 text-charcoal hover:bg-paper hover:shadow-sm'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dynamic Search Fields */}
          {renderSearchFields()}
        </form>

        {/* Quick Links */}
        <div className="mt-6 text-center">
          <p className="text-paper/80 text-sm font-lato mb-2">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Safari Tours', 'Beach Holidays', 'Cultural Trips', 'Adventure Travel'].map((term) => (
              <button
                key={term}
                onClick={() => {
                  const searchParams = new URLSearchParams();
                  searchParams.append('q', term);
                  navigate(`/search?${searchParams.toString()}`);
                }}
                className="px-3 py-1 bg-paper/20 hover:bg-paper/30 text-paper text-xs font-lato rounded-full transition-colors backdrop-blur-sm"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
