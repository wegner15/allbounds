import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, Star, Clock, Compass, DollarSign, Eye, EyeOff } from 'lucide-react';
import { usePackages } from '../../../lib/hooks/usePackages';
import { useHotels } from '../../../lib/hooks/useHotels';
import { useActivities } from '../../../lib/hooks/useActivities';
import { useAttractions } from '../../../lib/hooks/useAttractions';

import HotelCard from './HotelCard';
import PackageCard from './PackageCard';
import ActivityCard from './ActivityCard';
import AttractionCard from './AttractionCard';

interface DestinationExplorerProps {
  countryId: number;
  countryName: string;
  destinationSlug: string;
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
}

type ExplorerTab = 'all' | 'hotels' | 'packages' | 'activities' | 'attractions';

export const DestinationExplorer: React.FC<DestinationExplorerProps> = ({
  countryId,
  countryName,
  destinationSlug,
  activeTabId = 'all',
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState<ExplorerTab>(activeTabId as ExplorerTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const explorerRef = useRef<HTMLDivElement>(null);

  // Sync activeTab state with activeTabId prop
  useEffect(() => {
    if (activeTabId) {
      setActiveTab(activeTabId as ExplorerTab);
    }
  }, [activeTabId]);

  // Handle Tab Change internally and externally
  const handleTabSelect = (tab: ExplorerTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    resetAllFilters();
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Fetch data
  const { data: hotels, isLoading: hotelsLoading } = useHotels();
  const { data: packages, isLoading: packagesLoading } = usePackages({ country_id: countryId });
  const { data: activities, isLoading: activitiesLoading } = useActivities(countryId);
  const { data: attractions, isLoading: attractionsLoading } = useAttractions({ country: countryName });

  // Filter States
  // 1. Hotels
  const [hotelStars, setHotelStars] = useState<number[]>([]);
  const [hotelPriceCategories, setHotelPriceCategories] = useState<string[]>([]);
  
  // 2. Packages
  const [packageDurations, setPackageDurations] = useState<string[]>([]);
  const [packageBudgets, setPackageBudgets] = useState<string[]>([]);
  const [packageTypes, setPackageTypes] = useState<string[]>([]);

  // 3. Activities
  const [activityIntensities, setActivityIntensities] = useState<string[]>([]);
  const [activityDurations, setActivityDurations] = useState<string[]>([]);

  // 4. Attractions
  const [attractionTypes, setAttractionTypes] = useState<string[]>([]);

  // Reset Filters
  const resetAllFilters = () => {
    setHotelStars([]);
    setHotelPriceCategories([]);
    setPackageDurations([]);
    setPackageBudgets([]);
    setPackageTypes([]);
    setActivityIntensities([]);
    setActivityDurations([]);
    setAttractionTypes([]);
    setSearchQuery('');
  };

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery !== '' ||
      hotelStars.length > 0 ||
      hotelPriceCategories.length > 0 ||
      packageDurations.length > 0 ||
      packageBudgets.length > 0 ||
      packageTypes.length > 0 ||
      activityIntensities.length > 0 ||
      activityDurations.length > 0 ||
      attractionTypes.length > 0
    );
  }, [
    searchQuery, hotelStars, hotelPriceCategories, packageDurations,
    packageBudgets, packageTypes, activityIntensities, activityDurations,
    attractionTypes
  ]);

  // Loading indicator helper
  const isLoading = hotelsLoading || packagesLoading || activitiesLoading || attractionsLoading;

  // ----------------------------------------------------
  // FILTERING LOGIC
  // ----------------------------------------------------

  // 1. Hotels
  const filteredHotels = useMemo(() => {
    const list = hotels?.filter(h => h.country_id === countryId && h.is_active) || [];
    return list.filter(hotel => {
      // Search query
      if (searchQuery && !hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !(hotel.summary || '').toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Star rating
      if (hotelStars.length > 0 && (!hotel.stars || !hotelStars.includes(hotel.stars))) {
        return false;
      }
      // Price category
      if (hotelPriceCategories.length > 0 && (!hotel.price_category || !hotelPriceCategories.includes(hotel.price_category.toLowerCase()))) {
        return false;
      }
      return true;
    });
  }, [hotels, countryId, searchQuery, hotelStars, hotelPriceCategories]);

  // 2. Packages
  const filteredPackages = useMemo(() => {
    const list = packages?.filter(p => p.is_active) || [];
    return list.filter(pkg => {
      // Search query
      if (searchQuery && !pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !(pkg.summary || '').toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Duration
      if (packageDurations.length > 0) {
        let match = false;
        if (packageDurations.includes('2-3') && pkg.duration_days >= 2 && pkg.duration_days <= 3) match = true;
        if (packageDurations.includes('4-6') && pkg.duration_days >= 4 && pkg.duration_days <= 6) match = true;
        if (packageDurations.includes('7-10') && pkg.duration_days >= 7 && pkg.duration_days <= 10) match = true;
        if (packageDurations.includes('10+') && pkg.duration_days > 10) match = true;
        if (!match) return false;
      }
      // Budget
      if (packageBudgets.length > 0) {
        let match = false;
        const price = pkg.price || 0;
        if (packageBudgets.includes('under-1000') && price < 1000) match = true;
        if (packageBudgets.includes('1000-3000') && price >= 1000 && price <= 3000) match = true;
        if (packageBudgets.includes('3000-5000') && price >= 3000 && price <= 5000) match = true;
        if (packageBudgets.includes('5000+') && price > 5000) match = true;
        if (!match) return false;
      }
      // Package Type
      if (packageTypes.length > 0) {
        const types = pkg.holiday_types?.map(t => t.slug.toLowerCase()) || [];
        const hasMatch = packageTypes.some(t => types.includes(t.toLowerCase()));
        if (!hasMatch) return false;
      }
      return true;
    });
  }, [packages, searchQuery, packageDurations, packageBudgets, packageTypes]);

  // 3. Activities
  const filteredActivities = useMemo(() => {
    const list = activities?.filter(a => a.is_active) || [];
    return list.filter(activity => {
      // Search query
      if (searchQuery && !activity.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !(activity.summary || '').toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Intensity (simulated from desc keywords or is_featured since backend field is text description)
      if (activityIntensities.length > 0) {
        const desc = (activity.description || '').toLowerCase();
        let intensity = 'moderate';
        if (desc.includes('extreme') || desc.includes('rafting') || desc.includes('trekking') || desc.includes('climbing')) intensity = 'extreme';
        else if (desc.includes('relax') || desc.includes('leisure') || desc.includes('stroll') || desc.includes('sightseeing')) intensity = 'relaxed';
        
        if (!activityIntensities.includes(intensity)) return false;
      }
      // Duration (simulated from desc)
      if (activityDurations.length > 0) {
        const desc = (activity.description || '').toLowerCase();
        let duration = 'half-day';
        if (desc.includes('multi-day') || desc.includes('days safari') || desc.includes('camping')) duration = 'multi-day';
        else if (desc.includes('full day') || desc.includes('8 hours') || desc.includes('all day')) duration = 'full-day';
        
        if (!activityDurations.includes(duration)) return false;
      }
      return true;
    });
  }, [activities, searchQuery, activityIntensities, activityDurations]);

  // 4. Attractions
  const filteredAttractions = useMemo(() => {
    const list = attractions?.filter(a => a.is_active) || [];
    return list.filter(attraction => {
      // Search query
      if (searchQuery && !attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !(attraction.summary || '').toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Type (simulated from desc)
      if (attractionTypes.length > 0) {
        const desc = (attraction.description || '').toLowerCase();
        let type = 'landmark';
        if (desc.includes('museum') || desc.includes('history') || desc.includes('ancient')) type = 'historical';
        else if (desc.includes('park') || desc.includes('reserve') || desc.includes('nature') || desc.includes('lake') || desc.includes('mountain')) type = 'natural';
        else if (desc.includes('church') || desc.includes('mosque') || desc.includes('temple')) type = 'religious';
        
        if (!attractionTypes.includes(type)) return false;
      }
      return true;
    });
  }, [attractions, searchQuery, attractionTypes]);

  // Combined Results (All Experiences Tab)
  const combinedResults = useMemo(() => {
    const results: { type: 'hotel' | 'package' | 'activity' | 'attraction'; item: any; id: string }[] = [];
    
    filteredPackages.forEach(p => results.push({ type: 'package', item: p, id: `pkg-${p.id}` }));
    filteredActivities.forEach(a => results.push({ type: 'activity', item: a, id: `act-${a.id}` }));
    filteredAttractions.forEach(a => results.push({ type: 'attraction', item: a, id: `attr-${a.id}` }));
    filteredHotels.forEach(h => results.push({ type: 'hotel', item: h, id: `hot-${h.id}` }));

    return results;
  }, [filteredHotels, filteredPackages, filteredActivities, filteredAttractions]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    if (activeTab === 'all') return combinedResults.slice(start, end);
    if (activeTab === 'hotels') return filteredHotels.slice(start, end);
    if (activeTab === 'packages') return filteredPackages.slice(start, end);
    if (activeTab === 'activities') return filteredActivities.slice(start, end);
    return filteredAttractions.slice(start, end);
  }, [activeTab, combinedResults, filteredHotels, filteredPackages, filteredActivities, filteredAttractions, currentPage]);

  const totalPages = useMemo(() => {
    let count = 0;
    if (activeTab === 'all') count = combinedResults.length;
    else if (activeTab === 'hotels') count = filteredHotels.length;
    else if (activeTab === 'packages') count = filteredPackages.length;
    else if (activeTab === 'activities') count = filteredActivities.length;
    else count = filteredAttractions.length;

    return Math.max(1, Math.ceil(count / itemsPerPage));
  }, [activeTab, combinedResults, filteredHotels, filteredPackages, filteredActivities, filteredAttractions]);

  // Reset page to 1 when tab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, hotelStars, hotelPriceCategories, packageDurations, packageBudgets, packageTypes, activityIntensities, activityDurations, attractionTypes]);

  // Helper toggle functions
  const toggleFilter = (value: any, list: any[], setList: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (list.includes(value)) {
      setList(list.filter(v => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  return (
    <div ref={explorerRef} className="scroll-mt-24">
      {/* Search and Mobile Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search hotels, packages, or experiences in ${countryName}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700 bg-gray-50/50 hover:bg-gray-50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-sm font-semibold text-gray-500 hover:text-primary transition-colors px-3 py-2 rounded-lg"
            >
              Clear Filters
            </button>
          )}
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Explorer Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT SIDEBAR: Tabs and Sub-Filters */}
        <aside className={`lg:col-span-1 space-y-6 ${mobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
          
          {/* Primary Tabs */}
          <div className="bg-white rounded-2xl border border-gray-200/60 p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 px-2">Category</h3>
            <div className="flex flex-col gap-1">
              {[
                { id: 'all', label: 'All Experiences', icon: '✈️' },
                { id: 'hotels', label: 'Where to Stay', icon: '🏨' },
                { id: 'packages', label: 'Featured Packages', icon: '🧳' },
                { id: 'activities', label: 'Experiences', icon: '🎯' },
                { id: 'attractions', label: 'Top Things to Do', icon: '📍' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabSelect(tab.id as ExplorerTab)}
                    className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left font-semibold text-sm transition-all duration-300 ${
                      isActive
                        ? 'bg-primary/10 text-primary border-l-4 border-primary pl-3'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-dark border-l-4 border-transparent'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Sub-Filters Panel */}
          {activeTab !== 'all' && (
            <div className="bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-800 text-sm">Refine Results</h3>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* HOTELS SUB-FILTERS */}
              {activeTab === 'hotels' && (
                <div className="space-y-6">
                  {/* Star Rating */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Star Rating</h4>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <label key={stars} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={hotelStars.includes(stars)}
                            onChange={() => toggleFilter(stars, hotelStars, setHotelStars)}
                            className="rounded border-gray-300 text-primary focus:ring-primary w-4.5 h-4.5"
                          />
                          <span className="flex items-center gap-1 text-sm text-gray-600 group-hover:text-gray-900 font-medium">
                            {stars} Stars
                            <span className="flex">
                              {[...Array(stars)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                              ))}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price/Budget */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Budget Category</h4>
                    <div className="space-y-2">
                      {[
                        { id: 'budget', label: 'Economy ($)' },
                        { id: 'mid-range', label: 'Mid-range ($$)' },
                        { id: 'luxury', label: 'Luxury ($$$)' },
                        { id: 'ultra-luxury', label: 'Ultra Luxury ($$$$)' },
                      ].map((item) => (
                        <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={hotelPriceCategories.includes(item.id)}
                            onChange={() => toggleFilter(item.id, hotelPriceCategories, setHotelPriceCategories)}
                            className="rounded border-gray-300 text-primary focus:ring-primary w-4.5 h-4.5"
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PACKAGES SUB-FILTERS */}
              {activeTab === 'packages' && (
                <div className="space-y-6">
                  {/* Duration */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Duration</h4>
                    <div className="space-y-2">
                      {[
                        { id: '2-3', label: '2 - 3 Days' },
                        { id: '4-6', label: '4 - 6 Days' },
                        { id: '7-10', label: '7 - 10 Days' },
                        { id: '10+', label: '10+ Days' },
                      ].map((item) => (
                        <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={packageDurations.includes(item.id)}
                            onChange={() => toggleFilter(item.id, packageDurations, setPackageDurations)}
                            className="rounded border-gray-300 text-primary focus:ring-primary w-4.5 h-4.5"
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Price Range</h4>
                    <div className="space-y-2">
                      {[
                        { id: 'under-1000', label: 'Under $1,000' },
                        { id: '1000-3000', label: '$1,000 - $3,000' },
                        { id: '3000-5000', label: '$3,000 - $5,000' },
                        { id: '5000+', label: 'Over $5,000' },
                      ].map((item) => (
                        <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={packageBudgets.includes(item.id)}
                            onChange={() => toggleFilter(item.id, packageBudgets, setPackageBudgets)}
                            className="rounded border-gray-300 text-primary focus:ring-primary w-4.5 h-4.5"
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Travel/Holiday Style */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Travel Style</h4>
                    <div className="space-y-2">
                      {[
                        { id: 'safari', label: 'Safaris & Wildlife' },
                        { id: 'beach', label: 'Beach Holidays' },
                        { id: 'family', label: 'Family Travel' },
                        { id: 'honeymoon', label: 'Honeymoon & Romantic' },
                        { id: 'luxury', label: 'Luxury Tours' },
                      ].map((item) => (
                        <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={packageTypes.includes(item.id)}
                            onChange={() => toggleFilter(item.id, packageTypes, setPackageTypes)}
                            className="rounded border-gray-300 text-primary focus:ring-primary w-4.5 h-4.5"
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ACTIVITIES SUB-FILTERS */}
              {activeTab === 'activities' && (
                <div className="space-y-6">
                  {/* Intensity */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Intensity Level</h4>
                    <div className="space-y-2">
                      {[
                        { id: 'relaxed', label: 'Relaxed & Leisure' },
                        { id: 'moderate', label: 'Moderate Adventure' },
                        { id: 'extreme', label: 'Extreme Thrills' },
                      ].map((item) => (
                        <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={activityIntensities.includes(item.id)}
                            onChange={() => toggleFilter(item.id, activityIntensities, setActivityIntensities)}
                            className="rounded border-gray-300 text-primary focus:ring-primary w-4.5 h-4.5"
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Duration</h4>
                    <div className="space-y-2">
                      {[
                        { id: 'half-day', label: 'Half Day (1-4h)' },
                        { id: 'full-day', label: 'Full Day (4-8h)' },
                        { id: 'multi-day', label: 'Multi-Day Trek/Tour' },
                      ].map((item) => (
                        <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={activityDurations.includes(item.id)}
                            onChange={() => toggleFilter(item.id, activityDurations, setActivityDurations)}
                            className="rounded border-gray-300 text-primary focus:ring-primary w-4.5 h-4.5"
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ATTRACTIONS SUB-FILTERS */}
              {activeTab === 'attractions' && (
                <div className="space-y-6">
                  {/* Attraction Type */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Attraction Type</h4>
                    <div className="space-y-2">
                      {[
                        { id: 'landmark', label: 'Scenic Landmarks' },
                        { id: 'natural', label: 'National Parks & Nature' },
                        { id: 'historical', label: 'Museums & Heritage' },
                        { id: 'religious', label: 'Religious Sites' },
                      ].map((item) => (
                        <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={attractionTypes.includes(item.id)}
                            onChange={() => toggleFilter(item.id, attractionTypes, setAttractionTypes)}
                            className="rounded border-gray-300 text-primary focus:ring-primary w-4.5 h-4.5"
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* RIGHT AREA: Filter Results Grid */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-150 rounded-2xl h-80 animate-pulse p-4 space-y-4">
                  <div className="h-40 bg-gray-250 rounded-xl w-full"></div>
                  <div className="h-6 bg-gray-250 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-250 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : paginatedItems.length > 0 ? (
            <>
              {/* Results count indicator */}
              <div className="flex items-center justify-between text-sm text-gray-500 font-semibold px-1">
                <span>
                  Showing {paginatedItems.length} of{' '}
                  {activeTab === 'all' && combinedResults.length}
                  {activeTab === 'hotels' && filteredHotels.length}
                  {activeTab === 'packages' && filteredPackages.length}
                  {activeTab === 'activities' && filteredActivities.length}
                  {activeTab === 'attractions' && filteredAttractions.length} results
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'all' &&
                  (paginatedItems as typeof combinedResults).map((res) => {
                    if (res.type === 'package') return <PackageCard key={res.id} package={res.item as any} />;
                    if (res.type === 'activity') return <ActivityCard key={res.id} activity={res.item as any} />;
                    if (res.type === 'attraction') return <AttractionCard key={res.id} attraction={res.item as any} />;
                    return <HotelCard key={res.id} hotel={res.item as any} />;
                  })}

                {activeTab === 'hotels' &&
                  (paginatedItems as typeof filteredHotels).map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel as any} />
                  ))}

                {activeTab === 'packages' &&
                  (paginatedItems as typeof filteredPackages).map((pkg) => (
                    <PackageCard key={pkg.id} package={pkg} />
                  ))}

                {activeTab === 'activities' &&
                  (paginatedItems as typeof filteredActivities).map((act) => (
                    <ActivityCard key={act.id} activity={act} />
                  ))}

                {activeTab === 'attractions' &&
                  (paginatedItems as typeof filteredAttractions).map((attr) => (
                    <AttractionCard key={attr.id} attraction={attr as any} />
                  ))}
              </div>

              {/* Premium Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-12 border-t border-gray-150">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed select-none transition-colors"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 text-sm font-bold rounded-lg transition-colors select-none ${
                          isActive
                            ? 'bg-primary text-white shadow-md shadow-primary/10'
                            : 'border border-gray-250 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed select-none transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-20 bg-white border border-gray-200/60 rounded-2xl p-8 shadow-sm">
              <div className="text-5xl mb-4 text-gray-300">🔍</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No matching listings found</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                We couldn't find any results matching your search terms or applied filters in {countryName}.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all text-sm"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DestinationExplorer;
