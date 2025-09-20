import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Users, Search } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import LocationSearchInput from '../../../../components/ui/LocationSearchInput';
import DateRangePicker from '../../../../components/ui/DateRangePicker';

interface LocationOption {
  label: string;
  value: string;
}

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Tours');
  const [location, setLocation] = useState<LocationOption | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState('');

  const tabs = ['Tours', 'Group Trips', 'Packages', 'Things To Do', 'Hotel', 'Flights'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    if (location) searchParams.append('q', location.value);
    if (activeTab) searchParams.append('type', activeTab.toLowerCase());
    if (dateRange?.from) searchParams.append('from', format(dateRange.from, 'yyyy-MM-dd'));
    if (dateRange?.to) searchParams.append('to', format(dateRange.to, 'yyyy-MM-dd'));
    if (guests) searchParams.append('guests', guests);

    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="relative h-[550px] bg-gray-900">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          "Perfect Timing for Ideal Destinations"
        </h1>
        
        <form onSubmit={handleSearch} className="bg-white/20 backdrop-blur-lg rounded-lg p-4 shadow-2xl w-full max-w-4xl border border-white/30">
          <div className="flex border-b border-white/30 mb-4">
            {tabs.map(tab => (
              <button 
                key={tab}
                type="button"
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-white text-white'
                    : 'text-gray-200 hover:text-white'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="text-left">
              <label className="block text-xs font-medium text-gray-200 mb-1">Location</label>
              <LocationSearchInput
                value={location}
                onChange={setLocation}
              />
            </div>
            <div className="text-left">
              <label className="block text-xs font-medium text-gray-200 mb-1">Check in - Check out</label>
              <DateRangePicker range={dateRange} setRange={setDateRange} />
            </div>
            <div className="text-left">
              <label className="block text-xs font-medium text-gray-200 mb-1">Guest</label>
              <div className="flex items-center border-b border-white/30 py-1">
                <Users className="w-4 h-4 mr-2 text-gray-200" />
                <input
                  type="text"
                  placeholder="2 adults, 1 child"
                  className="w-full bg-transparent focus:outline-none text-white placeholder-gray-300"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center justify-center text-base">
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroSection;
