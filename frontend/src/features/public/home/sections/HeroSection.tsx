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
  Users,
  MapPin,
  Calendar,
  Navigation,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
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

const popularDestinations = [
  { label: 'Uganda', slug: 'uganda' },
  { label: 'Kenya', slug: 'kenya' },
  { label: 'Tanzania', slug: 'tanzania' },
  { label: 'Rwanda', slug: 'rwanda' },
  { label: 'Mauritius', slug: 'mauritius' },
  { label: 'Dubai', slug: 'dubai' },
  { label: 'Greece', slug: 'greece' },
  { label: 'Maldives', slug: 'maldives' },
];

const trustItems = [
  {
    icon: <Navigation className="w-6 h-6" />,
    title: 'Curated journeys',
    subtitle: 'UNIQUE EXPERIENCES',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Local experts',
    subtitle: 'REAL INSIGHTS',
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Flexible planning',
    subtitle: 'YOUR TRIP, YOUR WAY',
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: '24/7 support',
    subtitle: 'ALWAYS HERE',
  },
];

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('safaris');

  // Search State
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [location, setLocation] = useState<any | null>(null);
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
      fields: ['location', 'dates', 'guests'],
    },
    {
      id: 'group_trips',
      label: 'Group Trips',
      icon: <MapIcon className="w-4 h-4" />,
      fields: ['location', 'dates', 'guests'],
    },
    {
      id: 'packages',
      label: 'Packages',
      icon: <Briefcase className="w-4 h-4" />,
      fields: ['location', 'dates', 'guests'],
    },
    {
      id: 'things_to_do',
      label: 'Things To Do',
      icon: <Palmtree className="w-4 h-4" />,
      fields: ['location', 'dates', 'activiy_types'],
    },
    {
      id: 'hotels',
      label: 'Hotels',
      icon: <HotelIcon className="w-4 h-4" />,
      fields: ['location', 'dates', 'guests'],
    },
    {
      id: 'flights',
      label: 'Flights',
      icon: <Plane className="w-4 h-4" />,
      fields: ['location', 'dates', 'guests'],
    },
  ];

  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  const handleLiveSearch = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.length < 2) return [];

    try {
      const response = await apiClient.post<any>('/search/', {
        query: query,
        limit: 5,
      });

      const hits: SearchResult[] = [];
      const results = response.results || response.data?.results;

      if (results) {
        Object.entries(results).forEach(([indexName, idx]: [string, any]) => {
          if (idx.hits && Array.isArray(idx.hits)) {
            let shouldInclude = false;

            if (activeTab === 'safaris' && (indexName === 'packages' || indexName === 'group_trips'))
              shouldInclude = true;
            if (activeTab === 'group_trips' && indexName === 'group_trips') shouldInclude = true;
            if (activeTab === 'packages' && indexName === 'packages') shouldInclude = true;
            if (
              activeTab === 'things_to_do' &&
              (indexName === 'activities' || indexName === 'attractions')
            )
              shouldInclude = true;
            if (activeTab === 'hotels' && indexName === 'accommodations') shouldInclude = true;

            if (indexName === 'regions' || indexName === 'countries') shouldInclude = true;

            if (shouldInclude) {
              const mappedHits = idx.hits.map((hit: any) => ({
                id: hit.id.toString(),
                title: hit.name || hit.title,
                description:
                  hit.location ||
                  hit.city ||
                  hit.country?.name ||
                  hit.description?.substring(0, 50) + '...',
                image: hit.image_url || hit.cover_image,
                type:
                  indexName === 'packages'
                    ? 'package'
                    : indexName === 'group_trips'
                    ? 'trip'
                    : indexName === 'accommodations'
                    ? 'stay'
                    : indexName === 'activities'
                    ? 'activity'
                    : indexName === 'attractions'
                    ? 'attraction'
                    : indexName === 'countries'
                    ? 'country'
                    : 'region',
                url: hit.slug
                  ? `/${
                      indexName === 'packages'
                        ? 'packages'
                        : indexName === 'group_trips'
                        ? 'group-trips'
                        : indexName === 'accommodations'
                        ? 'hotels'
                        : indexName === 'countries'
                        ? 'destinations'
                        : indexName === 'regions'
                        ? 'destinations/regions'
                        : indexName === 'attractions'
                        ? 'attractions'
                        : indexName
                    }/${hit.slug}`
                  : '#',
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
    if (result.url && result.url !== '#') {
      navigate(result.url);
    } else {
      setSelectedResult(result);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();

    if (selectedResult) {
      searchParams.append('q', selectedResult.title);
    } else if (location && location.value) {
      searchParams.append('q', location.value);
    } else if (queryText) {
      searchParams.append('q', queryText);
    }

    if (dateRange?.from) searchParams.append('from', format(dateRange.from, 'yyyy-MM-dd'));
    if (dateRange?.to) searchParams.append('to', format(dateRange.to, 'yyyy-MM-dd'));

    if (activeTabConfig.fields.includes('guests')) {
      searchParams.append('adults', guests.adults.toString());
      searchParams.append('children', guests.children.toString());
      searchParams.append('rooms', guests.rooms.toString());
    }

    if (activeTab === 'things_to_do' && activityTypes.length > 0) {
      searchParams.append('types', activityTypes.join(','));
    }

    switch (activeTab) {
      case 'hotels':
        navigate(`/hotels?${searchParams.toString()}`);
        break;
      case 'safaris':
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
    }, 6000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <div className="relative bg-charcoal" style={{ minHeight: '720px' }}>
      {/* ── Background: crossfade carousel ── */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((img, index) => (
          <img
            key={img}
            src={img}
            alt={`Travel Hero ${index + 1}`}
            className={`absolute w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        {/* Left-heavy gradient — keeps text readable, reveals scenery on the right */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.50) 45%, rgba(0,0,0,0.15) 100%)',
          }}
        />
        {/* Subtle bottom-to-top dark fade to ground the search card */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)',
          }}
        />
      </div>

      {/* ── Content ── */}
      <div
        className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col justify-between"
        style={{ minHeight: '720px', paddingTop: '100px', paddingBottom: '0' }}
      >
        {/* ── Headline — top-left, two-line ── */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1
            className="font-playfair font-bold leading-tight drop-shadow-xl"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 4.5rem)' }}
          >
            <span className="text-white block">Your Dream Holiday.</span>
            <span className="block" style={{ color: '#eeca80' }}>
              Designed. Booked. Perfected.
            </span>
          </h1>
          <p className="mt-3 text-gray-200 font-lato font-light leading-relaxed text-base md:text-lg max-w-xl">
            Luxury Safaris, Family Holidays, Beach Escapes &amp; Group Trips – All in One Place.
          </p>
        </div>

        {/* ── Search Card ── */}
        <div
          className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100"
          style={{ marginTop: '2.5rem' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-visible">

            {/* ── Tab row ── */}
            <div className="flex items-center border-b border-gray-100 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all duration-200 border-b-2 -mb-px
                    ${
                      activeTab === tab.id
                        ? 'border-teal text-teal bg-teal/5'
                        : 'border-transparent text-gray-500 hover:text-charcoal hover:bg-gray-50'
                    }
                  `}
                >
                  <span
                    className={`transition-colors duration-200 ${
                      activeTab === tab.id ? 'text-teal' : 'text-gray-400'
                    }`}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Search fields row ── */}
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-stretch">

              {/* Where */}
              <div className="flex-1 relative px-5 py-4 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50/60 transition-colors group">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Where are you going?
                </label>
                <HeroSearchInput
                  placeholder="e.g. Seychelles, Kenya, Dubai…"
                  onSearch={handleLiveSearch}
                  onResultSelect={onResultSelect}
                  className="w-full"
                />
              </div>

              {/* Dates */}
              <div className="flex-1 relative px-5 py-4 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50/60 transition-colors cursor-pointer">
                <DateRangePicker
                  range={dateRange}
                  setRange={handleDateRangeSelect}
                  variant="transparent"
                  label={activeTab === 'things_to_do' ? 'When' : 'Dates'}
                  className="w-full"
                />
              </div>

              {/* Guests / Activity Type */}
              <div className="flex-1 relative px-5 py-4 border-b md:border-b-0 md:border-r border-gray-100 hover:bg-gray-50/60 transition-colors">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {activeTabConfig.fields.includes('guests') ? 'Guests' : 'Type'}
                </label>
                {activeTabConfig.fields.includes('guests') ? (
                  <GuestsInput
                    value={guests}
                    onChange={setGuests}
                    showRooms={activeTab === 'hotels'}
                  />
                ) : (
                  <ActivityTypeSelector selectedTypes={activityTypes} onChange={setActivityTypes} />
                )}
              </div>

              {/* Search Button */}
              <div className="flex items-center justify-center px-5 py-4">
                <button
                  type="submit"
                  className="bg-teal hover:bg-teal-dark text-white rounded-xl px-7 py-3.5 shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-base flex items-center gap-2 whitespace-nowrap w-full md:w-auto justify-center"
                  style={{ minWidth: '130px' }}
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>
            </form>

            {/* ── Popular Destinations chips ── */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <span className="flex items-center gap-1 text-xs text-gray-400 font-medium mr-1 shrink-0">
                <MapPin className="w-3.5 h-3.5" />
                Explore popular destinations
              </span>
              {popularDestinations.map((dest) => (
                <button
                  key={dest.slug}
                  onClick={() => navigate(`/destinations/${dest.slug}`)}
                  className="flex items-center gap-1 text-xs font-semibold text-charcoal hover:text-teal transition-colors duration-200 group"
                >
                  <MapPin className="w-3 h-3 text-teal group-hover:text-teal-dark transition-colors" />
                  {dest.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Trust Bar ── */}
        <div
          className="w-full animate-in fade-in duration-700 delay-200"
          style={{ marginTop: '1.75rem', paddingBottom: '2rem' }}
        >
          <div className="flex flex-wrap justify-start gap-y-4">
            {trustItems.map((item, i) => (
              <React.Fragment key={item.title}>
                <div className="flex items-center gap-3 pr-8">
                  <div className="text-butter/90 shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-white font-semibold text-sm leading-tight">{item.title}</p>
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                {i < trustItems.length - 1 && (
                  <div className="hidden sm:block w-px bg-white/20 self-stretch mr-8" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
