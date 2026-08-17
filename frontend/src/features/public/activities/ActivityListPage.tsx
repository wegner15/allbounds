import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SeoHead from '../../../components/seo/SeoHead';
import { useActivities } from '../../../lib/hooks/useActivities';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../utils/imageUtils';
import { MapPin, Search, Compass, Sparkles } from 'lucide-react';
import type { ActivityResponse } from '../../../lib/types/api';

const ActivityListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(() => searchParams.get('country') || '');

  useEffect(() => {
    const countryParam = searchParams.get('country');
    if (countryParam !== null) {
      setSelectedCountry(countryParam);
    }
  }, [searchParams]);

  const { data: activities, isLoading, error } = useActivities();

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    return activities.filter((act) => {
      if (act.is_active === false) return false;

      const matchesSearch =
        act.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (act.summary && act.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (act.description && act.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCountry =
        !selectedCountry ||
        act.countries?.some((c) => c.name.toLowerCase() === selectedCountry.toLowerCase());

      return matchesSearch && matchesCountry;
    });
  }, [activities, searchTerm, selectedCountry]);

  // Extract unique countries
  const countries = useMemo(() => {
    if (!activities) return [];
    const countryNames = new Set<string>();
    activities.forEach((act) => {
      act.countries?.forEach((c) => {
        if (c.name) countryNames.add(c.name);
      });
    });
    return Array.from(countryNames).sort();
  }, [activities]);

  if (isLoading) {
    return (
      <>
        <SeoHead
          title="Activities & Excursions"
          description="Discover thrilling adventures, day tours, and guided excursions across world-class travel destinations."
          canonicalPath="/activities"
        />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-gray-200 rounded-lg w-1/3 mx-auto mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-12" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden h-80">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SeoHead
          title="Activities & Excursions"
          description="Discover thrilling adventures, day tours, and guided excursions across world-class travel destinations."
          canonicalPath="/activities"
        />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-sm max-w-md">
            <h2 className="text-2xl font-bold font-playfair text-charcoal mb-2">Unable to load activities</h2>
            <p className="text-sm text-gray-600 mb-6">Please check your internet connection or try again later.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl shadow-sm hover:bg-primary-dark transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title="Activities & Excursions"
        description="Discover thrilling adventures, day tours, water sports, wildlife safaris, and guided excursions with Allbound Vacations."
        canonicalPath="/activities"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Top Hero Introductory Section */}
        <div className="bg-gradient-to-b from-white via-gray-50/50 to-gray-50 border-b border-gray-200/80 py-12 md:py-16">
          <div className="fluid-container">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-primary uppercase mb-3">
                <span className="w-6 h-[2px] bg-primary/60 rounded-full" />
                EXCURSIONS & EXPERIENCES
                <span className="w-6 h-[2px] bg-primary/60 rounded-full" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-playfair text-charcoal mb-4 tracking-tight leading-tight">
                Unforgettable Excursions & Guided Activities
              </h1>
              <p className="text-base sm:text-lg text-gray-600 font-sans leading-relaxed mb-3">
                Immerse yourself in authentic local experiences, thrilling outdoor adventures, wildlife game drives, and cultural tours handpicked by travel experts.
              </p>
              <p className="text-xs sm:text-sm text-gray-500 font-sans leading-relaxed">
                Whether you seek heart-pounding water sports, peaceful sunrise hot air balloon rides over national parks, or guided culinary walks, find and customize your dream activities below.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-xs">
          <div className="fluid-container py-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all"
                />
              </div>

              {/* Country Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap hidden sm:inline">
                  Destination:
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full sm:w-56 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all font-sans"
                >
                  <option value="">All Destinations</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="fluid-container py-12">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200/60 shadow-xs p-8 max-w-lg mx-auto">
              <Compass className="w-12 h-12 text-primary/60 mx-auto mb-4 animate-bounce" />
              <h3 className="text-xl font-bold font-playfair text-charcoal mb-2">No Activities Found</h3>
              <p className="text-sm text-gray-600 mb-6">
                We couldn't find any activities matching your search parameters. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCountry('');
                }}
                className="px-5 py-2 bg-primary/10 text-primary-dark font-semibold text-xs rounded-xl hover:bg-primary/20 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 4xl:grid-cols-5 gap-8">
              {filteredActivities.map((act: ActivityResponse) => {
                const primaryCountry = act.countries?.[0];
                const countrySlug = primaryCountry?.slug || 'explore';

                return (
                  <Link
                    key={act.id}
                    to={`/activities/${countrySlug}/${act.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <img
                        src={
                          act.image_id
                            ? getImageUrlWithFallback(act.image_id, IMAGE_VARIANTS.MEDIUM)
                            : act.image_url || 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={act.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {primaryCountry && (
                        <span className="absolute top-3.5 left-3.5 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-semibold px-3 py-1 rounded-full flex items-center shadow-xs">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-primary" />
                          {primaryCountry.name}
                        </span>
                      )}
                      {act.is_featured && (
                        <span className="absolute top-3.5 right-3.5 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center shadow-xs tracking-wider uppercase">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="text-xl font-bold font-playfair text-charcoal group-hover:text-primary transition-colors line-clamp-1 mb-2">
                          {act.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4 font-sans">
                          {act.summary || act.description?.replace(/<[^>]*>/g, '').slice(0, 140) || 'Exciting activity and tour experience.'}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-primary">
                        <span className="flex items-center">
                          <Compass className="w-4 h-4 mr-1.5" />
                          Explore Experience
                        </span>
                        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ActivityListPage;
