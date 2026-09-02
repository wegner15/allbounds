import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import SeoHead from '../../components/seo/SeoHead';
import { buildAbsoluteUrl, SITE_NAME, SITE_URL } from '../../lib/seo-config';

// Components
import Button from '../../components/ui/Button';
import PackageCarousel from '../../components/ui/PackageCarousel';

// API Hooks
import { usePackages } from '../../lib/hooks/usePackages';
import { useFeaturedPackages } from '../../lib/hooks/usePackages';
import { useCountries } from '../../lib/hooks/useCountries';
import { useHolidayTypes } from '../../lib/hooks/useHolidayTypes';
import { useActivePackagePriceCharts } from '../../lib/hooks/usePackagePriceCharts';


// Utils
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

// Filter options
const priceRanges = ['All', '$0-$1000', '$1000-$2000', '$2000-$3000', '$3000+'];
const durations = ['All', '1-3 days', '4-7 days', '8-14 days', '14+ days'];

// Component for package price display
const PackagePriceDisplay: React.FC<{ packageId: number; basePrice: number }> = ({ packageId, basePrice }) => {
  const { data: priceCharts } = useActivePackagePriceCharts(packageId);

  const lowestPrice = priceCharts && priceCharts.length > 0
    ? Math.min(...priceCharts.map(chart => chart.price))
    : basePrice;

  return (
    <div>
      <span className="font-bold text-lg">From ${lowestPrice.toFixed(2)}</span>
      <span className="text-gray-600 text-sm"> / person</span>
    </div>
  );
};

const PackagesPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedHolidayType, setSelectedHolidayType] = useState('All');
  const [selectedPackageType, setSelectedPackageType] = useState<'All' | 'Safari' | 'Holiday'>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');

  // Fetch data from API
  const { data: packagesData, isLoading: isLoadingPackages, error: packagesError } = usePackages();
  const { data: featuredPackagesData, isLoading: isLoadingFeaturedPackages } = useFeaturedPackages(10);
  const { data: countriesData, isLoading: isLoadingCountries } = useCountries();
  const { data: holidayTypesData, isLoading: isLoadingHolidayTypes } = useHolidayTypes();

  // State for hero packages (featured or latest)
  const [heroPackages, setHeroPackages] = useState([]);

  // URL Search Params
  const [searchParams] = useSearchParams();

  // Determine hero packages: featured first, then latest
  useEffect(() => {
    if (featuredPackagesData && featuredPackagesData.length > 0) {
      setHeroPackages(featuredPackagesData);
    } else if (packagesData && packagesData.length > 0) {
      // Fallback to latest packages ordered by creation date
      const latestPackages = [...packagesData]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
      setHeroPackages(latestPackages);
    }
  }, [featuredPackagesData, packagesData]);

  // Sync URL params with state
  useEffect(() => {
    // Package Type filter
    const packageTypeParam = searchParams.get('packageType');
    if (packageTypeParam) {
      if (packageTypeParam.toLowerCase() === 'safari') {
        setSelectedPackageType('Safari');
      } else if (packageTypeParam.toLowerCase() === 'holiday') {
        setSelectedPackageType('Holiday');
      } else {
        setSelectedPackageType('All');
      }
    }

    // Country filter
    const countryParam = searchParams.get('country');
    if (countryParam && countriesData) {
      const match = countriesData.find(c => c.name.toLowerCase() === countryParam.toLowerCase());
      if (match) {
        setSelectedCountry(match.name);
      } else if (countryParam.toLowerCase() === 'all') {
        setSelectedCountry('All');
      }
    }

    // Holiday Type filter
    const holidayTypeParam = searchParams.get('holidayType');
    if (holidayTypeParam && holidayTypesData) {
      // Check against holidayTypesData or holidayTypeOptions
      // Holiday param might be slug or name. Let's check name first, then slug.
      const match = holidayTypesData.find(ht =>
        ht.name.toLowerCase() === holidayTypeParam.toLowerCase() ||
        ht.slug === holidayTypeParam /* slug is usually lowercase */
      );
      if (match) {
        setSelectedHolidayType(match.name);
      } else if (holidayTypeParam.toLowerCase() === 'all') {
        setSelectedHolidayType('All');
      }
    }
  }, [searchParams, countriesData, holidayTypesData]);

  // Prepare filter options from API data
  const countryOptions = !isLoadingCountries && countriesData
    ? ['All', ...countriesData.map(country => country.name)]
    : ['All'];

  const holidayTypeOptions = !isLoadingHolidayTypes && holidayTypesData
    ? ['All', ...holidayTypesData.map(type => type.name)]
    : ['All'];

  // Pagination
  const packagesPerPage = 6;
  const packages = packagesData || [];

  // Apply filters
  const filteredPackages = packages.filter(pkg => {
    // Package Type filter
    if (selectedPackageType !== 'All') {
      const pkgType = (pkg.package_type || 'safari').toLowerCase();
      if (pkgType !== selectedPackageType.toLowerCase()) return false;
    }

    // Country filter
    if (selectedCountry !== 'All' && pkg.country?.name !== selectedCountry) return false;

    // Holiday type filter
    if (selectedHolidayType !== 'All') {
      const packageHolidayTypes = pkg.holiday_types?.map(ht => ht.name) || [];
      if (!packageHolidayTypes.includes(selectedHolidayType)) return false;
    }

    // Price range filter
    if (selectedPriceRange !== 'All') {
      const [min, max] = selectedPriceRange
        .replace('$', '')
        .split('-')
        .map(val => val === '+' ? Infinity : parseInt(val));

      if (pkg.price < min || pkg.price > max) return false;
    }

    // Duration filter
    if (selectedDuration !== 'All') {
      const [min, max] = selectedDuration
        .split(' ')[0]
        .split('-')
        .map(val => val === '+' ? Infinity : parseInt(val));

      if (pkg.duration_days < min || pkg.duration_days > max) return false;
    }

    return true;
  });

  const totalPackages = filteredPackages.length;
  const totalPages = Math.ceil(totalPackages / packagesPerPage);

  // Get current packages (cumulative for "Load More")
  const currentPackages = filteredPackages.slice(0, currentPage * packagesPerPage);
  const hasMore = currentPackages.length < filteredPackages.length;

  // Load more packages
  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedPackageType('All');
    setSelectedCountry('All');
    setSelectedHolidayType('All');
    setSelectedPriceRange('All');
    setSelectedDuration('All');
    setCurrentPage(1);
  };

  return (
    <>
      <SeoHead
        title="Tour Packages"
        description="Browse handpicked vacation packages, compare destinations, and find your next travel experience with Allbound Vacations."
        canonicalPath="/packages"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Tour Packages',
            description: 'Browse handpicked vacation packages, compare destinations, and find your next travel experience with Allbound Vacations.',
            url: buildAbsoluteUrl('/packages'),
            provider: {
              '@type': 'TravelAgency',
              name: SITE_NAME,
              url: SITE_URL,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Packages', item: buildAbsoluteUrl('/packages') },
            ],
          },
        ]}
      />
      <div className="min-h-screen bg-gray-50">

      {/* Hero Section - Package Carousel */}
      <PackageCarousel
        packages={heroPackages}
        isLoading={isLoadingFeaturedPackages || isLoadingPackages}
        className="h-80 md:h-96"
        autoPlay={true}
        autoPlayInterval={6000}
      />

      {/* Full-Width SEO Introduction Section */}
      <div className="w-full bg-white border-b border-gray-200/60 shadow-sm py-8 md:py-10 mb-8">
        <div className="fluid-container">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-playfair mb-4">
            Curated Travel Packages & Tailor-Made Vacations
          </h1>
          <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-4 w-full">
            Embark on the journey of a lifetime with our carefully crafted travel packages. Whether you're seeking the thrill of a classic East African safari, the serenity of pristine Indian Ocean beaches, or the cultural immersion of historic towns, we design itineraries that match your travel aspirations.
          </p>
          <p className="text-gray-600 leading-relaxed text-sm md:text-base w-full">
            At Allbound Vacations, we coordinate every detail—from luxury boutique stays and guided local excursions to seamless logistics and transfers. Explore our featured destinations, select your preferred holiday style, and customize your itinerary to create memories that will last forever.
          </p>
        </div>
      </div>

      <div className="fluid-container pb-12">

        {/* Package Category Selector Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => { setSelectedPackageType('All'); setCurrentPage(1); }}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm ${
              selectedPackageType === 'All'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Packages ({packagesData?.length || 0})
          </button>
          <button
            onClick={() => { setSelectedPackageType('Safari'); setCurrentPage(1); }}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm ${
              selectedPackageType === 'Safari'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-amber-300 hover:bg-amber-50/40'
            }`}
          >
            <span>🦁</span>
            <span>Safari Packages</span>
          </button>
          <button
            onClick={() => { setSelectedPackageType('Holiday'); setCurrentPage(1); }}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-200 shadow-sm ${
              selectedPackageType === 'Holiday'
                ? 'bg-teal text-white shadow-md shadow-teal/20'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-teal hover:bg-teal/5'
            }`}
          >
            <span>🏖️</span>
            <span>Holiday Packages</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-light/40 rounded-lg">
                <svg className="w-6 h-6 text-primary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Find Your Perfect Package</h2>
                <p className="text-sm text-gray-600">Refine your search with these filters</p>
              </div>
            </div>
            <Button
              onClick={handleResetFilters}
              variant="secondary"
              className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Destination Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <svg className="w-4 h-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Destination
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 appearance-none pr-10"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  disabled={isLoadingCountries}
                >
                  {countryOptions.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Holiday Type Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <svg className="w-4 h-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Holiday Type
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 appearance-none pr-10"
                  value={selectedHolidayType}
                  onChange={(e) => setSelectedHolidayType(e.target.value)}
                  disabled={isLoadingHolidayTypes}
                >
                  {holidayTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <svg className="w-4 h-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Price Range
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 appearance-none pr-10"
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                >
                  {priceRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Duration Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <svg className="w-4 h-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Duration
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 appearance-none pr-10"
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                >
                  {durations.map(duration => (
                    <option key={duration} value={duration}>{duration}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(selectedCountry !== 'All' || selectedHolidayType !== 'All' || selectedPriceRange !== 'All' || selectedDuration !== 'All') && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Active filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedCountry !== 'All' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-light/30 text-primary-dark">
                        {selectedCountry}
                      </span>
                    )}
                    {selectedHolidayType !== 'All' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-light/30 text-primary-dark">
                        {selectedHolidayType}
                      </span>
                    )}
                    {selectedPriceRange !== 'All' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-light/30 text-primary-dark">
                        {selectedPriceRange}
                      </span>
                    )}
                    {selectedDuration !== 'All' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-light/30 text-primary-dark">
                        {selectedDuration}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mt-8">
          {isLoadingPackages ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
              <p className="mt-2">Loading packages...</p>
            </div>
          ) : packagesError ? (
            <div className="text-center py-12 text-red-500">
              <p>Error loading packages. Please try again later.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">{filteredPackages.length} packages found</p>

              {filteredPackages.length === 0 ? (
                <div className="text-center py-12">
                  <p>No packages match your filters. Try adjusting your criteria.</p>
                  <Button onClick={handleResetFilters} variant="primary" className="mt-4">
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentPackages.map(pkg => {
                    const rawTriggers: string[] = Array.isArray(pkg.conversion_triggers)
                      ? pkg.conversion_triggers.filter(t => typeof t === 'string' && t.trim().length > 0)
                      : [];

                    const triggersList = [...rawTriggers];
                    if (pkg.is_deal && !triggersList.some(t => /deal|sale|discount/i.test(t))) {
                      triggersList.unshift('Hot Deal');
                    }
                    if (pkg.is_featured && !triggersList.some(t => /featured/i.test(t))) {
                      triggersList.push('Featured');
                    }

                    const primaryTrigger = triggersList[0];
                    const secondaryTrigger = triggersList.length > 1 ? triggersList[1] : null;

                    return (
                      <div key={pkg.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01] flex flex-col h-full group">
                        <Link to={`/packages/${pkg.country?.slug || 'unknown'}/${pkg.slug}`} className="relative block h-64 overflow-hidden bg-gray-100">
                          <img
                            src={getImageUrlWithFallback(pkg.image_id, IMAGE_VARIANTS.MEDIUM)}
                            alt={pkg.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Primary Badge Overlay (Top Left) */}
                          {primaryTrigger && (
                            <div
                              className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1 ${
                                /deal|sale|discount/i.test(primaryTrigger)
                                  ? 'bg-red-600 text-white'
                                  : /featured|popular|bestseller|best seller/i.test(primaryTrigger)
                                    ? 'bg-amber-400 text-gray-900 font-bold'
                                    : 'bg-teal text-white font-bold'
                              }`}
                            >
                              {/deal|sale|discount/i.test(primaryTrigger) && <span className="animate-pulse">🔥</span>}
                              {/featured|popular|bestseller|best seller/i.test(primaryTrigger) && <span>⭐</span>}
                              {!/deal|sale|discount|featured|popular|bestseller|best seller/i.test(primaryTrigger) && <span>⚡</span>}
                              {primaryTrigger}
                            </div>
                          )}

                          {/* Secondary Badge Overlay (Top Right) */}
                          {secondaryTrigger && (
                            <div
                              className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1 ${
                                /featured|popular|bestseller|best seller/i.test(secondaryTrigger)
                                  ? 'bg-amber-400 text-gray-900 font-bold'
                                  : 'bg-charcoal/80 text-white backdrop-blur-xs font-semibold'
                              }`}
                            >
                              {secondaryTrigger}
                            </div>
                          )}
                        </Link>
                        <div className="p-5 flex flex-col flex-grow">
                          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                            {pkg.country && (
                              <div className="flex items-center text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                                <svg className="w-3.5 h-3.5 mr-1 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {pkg.country.name}
                              </div>
                            )}
                            {pkg.holiday_types && pkg.holiday_types.length > 0 && (
                              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium border border-gray-200">
                                {pkg.holiday_types[0].name}
                              </span>
                            )}
                          </div>

                          <Link to={`/packages/${pkg.country?.slug || 'unknown'}/${pkg.slug}`} className="block">
                            <h3 className="text-xl font-bold text-gray-900 hover:text-teal transition-colors mb-2 leading-tight font-playfair">
                              {pkg.name}
                            </h3>
                          </Link>

                          {/* Conversion Triggers Pills */}
                          {rawTriggers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 my-2">
                              {rawTriggers.map((trigger, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-2xs"
                                >
                                  <span className="text-amber-500">⚡</span>
                                  {trigger}
                                </span>
                              ))}
                            </div>
                          )}

                          <div
                            className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pkg.summary || pkg.description || '') }}
                          />

                          <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                            <PackagePriceDisplay packageId={pkg.id} basePrice={pkg.price} />
                            <div className="text-sm font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                              {pkg.duration_days} days
                            </div>
                          </div>
                          {pkg.rating && (
                            <div className="mt-3 flex items-center pt-2 border-t border-gray-100">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-4 h-4 ${i < Math.floor(pkg.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="ml-1 text-xs text-gray-600 font-medium">
                                {pkg.rating} ({pkg.review_count || 0} reviews)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <Button
                    onClick={handleLoadMore}
                    variant="primary"
                    className="px-10 py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  >
                    Load More Packages
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default PackagesPage;
