import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X, Star, ArrowRight, Tag as TagIcon, ChevronRight, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePackages } from '../../../lib/hooks/usePackages';
import { useHotels } from '../../../lib/hooks/useHotels';
import { useActivities } from '../../../lib/hooks/useActivities';
import { useAttractions } from '../../../lib/hooks/useAttractions';
import { useContentTags } from '../../../lib/hooks/useContentTags';

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
  hotels?: any[];
  activities?: any[];
  attractions?: any[];
}

type ExplorerTab = 'all' | 'hotels' | 'packages' | 'activities' | 'attractions';

const CATEGORY_ITEMS = [
  { id: 'hotels', label: 'Where to Stay', icon: '🏨', anchor: 'section-hotels', slug: 'hotels' },
  { id: 'packages', label: 'Featured Packages', icon: '🧳', anchor: 'section-packages', slug: 'packages' },
  { id: 'activities', label: 'Experiences', icon: '🎯', anchor: 'section-activities', slug: 'activities' },
  { id: 'attractions', label: 'Top Things to Do', icon: '📍', anchor: 'section-attractions', slug: 'attractions' },
];

export const DestinationExplorer: React.FC<DestinationExplorerProps> = ({
  countryId,
  countryName,
  destinationSlug,
  activeTabId = 'all',
  onTabChange,
  hotels: initialHotels,
  activities: initialActivities,
  attractions: initialAttractions
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ExplorerTab>(activeTabId as ExplorerTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const explorerRef = useRef<HTMLDivElement>(null);

  // Content Tags hook for dynamic filtering
  const { data: contentTags = [] } = useContentTags({ include_inactive: false });
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // Sync activeTab state with activeTabId prop
  useEffect(() => {
    if (activeTabId) {
      setActiveTab(activeTabId as ExplorerTab);
    }
  }, [activeTabId]);

  // Handle Tab / Navigation Select with smooth positioning to top of explorer
  const handleTabSelect = (tab: ExplorerTab, anchorId?: string) => {
    setActiveTab(tab);
    setSearchQuery('');
    resetAllFilters();

    if (tab === 'all' && anchorId) {
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (explorerRef.current) {
      explorerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Unconditional data fetching ensures full items (with embedded tags) are loaded immediately on page load
  const { data: fetchedHotels, isLoading: hotelsLoading } = useHotels(countryId);
  const { data: packages, isLoading: packagesLoading } = usePackages({ country_id: countryId });
  const { data: fetchedActivities, isLoading: activitiesLoading } = useActivities(countryId);
  const { data: fetchedAttractions, isLoading: attractionsLoading } = useAttractions({ country: countryName });

  const hotels = fetchedHotels || initialHotels || [];
  const activities = fetchedActivities || initialActivities || [];
  const attractions = fetchedAttractions || initialAttractions || [];

  // Filter States
  const [hotelStars, setHotelStars] = useState<number[]>([]);
  const [hotelPriceCategories, setHotelPriceCategories] = useState<string[]>([]);
  const [packageDurations, setPackageDurations] = useState<string[]>([]);
  const [packageBudgets, setPackageBudgets] = useState<string[]>([]);
  const [packageTypes, setPackageTypes] = useState<string[]>([]);
  const [activityIntensities, setActivityIntensities] = useState<string[]>([]);
  const [activityDurations, setActivityDurations] = useState<string[]>([]);
  const [attractionTypes, setAttractionTypes] = useState<string[]>([]);

  // Reset Filters
  const resetAllFilters = () => {
    setSelectedTagIds([]);
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
      selectedTagIds.length > 0 ||
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
    searchQuery, selectedTagIds, hotelStars, hotelPriceCategories, packageDurations,
    packageBudgets, packageTypes, activityIntensities, activityDurations, attractionTypes
  ]);

  const isLoading = hotelsLoading || packagesLoading || activitiesLoading || attractionsLoading;

  // Tag matcher helper
  const matchesTags = (item: any) => {
    if (selectedTagIds.length === 0) return true;
    const itemTagIds = new Set<number>();
    if (Array.isArray(item.tags)) {
      item.tags.forEach((t: any) => {
        const id = typeof t === 'number' ? t : t?.id;
        if (id) itemTagIds.add(id);
      });
    }
    if (Array.isArray(item.tag_ids)) {
      item.tag_ids.forEach((id: any) => {
        if (typeof id === 'number') itemTagIds.add(id);
      });
    }
    return selectedTagIds.some(id => itemTagIds.has(id));
  };

  // Extract items for the active category (or all items if in overview) for immediate tag discovery
  const rawCategoryItems = useMemo(() => {
    const hList = hotels?.filter((h: any) => (h.country_id === undefined || h.country_id === countryId) && h.is_active) || [];
    const pList = packages?.filter((p: any) => p.is_active) || [];
    const actList = activities?.filter((a: any) => a.is_active) || [];
    const attrList = attractions?.filter((a: any) => a.is_active) || [];

    if (activeTab === 'hotels') return hList;
    if (activeTab === 'packages') return pList;
    if (activeTab === 'activities') return actList;
    if (activeTab === 'attractions') return attrList;

    return [...hList, ...pList, ...actList, ...attrList];
  }, [activeTab, hotels, packages, activities, attractions, countryId]);

  // Extract unique tag IDs and names attached to items in rawCategoryItems
  const availableTagIdentifiers = useMemo(() => {
    const tagIds = new Set<number>();
    const tagNames = new Set<string>();

    rawCategoryItems.forEach((item: any) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((t: any) => {
          if (typeof t === 'number') {
            tagIds.add(t);
          } else if (typeof t === 'string') {
            tagNames.add(t.toLowerCase());
          } else if (t && typeof t === 'object') {
            if (t.id) tagIds.add(t.id);
            if (t.name) tagNames.add(t.name.toLowerCase());
          }
        });
      }
      if (Array.isArray(item.tag_ids)) {
        item.tag_ids.forEach((id: any) => {
          if (typeof id === 'number') tagIds.add(id);
        });
      }
    });
    return { tagIds, tagNames };
  }, [rawCategoryItems]);

  // Only show tags that are actually attached to items in the active category
  const visibleTags = useMemo(() => {
    return contentTags.filter(tag => 
      availableTagIdentifiers.tagIds.has(tag.id) || 
      availableTagIdentifiers.tagNames.has(tag.name.toLowerCase())
    );
  }, [contentTags, availableTagIdentifiers]);

  // ----------------------------------------------------
  // FILTERING LOGIC
  // ----------------------------------------------------

  // 1. Hotels
  const filteredHotels = useMemo(() => {
    const list = hotels?.filter((h: any) => (h.country_id === undefined || h.country_id === countryId) && h.is_active) || [];
    return list.filter((hotel: any) => {
      if (!matchesTags(hotel)) return false;
      if (searchQuery && !hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !(hotel.summary || '').toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (hotelStars.length > 0 && (!hotel.stars || !hotelStars.includes(hotel.stars))) return false;
      if (hotelPriceCategories.length > 0 && (!hotel.price_category || !hotelPriceCategories.includes(hotel.price_category.toLowerCase()))) return false;
      return true;
    });
  }, [hotels, countryId, searchQuery, hotelStars, hotelPriceCategories, selectedTagIds]);

  // 2. Packages
  const filteredPackages = useMemo(() => {
    const list = packages?.filter((p: any) => p.is_active) || [];
    return list.filter((pkg: any) => {
      if (!matchesTags(pkg)) return false;
      if (searchQuery && !pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !(pkg.summary || '').toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (packageDurations.length > 0) {
        let match = false;
        if (packageDurations.includes('2-3') && pkg.duration_days >= 2 && pkg.duration_days <= 3) match = true;
        if (packageDurations.includes('4-6') && pkg.duration_days >= 4 && pkg.duration_days <= 6) match = true;
        if (packageDurations.includes('7-10') && pkg.duration_days >= 7 && pkg.duration_days <= 10) match = true;
        if (packageDurations.includes('10+') && pkg.duration_days > 10) match = true;
        if (!match) return false;
      }
      if (packageBudgets.length > 0) {
        let match = false;
        const price = pkg.price || 0;
        if (packageBudgets.includes('under-1000') && price < 1000) match = true;
        if (packageBudgets.includes('1000-3000') && price >= 1000 && price <= 3000) match = true;
        if (packageBudgets.includes('3000-5000') && price >= 3000 && price <= 5000) match = true;
        if (packageBudgets.includes('5000+') && price > 5000) match = true;
        if (!match) return false;
      }
      if (packageTypes.length > 0) {
        const types = pkg.holiday_types?.map((t: any) => t.slug.toLowerCase()) || [];
        const hasMatch = packageTypes.some(t => types.includes(t.toLowerCase()));
        if (!hasMatch) return false;
      }
      return true;
    });
  }, [packages, searchQuery, packageDurations, packageBudgets, packageTypes, selectedTagIds]);

  // 3. Activities
  const filteredActivities = useMemo(() => {
    const list = activities?.filter((a: any) => a.is_active) || [];
    return list.filter((activity: any) => {
      if (!matchesTags(activity)) return false;
      if (searchQuery && !activity.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !(activity.summary || '').toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (activityIntensities.length > 0) {
        const desc = (activity.description || '').toLowerCase();
        let intensity = 'moderate';
        if (desc.includes('extreme') || desc.includes('rafting') || desc.includes('trekking') || desc.includes('climbing')) intensity = 'extreme';
        else if (desc.includes('relax') || desc.includes('leisure') || desc.includes('stroll') || desc.includes('sightseeing')) intensity = 'relaxed';
        if (!activityIntensities.includes(intensity)) return false;
      }
      if (activityDurations.length > 0) {
        const desc = (activity.description || '').toLowerCase();
        let duration = 'half-day';
        if (desc.includes('multi-day') || desc.includes('days safari') || desc.includes('camping')) duration = 'multi-day';
        else if (desc.includes('full day') || desc.includes('8 hours') || desc.includes('all day')) duration = 'full-day';
        if (!activityDurations.includes(duration)) return false;
      }
      return true;
    });
  }, [activities, searchQuery, activityIntensities, activityDurations, selectedTagIds]);

  // 4. Attractions
  const filteredAttractions = useMemo(() => {
    const list = attractions?.filter((a: any) => a.is_active) || [];
    return list.filter((attraction: any) => {
      if (!matchesTags(attraction)) return false;
      if (searchQuery && !attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !(attraction.summary || '').toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
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
  }, [attractions, searchQuery, attractionTypes, selectedTagIds]);

  // In-place "Load More" logic for Category Listing mode
  const [visibleCount, setVisibleCount] = useState(9);

  const currentCategoryList = useMemo(() => {
    if (activeTab === 'hotels') return filteredHotels;
    if (activeTab === 'packages') return filteredPackages;
    if (activeTab === 'activities') return filteredActivities;
    if (activeTab === 'attractions') return filteredAttractions;
    return [];
  }, [activeTab, filteredHotels, filteredPackages, filteredActivities, filteredAttractions]);

  const visibleItems = useMemo(() => {
    return currentCategoryList.slice(0, visibleCount);
  }, [currentCategoryList, visibleCount]);

  const hasMoreItems = visibleCount < currentCategoryList.length;

  const handleLoadMore = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.blur();
    const currentScrollY = window.scrollY;
    setVisibleCount(prev => prev + 9);
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY, behavior: 'instant' as ScrollBehavior });
    });
  };

  useEffect(() => {
    setVisibleCount(9);
  }, [activeTab, searchQuery, selectedTagIds, hotelStars, hotelPriceCategories, packageDurations, packageBudgets, packageTypes, activityIntensities, activityDurations, attractionTypes]);

  const toggleFilter = (value: any, list: any[], setList: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (list.includes(value)) {
      setList(list.filter(v => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const isOverview = activeTab === 'all';

  return (
    <div ref={explorerRef} className="scroll-mt-24">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm mb-8">
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

        {!isOverview && (
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
        )}
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT SIDEBAR: Simple Navigation Links (Overview) OR Filter Panel (Listing) */}
        <aside className={`lg:col-span-1 space-y-6 ${!isOverview && mobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
          
          {/* Primary Navigation Menu */}
          <div className="bg-white rounded-2xl border border-gray-200/60 p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 px-2">Category Navigation</h3>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleTabSelect('all')}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'all'
                    ? 'bg-primary/10 text-primary border-l-4 border-primary pl-3'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary border-l-4 border-transparent'
                }`}
              >
                <span className="text-lg">✈️</span>
                <span>All Categories</span>
              </button>

              {CATEGORY_ITEMS.map((cat) => {
                const isActive = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (isOverview) {
                        handleTabSelect('all', cat.anchor);
                      } else {
                        handleTabSelect(cat.id as ExplorerTab);
                      }
                    }}
                    className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl text-left font-semibold text-sm transition-all duration-300 ${
                      isActive
                        ? 'bg-primary/10 text-primary border-l-4 border-primary pl-3'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </div>
                    {isOverview && <ChevronRight className="w-4 h-4 text-gray-300" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC FILTER PANEL (Only shown on Category Listing pages) */}
          {!isOverview && (
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

              {/* DYNAMIC CONTENT TAGS FILTER (ONLY TAGS WITH ATTACHED ITEMS) */}
              {visibleTags.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700">
                    <TagIcon className="w-3.5 h-3.5 text-primary" />
                    <span>Tags & Features</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {visibleTags.map((tag) => {
                      const isSelected = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggleFilter(tag.id, selectedTagIds, setSelectedTagIds)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                            isSelected
                              ? 'bg-primary text-white border-primary shadow-xs'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CATEGORY SPECIFIC SUB-FILTERS */}
              {activeTab === 'hotels' && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
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
                </div>
              )}

              {activeTab === 'packages' && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
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
                </div>
              )}

              {activeTab === 'activities' && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">Intensity</h4>
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
                </div>
              )}
            </div>
          )}
        </aside>

        {/* RIGHT AREA: CATEGORY-BASED OVERVIEW (NO PAGINATION) OR CATEGORY LISTING */}
        <div className="lg:col-span-3 space-y-12">
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
          ) : isOverview ? (
            /* ==================================================== */
            /* CATEGORY-BASED LAYOUT (OVERVIEW MODE - NO PAGINATION) */
            /* ==================================================== */
            <div className="space-y-16">
              {/* SECTION 1: WHERE TO STAY */}
              <section id="section-hotels" className="scroll-mt-24">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200/80">
                  <div>
                    <h2 className="text-2xl font-bold font-playfair text-gray-900 flex items-center gap-2">
                      <span>🏨</span> Where to Stay in {countryName}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">Top rated lodges, luxury camps, and boutique hotels</p>
                  </div>
                  {filteredHotels.length > 0 && (
                    <Link
                      to={`/destinations/${destinationSlug}/hotels`}
                      onClick={() => handleTabSelect('hotels')}
                      className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
                    >
                      <span>Read More ({filteredHotels.length})</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                {filteredHotels.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredHotels.slice(0, 9).map((hotel: any) => (
                        <HotelCard
                          key={hotel.id}
                          hotel={{ ...hotel, country: hotel.country || { slug: destinationSlug } }}
                        />
                      ))}
                    </div>
                    {filteredHotels.length > 9 && (
                      <div className="mt-8 text-center">
                        <Link
                          to={`/destinations/${destinationSlug}/hotels`}
                          onClick={() => handleTabSelect('hotels')}
                          className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-xs hover:shadow-md active:scale-95 text-sm"
                        >
                          <span>Read More Hotels in {countryName}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm italic py-4">No hotels currently listed for {countryName}.</p>
                )}
              </section>

              {/* SECTION 2: FEATURED PACKAGES */}
              <section id="section-packages" className="scroll-mt-24">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200/80">
                  <div>
                    <h2 className="text-2xl font-bold font-playfair text-gray-900 flex items-center gap-2">
                      <span>🧳</span> Featured Packages
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">Handpicked itineraries, safaris, and custom guided tours</p>
                  </div>
                  {filteredPackages.length > 0 && (
                    <Link
                      to={`/destinations/${destinationSlug}/packages`}
                      onClick={() => handleTabSelect('packages')}
                      className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
                    >
                      <span>Read More ({filteredPackages.length})</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                {filteredPackages.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPackages.slice(0, 9).map((pkg: any) => (
                        <PackageCard key={pkg.id} package={pkg} />
                      ))}
                    </div>
                    {filteredPackages.length > 9 && (
                      <div className="mt-8 text-center">
                        <Link
                          to={`/destinations/${destinationSlug}/packages`}
                          onClick={() => handleTabSelect('packages')}
                          className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-xs hover:shadow-md active:scale-95 text-sm"
                        >
                          <span>Read More Packages in {countryName}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm italic py-4">No travel packages currently listed for {countryName}.</p>
                )}
              </section>

              {/* SECTION 3: EXPERIENCES (ACTIVITIES) */}
              <section id="section-activities" className="scroll-mt-24">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200/80">
                  <div>
                    <h2 className="text-2xl font-bold font-playfair text-gray-900 flex items-center gap-2">
                      <span>🎯</span> Experiences & Activities
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">Trekking permits, cultural walks, rafting, and adventures</p>
                  </div>
                  {filteredActivities.length > 0 && (
                    <Link
                      to={`/destinations/${destinationSlug}/activities`}
                      onClick={() => handleTabSelect('activities')}
                      className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
                    >
                      <span>Read More ({filteredActivities.length})</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                {filteredActivities.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredActivities.slice(0, 9).map((act: any) => (
                        <ActivityCard key={act.id} activity={act} />
                      ))}
                    </div>
                    {filteredActivities.length > 9 && (
                      <div className="mt-8 text-center">
                        <Link
                          to={`/destinations/${destinationSlug}/activities`}
                          onClick={() => handleTabSelect('activities')}
                          className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-xs hover:shadow-md active:scale-95 text-sm"
                        >
                          <span>Read More Experiences in {countryName}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm italic py-4">No activity experiences listed for {countryName}.</p>
                )}
              </section>

              {/* SECTION 4: TOP THINGS TO DO (ATTRACTIONS) */}
              <section id="section-attractions" className="scroll-mt-24">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200/80">
                  <div>
                    <h2 className="text-2xl font-bold font-playfair text-gray-900 flex items-center gap-2">
                      <span>📍</span> Top Things to Do & Attractions
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">National parks, scenic landmarks, and heritage sites</p>
                  </div>
                  {filteredAttractions.length > 0 && (
                    <Link
                      to={`/destinations/${destinationSlug}/attractions`}
                      onClick={() => handleTabSelect('attractions')}
                      className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
                    >
                      <span>Read More ({filteredAttractions.length})</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                {filteredAttractions.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredAttractions.slice(0, 9).map((attr: any) => (
                        <AttractionCard key={attr.id} attraction={attr as any} />
                      ))}
                    </div>
                    {filteredAttractions.length > 9 && (
                      <div className="mt-8 text-center">
                        <Link
                          to={`/destinations/${destinationSlug}/attractions`}
                          onClick={() => handleTabSelect('attractions')}
                          className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-xs hover:shadow-md active:scale-95 text-sm"
                        >
                          <span>Read More Attractions in {countryName}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm italic py-4">No attractions currently listed for {countryName}.</p>
                )}
              </section>
            </div>
          ) : (
            /* ==================================================== */
            /* DEDICATED CATEGORY LISTING MODE (IN-PLACE LOAD MORE) */
            /* ==================================================== */
            <>
              <div className="flex items-center justify-between text-sm text-gray-500 font-semibold px-1">
                <span>
                  Showing {visibleItems.length} of {currentCategoryList.length} results
                </span>
                {hasActiveFilters && (
                  <button onClick={resetAllFilters} className="text-xs font-bold text-primary hover:underline">
                    Clear active filters
                  </button>
                )}
              </div>

              {visibleItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTab === 'hotels' &&
                    (visibleItems as typeof filteredHotels).map((hotel) => (
                      <HotelCard key={hotel.id} hotel={{ ...hotel, country: hotel.country || { slug: destinationSlug } }} />
                    ))}

                  {activeTab === 'packages' &&
                    (visibleItems as typeof filteredPackages).map((pkg) => (
                      <PackageCard key={pkg.id} package={pkg} />
                    ))}

                  {activeTab === 'activities' &&
                    (visibleItems as typeof filteredActivities).map((act) => (
                      <ActivityCard key={act.id} activity={act} />
                    ))}

                  {activeTab === 'attractions' &&
                    (visibleItems as typeof filteredAttractions).map((attr) => (
                      <AttractionCard key={attr.id} attraction={attr as any} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-gray-200/60 rounded-2xl p-8 shadow-sm">
                  <div className="text-5xl mb-4 text-gray-300">🔍</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No matching items found</h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                    Try clearing or adjusting your search filters.
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

              {/* In-Place Load More Button (Never scrolls or jumps page position) */}
              {hasMoreItems && (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:bg-primary-dark active:scale-95 transition-all text-sm cursor-pointer"
                  >
                    <span>Load More ({currentCategoryList.length - visibleCount} remaining)</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DestinationExplorer;
