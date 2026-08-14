import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Tag as TagIcon, ChevronDown, ChevronRight, SlidersHorizontal, RotateCcw, Filter } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
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
  const explorerRef = useRef<HTMLDivElement>(null);

  // Content Tags hook for dynamic filtering
  const { data: contentTags = [] } = useContentTags({ include_inactive: false });

  // Per-section Tag Filter States
  const [selectedHotelTagIds, setSelectedHotelTagIds] = useState<number[]>([]);
  const [selectedPackageTagIds, setSelectedPackageTagIds] = useState<number[]>([]);
  const [selectedActivityTagIds, setSelectedActivityTagIds] = useState<number[]>([]);
  const [selectedAttractionTagIds, setSelectedAttractionTagIds] = useState<number[]>([]);

  // Per-section in-place visible count states (default 9 items each)
  const [hotelVisibleCount, setHotelVisibleCount] = useState(9);
  const [packageVisibleCount, setPackageVisibleCount] = useState(9);
  const [activityVisibleCount, setActivityVisibleCount] = useState(9);
  const [attractionVisibleCount, setAttractionVisibleCount] = useState(9);

  // Additional attribute filter states per section
  const [hotelStars, setHotelStars] = useState<number[]>([]);
  const [packageDurations, setPackageDurations] = useState<string[]>([]);
  const [activityIntensities, setActivityIntensities] = useState<string[]>([]);
  const [attractionTypes, setAttractionTypes] = useState<string[]>([]);

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync activeTab state with activeTabId prop
  useEffect(() => {
    if (activeTabId) {
      setActiveTab(activeTabId as ExplorerTab);
    }
  }, [activeTabId]);

  // Reset visible counts when filters or search change
  useEffect(() => {
    setHotelVisibleCount(9);
    setPackageVisibleCount(9);
    setActivityVisibleCount(9);
    setAttractionVisibleCount(9);
  }, [searchQuery, selectedHotelTagIds, selectedPackageTagIds, selectedActivityTagIds, selectedAttractionTagIds, hotelStars, packageDurations, activityIntensities, attractionTypes]);

  // Unconditional data fetching ensures full items (with embedded tags) are loaded immediately on page load
  const { data: fetchedHotels, isLoading: hotelsLoading } = useHotels(countryId);
  const { data: packages, isLoading: packagesLoading } = usePackages({ country_id: countryId });
  const { data: fetchedActivities, isLoading: activitiesLoading } = useActivities(countryId);
  const { data: fetchedAttractions, isLoading: attractionsLoading } = useAttractions({ country: countryName });

  const hotels = fetchedHotels || initialHotels || [];
  const activities = fetchedActivities || initialActivities || [];
  const attractions = fetchedAttractions || initialAttractions || [];

  const isLoading = hotelsLoading || packagesLoading || activitiesLoading || attractionsLoading;

  // Helper to extract tags for a specific set of raw items
  const getTagsForItems = (items: any[]) => {
    const tagIds = new Set<number>();
    const tagNames = new Set<string>();

    items.forEach((item: any) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((t: any) => {
          if (typeof t === 'number') tagIds.add(t);
          else if (typeof t === 'string') tagNames.add(t.toLowerCase());
          else if (t && typeof t === 'object') {
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

    return contentTags.filter(
      (tag) => tagIds.has(tag.id) || tagNames.has(tag.name.toLowerCase())
    );
  };

  // Raw lists per category
  const rawHotels = useMemo(() => hotels?.filter((h: any) => (h.country_id === undefined || h.country_id === countryId) && h.is_active) || [], [hotels, countryId]);
  const rawPackages = useMemo(() => packages?.filter((p: any) => p.is_active) || [], [packages]);
  const rawActivities = useMemo(() => activities?.filter((a: any) => a.is_active) || [], [activities]);
  const rawAttractions = useMemo(() => attractions?.filter((a: any) => a.is_active) || [], [attractions]);

  // Section-specific tags (only tags with attached items in that category)
  const hotelTags = useMemo(() => getTagsForItems(rawHotels), [contentTags, rawHotels]);
  const packageTags = useMemo(() => getTagsForItems(rawPackages), [contentTags, rawPackages]);
  const activityTags = useMemo(() => getTagsForItems(rawActivities), [contentTags, rawActivities]);
  const attractionTags = useMemo(() => getTagsForItems(rawAttractions), [contentTags, rawAttractions]);

  // Tag matcher helper for item array & selected tag ids
  const matchesSectionTags = (item: any, selectedIds: number[]) => {
    if (selectedIds.length === 0) return true;
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
    return selectedIds.some((id) => itemTagIds.has(id));
  };

  const toggleFilter = (value: any, list: any[], setList: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (list.includes(value)) {
      setList(list.filter(v => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  // ----------------------------------------------------
  // FILTERING LOGIC PER SECTION
  // ----------------------------------------------------

  // 1. Hotels
  const filteredHotels = useMemo(() => {
    return rawHotels.filter((hotel: any) => {
      if (!matchesSectionTags(hotel, selectedHotelTagIds)) return false;
      if (searchQuery && !hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !(hotel.summary || '').toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (hotelStars.length > 0 && (!hotel.stars || !hotelStars.includes(hotel.stars))) return false;
      return true;
    });
  }, [rawHotels, searchQuery, selectedHotelTagIds, hotelStars]);

  // 2. Packages
  const filteredPackages = useMemo(() => {
    return rawPackages.filter((pkg: any) => {
      if (!matchesSectionTags(pkg, selectedPackageTagIds)) return false;
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
      return true;
    });
  }, [rawPackages, searchQuery, selectedPackageTagIds, packageDurations]);

  // 3. Activities
  const filteredActivities = useMemo(() => {
    return rawActivities.filter((activity: any) => {
      if (!matchesSectionTags(activity, selectedActivityTagIds)) return false;
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
      return true;
    });
  }, [rawActivities, searchQuery, selectedActivityTagIds, activityIntensities]);

  // 4. Attractions
  const filteredAttractions = useMemo(() => {
    return rawAttractions.filter((attraction: any) => {
      if (!matchesSectionTags(attraction, selectedAttractionTagIds)) return false;
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
  }, [rawAttractions, searchQuery, selectedAttractionTagIds, attractionTypes]);

  // In-place "Load More" Handlers per section (Zero scroll movement, no URL link changes)
  const handleLoadMoreHotels = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.blur();
    const currentScrollY = window.scrollY;
    setHotelVisibleCount(prev => prev + 9);
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY, behavior: 'instant' as ScrollBehavior });
    });
  };

  const handleLoadMorePackages = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.blur();
    const currentScrollY = window.scrollY;
    setPackageVisibleCount(prev => prev + 9);
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY, behavior: 'instant' as ScrollBehavior });
    });
  };

  const handleLoadMoreActivities = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.blur();
    const currentScrollY = window.scrollY;
    setActivityVisibleCount(prev => prev + 9);
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY, behavior: 'instant' as ScrollBehavior });
    });
  };

  const handleLoadMoreAttractions = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.blur();
    const currentScrollY = window.scrollY;
    setAttractionVisibleCount(prev => prev + 9);
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY, behavior: 'instant' as ScrollBehavior });
    });
  };

  const isOverview = activeTab === 'all';

  const resetAllFilters = () => {
    setSelectedHotelTagIds([]);
    setSelectedPackageTagIds([]);
    setSelectedActivityTagIds([]);
    setSelectedAttractionTagIds([]);
    setHotelStars([]);
    setPackageDurations([]);
    setActivityIntensities([]);
    setAttractionTypes([]);
    setSearchQuery('');
  };

  // Dedicated Category Listing mode items
  const currentCategoryList = useMemo(() => {
    if (activeTab === 'hotels') return filteredHotels;
    if (activeTab === 'packages') return filteredPackages;
    if (activeTab === 'activities') return filteredActivities;
    if (activeTab === 'attractions') return filteredAttractions;
    return [];
  }, [activeTab, filteredHotels, filteredPackages, filteredActivities, filteredAttractions]);

  const [categoryVisibleCount, setCategoryVisibleCount] = useState(9);
  const visibleCategoryItems = useMemo(() => {
    return currentCategoryList.slice(0, categoryVisibleCount);
  }, [currentCategoryList, categoryVisibleCount]);

  const handleLoadMoreCategory = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.blur();
    const currentScrollY = window.scrollY;
    setCategoryVisibleCount(prev => prev + 9);
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY, behavior: 'instant' as ScrollBehavior });
    });
  };

  // Tag helpers for active dedicated category
  const currentCategoryTags = useMemo(() => {
    if (activeTab === 'hotels') return hotelTags;
    if (activeTab === 'packages') return packageTags;
    if (activeTab === 'activities') return activityTags;
    if (activeTab === 'attractions') return attractionTags;
    return [];
  }, [activeTab, hotelTags, packageTags, activityTags, attractionTags]);

  const selectedTagIdsForCurrentCategory = useMemo(() => {
    if (activeTab === 'hotels') return selectedHotelTagIds;
    if (activeTab === 'packages') return selectedPackageTagIds;
    if (activeTab === 'activities') return selectedActivityTagIds;
    if (activeTab === 'attractions') return selectedAttractionTagIds;
    return [];
  }, [activeTab, selectedHotelTagIds, selectedPackageTagIds, selectedActivityTagIds, selectedAttractionTagIds]);

  const toggleTagForCurrentCategory = (tagId: number) => {
    if (activeTab === 'hotels') toggleFilter(tagId, selectedHotelTagIds, setSelectedHotelTagIds);
    else if (activeTab === 'packages') toggleFilter(tagId, selectedPackageTagIds, setSelectedPackageTagIds);
    else if (activeTab === 'activities') toggleFilter(tagId, selectedActivityTagIds, setSelectedActivityTagIds);
    else if (activeTab === 'attractions') toggleFilter(tagId, selectedAttractionTagIds, setSelectedAttractionTagIds);
  };

  const hasActiveFilters = useMemo(() => {
    return selectedHotelTagIds.length > 0 ||
      selectedPackageTagIds.length > 0 ||
      selectedActivityTagIds.length > 0 ||
      selectedAttractionTagIds.length > 0 ||
      hotelStars.length > 0 ||
      packageDurations.length > 0 ||
      activityIntensities.length > 0 ||
      attractionTypes.length > 0 ||
      searchQuery !== '';
  }, [selectedHotelTagIds, selectedPackageTagIds, selectedActivityTagIds, selectedAttractionTagIds, hotelStars, packageDurations, activityIntensities, attractionTypes, searchQuery]);

  useEffect(() => {
    setCategoryVisibleCount(9);
  }, [activeTab]);

  return (
    <div ref={explorerRef} className="scroll-mt-24 space-y-8">
      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search attractions, activities, packages, or hotels in ${countryName}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700 bg-gray-50/50 hover:bg-gray-50 transition-colors text-sm md:text-base"
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
      </div>

      {/* MAIN CONTENT AREA (ORDER: ATTRACTIONS -> ACTIVITIES -> PACKAGES -> ACCOMMODATION) */}
      <div className="w-full space-y-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
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
          /* CATEGORY-BASED OVERVIEW (IN-PLACE SECTION LOAD MORE) */
          /* ==================================================== */
          <div className="space-y-16">
            
            {/* SECTION 1: TOP THINGS TO DO & ATTRACTIONS */}
            <section id="section-attractions" className="scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-2 border-b border-gray-200/80 gap-2">
                <div>
                  <h2 className="text-2xl font-bold font-playfair text-gray-900 flex items-center gap-2">
                    <span>📍</span> Attractions in {countryName}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">National parks, scenic landmarks, and heritage sites</p>
                </div>
                {filteredAttractions.length > attractionVisibleCount && (
                  <Link
                    to={`/destinations/${destinationSlug}/attractions`}
                    className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                  >
                    <span>Load More ({filteredAttractions.length - attractionVisibleCount} remaining)</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* ATTRACTIONS RELEVANT SECTION FILTERS */}
              {attractionTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6 bg-white p-3 rounded-xl border border-gray-200/60 shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1">
                    <TagIcon className="w-3.5 h-3.5 text-primary" /> Tags:
                  </span>
                  <button
                    onClick={() => setSelectedAttractionTagIds([])}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      selectedAttractionTagIds.length === 0
                        ? 'bg-primary text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All ({rawAttractions.length})
                  </button>
                  {attractionTags.map((tag) => {
                    const isSelected = selectedAttractionTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleFilter(tag.id, selectedAttractionTagIds, setSelectedAttractionTagIds)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white shadow-2xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredAttractions.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredAttractions.slice(0, attractionVisibleCount).map((attr: any) => (
                      <AttractionCard key={attr.id} attraction={attr as any} />
                    ))}
                  </div>
                  {filteredAttractions.length > attractionVisibleCount && (
                    <div className="mt-8 text-center">
                      <Link
                        to={`/destinations/${destinationSlug}/attractions`}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-2xs hover:shadow-md active:scale-95 text-sm cursor-pointer"
                      >
                        <span>Load More Attractions ({filteredAttractions.length - attractionVisibleCount} remaining)</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm italic py-4">No attractions matching selected filters in {countryName}.</p>
              )}
            </section>

            {/* SECTION 2: EXPERIENCES & ACTIVITIES */}
            <section id="section-activities" className="scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-2 border-b border-gray-200/80 gap-2">
                <div>
                  <h2 className="text-2xl font-bold font-playfair text-gray-900 flex items-center gap-2">
                    <span>🎯</span> Activities & Experiences in {countryName}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">Trekking permits, cultural walks, rafting, and adventures</p>
                </div>
                {filteredActivities.length > activityVisibleCount && (
                  <Link
                    to={`/destinations/${destinationSlug}/activities`}
                    className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                  >
                    <span>Load More ({filteredActivities.length - activityVisibleCount} remaining)</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* ACTIVITIES RELEVANT SECTION FILTERS */}
              {activityTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6 bg-white p-3 rounded-xl border border-gray-200/60 shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1">
                    <TagIcon className="w-3.5 h-3.5 text-primary" /> Tags:
                  </span>
                  <button
                    onClick={() => setSelectedActivityTagIds([])}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      selectedActivityTagIds.length === 0
                        ? 'bg-primary text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All ({rawActivities.length})
                  </button>
                  {activityTags.map((tag) => {
                    const isSelected = selectedActivityTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleFilter(tag.id, selectedActivityTagIds, setSelectedActivityTagIds)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white shadow-2xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredActivities.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredActivities.slice(0, activityVisibleCount).map((act: any) => (
                      <ActivityCard key={act.id} activity={act} />
                    ))}
                  </div>
                  {filteredActivities.length > activityVisibleCount && (
                    <div className="mt-8 text-center">
                      <Link
                        to={`/destinations/${destinationSlug}/activities`}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-2xs hover:shadow-md active:scale-95 text-sm cursor-pointer"
                      >
                        <span>Load More Activities ({filteredActivities.length - activityVisibleCount} remaining)</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm italic py-4">No activities matching selected filters in {countryName}.</p>
              )}
            </section>

            {/* SECTION 3: FEATURED PACKAGES */}
            <section id="section-packages" className="scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-2 border-b border-gray-200/80 gap-2">
                <div>
                  <h2 className="text-2xl font-bold font-playfair text-gray-900 flex items-center gap-2">
                    <span>🧳</span> Packages in {countryName}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">Handpicked itineraries, safaris, and custom guided tours</p>
                </div>
                {filteredPackages.length > packageVisibleCount && (
                  <Link
                    to={`/destinations/${destinationSlug}/packages`}
                    className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                  >
                    <span>Load More ({filteredPackages.length - packageVisibleCount} remaining)</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* PACKAGES RELEVANT SECTION FILTERS */}
              {packageTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6 bg-white p-3 rounded-xl border border-gray-200/60 shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1">
                    <TagIcon className="w-3.5 h-3.5 text-primary" /> Tags:
                  </span>
                  <button
                    onClick={() => setSelectedPackageTagIds([])}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      selectedPackageTagIds.length === 0
                        ? 'bg-primary text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All ({rawPackages.length})
                  </button>
                  {packageTags.map((tag) => {
                    const isSelected = selectedPackageTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleFilter(tag.id, selectedPackageTagIds, setSelectedPackageTagIds)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white shadow-2xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredPackages.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredPackages.slice(0, packageVisibleCount).map((pkg: any) => (
                      <PackageCard key={pkg.id} package={pkg} />
                    ))}
                  </div>
                  {filteredPackages.length > packageVisibleCount && (
                    <div className="mt-8 text-center">
                      <Link
                        to={`/destinations/${destinationSlug}/packages`}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-2xs hover:shadow-md active:scale-95 text-sm cursor-pointer"
                      >
                        <span>Load More Packages ({filteredPackages.length - packageVisibleCount} remaining)</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm italic py-4">No travel packages matching selected filters in {countryName}.</p>
              )}
            </section>

            {/* SECTION 4: ACCOMMODATION (HOTELS) */}
            <section id="section-hotels" className="scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-2 border-b border-gray-200/80 gap-2">
                <div>
                  <h2 className="text-2xl font-bold font-playfair text-gray-900 flex items-center gap-2">
                    <span>🏨</span> Accommodation in {countryName}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">Top rated lodges, luxury camps, and boutique hotels</p>
                </div>
                {filteredHotels.length > hotelVisibleCount && (
                  <Link
                    to={`/destinations/${destinationSlug}/hotels`}
                    className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                  >
                    <span>Load More ({filteredHotels.length - hotelVisibleCount} remaining)</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* HOTELS RELEVANT SECTION FILTERS */}
              {hotelTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6 bg-white p-3 rounded-xl border border-gray-200/60 shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1">
                    <TagIcon className="w-3.5 h-3.5 text-primary" /> Tags:
                  </span>
                  <button
                    onClick={() => setSelectedHotelTagIds([])}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      selectedHotelTagIds.length === 0
                        ? 'bg-primary text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All ({rawHotels.length})
                  </button>
                  {hotelTags.map((tag) => {
                    const isSelected = selectedHotelTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleFilter(tag.id, selectedHotelTagIds, setSelectedHotelTagIds)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white shadow-2xs'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredHotels.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredHotels.slice(0, hotelVisibleCount).map((hotel: any) => (
                      <HotelCard
                        key={hotel.id}
                        hotel={{ ...hotel, country: hotel.country || { slug: destinationSlug } }}
                      />
                    ))}
                  </div>
                  {filteredHotels.length > hotelVisibleCount && (
                    <div className="mt-8 text-center">
                      <Link
                        to={`/destinations/${destinationSlug}/hotels`}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-2xs hover:shadow-md active:scale-95 text-sm cursor-pointer"
                      >
                        <span>Load More Accommodation ({filteredHotels.length - hotelVisibleCount} remaining)</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm italic py-4">No accommodation options matching selected filters in {countryName}.</p>
              )}
            </section>
          </div>
        ) : (
          /* ==================================================== */
          /* DEDICATED CATEGORY LISTING MODE WITH SIDEBAR FILTERS */
          /* ==================================================== */
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* MOBILE FILTER TOGGLE BUTTON */}
            <div className="lg:hidden w-full flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
              <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" /> Filter Results
              </span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-2xs hover:bg-primary-dark transition-colors cursor-pointer"
              >
                {mobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* SIDEBAR FILTER PANEL */}
            <aside
              className={`w-full lg:w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-6 lg:sticky lg:top-28 ${
                mobileFilterOpen ? 'block' : 'hidden lg:block'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-150">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <span>Filter {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</span>
                </h3>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* SECTION 1: CATEGORY NAVIGATION TABS */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                  Category
                </h4>
                <div className="space-y-1">
                  {[
                    { id: 'all', label: 'Overview' },
                    { id: 'attractions', label: `Attractions (${rawAttractions.length})` },
                    { id: 'activities', label: `Activities (${rawActivities.length})` },
                    { id: 'packages', label: `Packages (${rawPackages.length})` },
                    { id: 'hotels', label: `Accommodation (${rawHotels.length})` },
                  ].map((cat) => {
                    const isSelected = activeTab === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (onTabChange) onTabChange(cat.id);
                          else {
                            if (cat.id === 'all') navigate(`/destinations/${destinationSlug}`);
                            else navigate(`/destinations/${destinationSlug}/${cat.id}`);
                          }
                        }}
                        className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg font-medium transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white font-bold shadow-2xs'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: TAG FILTERS FOR ACTIVE CATEGORY */}
              {currentCategoryTags.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span>Tags</span>
                    {selectedTagIdsForCurrentCategory.length > 0 && (
                      <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        {selectedTagIdsForCurrentCategory.length} active
                      </span>
                    )}
                  </h4>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {currentCategoryTags.map((tag) => {
                      const isSelected = selectedTagIdsForCurrentCategory.includes(tag.id);
                      return (
                        <label
                          key={tag.id}
                          className={`flex items-center justify-between text-xs px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                              : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleTagForCurrentCategory(tag.id)}
                              className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                            />
                            <span>{tag.name}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 3: CATEGORY SPECIFIC ATTRIBUTE FILTERS */}
              {/* Packages Duration Filter */}
              {activeTab === 'packages' && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                    Trip Duration
                  </h4>
                  <div className="space-y-1.5">
                    {[
                      { id: '2-3', label: '2 - 3 Days' },
                      { id: '4-6', label: '4 - 6 Days' },
                      { id: '7-10', label: '7 - 10 Days' },
                      { id: '10+', label: '10+ Days' },
                    ].map((dur) => {
                      const isSelected = packageDurations.includes(dur.id);
                      return (
                        <label
                          key={dur.id}
                          className={`flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                            isSelected ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFilter(dur.id, packageDurations, setPackageDurations)}
                            className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <span>{dur.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hotels Star Rating Filter */}
              {activeTab === 'hotels' && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                    Star Rating
                  </h4>
                  <div className="space-y-1.5">
                    {[5, 4, 3].map((star) => {
                      const isSelected = hotelStars.includes(star);
                      return (
                        <label
                          key={star}
                          className={`flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                            isSelected ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFilter(star, hotelStars, setHotelStars)}
                            className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <span>{star} Star Accommodation</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Activities Intensity Filter */}
              {activeTab === 'activities' && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                    Experience Type
                  </h4>
                  <div className="space-y-1.5">
                    {[
                      { id: 'relaxed', label: 'Relaxed & Sightseeing' },
                      { id: 'moderate', label: 'Moderate Adventure' },
                      { id: 'extreme', label: 'Extreme Thrills' },
                    ].map((type) => {
                      const isSelected = activityIntensities.includes(type.id);
                      return (
                        <label
                          key={type.id}
                          className={`flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                            isSelected ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFilter(type.id, activityIntensities, setActivityIntensities)}
                            className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          <span>{type.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>

            {/* MAIN RESULTS CONTENT AREA */}
            <main className="flex-1 min-w-0 space-y-6">
              {/* Header Stats & Active Filter Summary */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600 bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
                <div>
                  <span className="font-bold text-gray-900">
                    Showing {visibleCategoryItems.length} of {currentCategoryList.length} results
                  </span>
                  {searchQuery && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                      Search: &ldquo;{searchQuery}&rdquo;
                    </span>
                  )}
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear filters
                  </button>
                )}
              </div>

              {/* RESULTS GRID */}
              {visibleCategoryItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {activeTab === 'hotels' &&
                    (visibleCategoryItems as typeof filteredHotels).map((hotel) => (
                      <HotelCard key={hotel.id} hotel={{ ...hotel, country: hotel.country || { slug: destinationSlug } }} />
                    ))}

                  {activeTab === 'packages' &&
                    (visibleCategoryItems as typeof filteredPackages).map((pkg) => (
                      <PackageCard key={pkg.id} package={pkg} />
                    ))}

                  {activeTab === 'activities' &&
                    (visibleCategoryItems as typeof filteredActivities).map((act) => (
                      <ActivityCard key={act.id} activity={act} />
                    ))}

                  {activeTab === 'attractions' &&
                    (visibleCategoryItems as typeof filteredAttractions).map((attr) => (
                      <AttractionCard key={attr.id} attraction={attr as any} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-gray-200/60 rounded-2xl p-8 shadow-sm">
                  <div className="text-5xl mb-4 text-gray-300">🔍</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">No matching items found</h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                    Try clearing or adjusting your search or tag filters.
                  </p>
                  <button
                    onClick={resetAllFilters}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all text-sm cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* In-Place Load More Button */}
              {categoryVisibleCount < currentCategoryList.length && (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMoreCategory}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:bg-primary-dark active:scale-95 transition-all text-sm cursor-pointer"
                  >
                    <span>Load More ({currentCategoryList.length - categoryVisibleCount} remaining)</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </main>
          </div>

        )}
      </div>
    </div>
  );
};

export default DestinationExplorer;
