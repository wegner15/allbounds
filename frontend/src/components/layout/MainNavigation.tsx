import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegionsWithCountries } from '../../lib/hooks/useDestinations';
import { useHolidayTypes } from '../../lib/hooks/useHolidayTypes';
import { useAuth } from '../../lib/contexts/AuthContext';
import useAuthHook from '../../lib/hooks/useAuthHook';
import type { RegionWithCountries } from '../../lib/types/api';

// Types for navigation items
interface NavItem {
  label: string;
  path: string;
  hasDropdown?: boolean;
}

interface DestinationRegion {
  name: string;
  countries: {
    name: string;
    slug: string;
  }[];
}

interface HolidayTypeDisplay {
  name: string;
  slug: string;
  icon: string;
}

const MainNavigation: React.FC = () => {
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const [holidayTypesOpen, setHolidayTypesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const destinationsRef = useRef<HTMLDivElement>(null);
  const holidayTypesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}&type=tours`);
      setSearchQuery(''); // Clear after search
      setMobileMenuOpen(false); // Close mobile menu if applicable
    }
  };

  // Auth hooks
  const { user } = useAuth();
  const { handleLogout } = useAuthHook();

  // Navigation items
  const navItems: NavItem[] = [
    { label: 'HOME', path: '/' },
    { label: 'DESTINATIONS', path: '/destinations', hasDropdown: true },
    { label: 'HOLIDAY TYPES', path: '/holiday-types', hasDropdown: true },
    { label: 'PACKAGES', path: '/packages' },
    { label: 'BLOG', path: '/blog' },
    { label: 'FLIGHTS', path: '/flights' },
  ];

  // Fetch regions with countries from API
  const { data: regionsWithCountries, isLoading: isLoadingRegions, error: regionsError } = useRegionsWithCountries();

  // Transform API data into the format needed for the dropdown
  const destinationRegions: DestinationRegion[] = regionsWithCountries ?
    regionsWithCountries.map((region: RegionWithCountries) => {
      return {
        name: region.name,
        countries: region.countries.map(country => ({
          name: country.name,
          slug: country.slug
        }))
      };
    }) : [
      // Fallback data in case API fails
      {
        name: 'Africa',
        countries: [
          { name: 'Kenya', slug: 'kenya' },
          { name: 'Tanzania', slug: 'tanzania' },
          { name: 'South Africa', slug: 'south-africa' },
        ],
      },
      {
        name: 'Europe',
        countries: [
          { name: 'France', slug: 'france' },
          { name: 'Italy', slug: 'italy' },
          { name: 'Spain', slug: 'spain' },
        ],
      },
      {
        name: 'Asia',
        countries: [
          { name: 'Thailand', slug: 'thailand' },
          { name: 'Japan', slug: 'japan' },
          { name: 'Indonesia', slug: 'indonesia' },
        ],
      },
    ];

  // Fetch holiday types from API
  const { data: holidayTypesData, isLoading: isLoadingHolidayTypes, error: holidayTypesError } = useHolidayTypes();

  // Function to determine icon based on holiday type name (fallback)
  const getHolidayTypeIconFallback = (name: string): string => {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('safari') || lowerName.includes('wildlife')) return '🦁';
    if (lowerName.includes('beach') || lowerName.includes('coastal')) return '🏖️';
    if (lowerName.includes('city') || lowerName.includes('urban')) return '🏙️';
    if (lowerName.includes('honeymoon') || lowerName.includes('romantic')) return '💑';
    if (lowerName.includes('family') || lowerName.includes('kids')) return '👨‍👩‍👧‍👦';
    if (lowerName.includes('adventure') || lowerName.includes('trekking')) return '🧗‍♂️';
    if (lowerName.includes('cruise') || lowerName.includes('boat')) return '🚢';
    if (lowerName.includes('mountain') || lowerName.includes('hiking')) return '🏔️';
    if (lowerName.includes('luxury') || lowerName.includes('premium')) return '💎';
    if (lowerName.includes('food') || lowerName.includes('culinary') || lowerName.includes('gastronomic')) return '🍽️';
    if (lowerName.includes('wine') || lowerName.includes('vineyard')) return '🍷';
    if (lowerName.includes('cultural') || lowerName.includes('heritage')) return '🏛️';
    if (lowerName.includes('historical') || lowerName.includes('history')) return '🏺';
    if (lowerName.includes('sport') || lowerName.includes('active')) return '⚽';
    if (lowerName.includes('school') || lowerName.includes('educational')) return '🎒';
    if (lowerName.includes('incentive') || lowerName.includes('corporate')) return '🏆';
    if (lowerName.includes('weekend') || lowerName.includes('short')) return '🌅';
    if (lowerName.includes('inclusive') || lowerName.includes('all-inclusive')) return '🍹';
    if (lowerName.includes('conference') || lowerName.includes('meeting')) return '🎤';

    // Default icon
    return '✈️';
  };

  // Transform API data into the format needed for the dropdown
  const holidayTypeItems: HolidayTypeDisplay[] = holidayTypesData ?
    holidayTypesData.map(type => ({
      name: type.name,
      slug: type.slug,
      icon: type.icon || getHolidayTypeIconFallback(type.name)
    })) : [
      // Fallback data in case API fails
      { name: 'Safaris', slug: 'safaris', icon: '🦁' },
      { name: 'Beach Holidays', slug: 'beach-holidays', icon: '🏖️' },
      { name: 'City Breaks', slug: 'city-breaks', icon: '🏙️' },
      { name: 'Honeymoons', slug: 'honeymoons', icon: '💑' },
      { name: 'Luxury Holidays', slug: 'luxury-holidays', icon: '💎' },
    ];

  // Additional travel options
  const travelOptions = [
    { name: 'Tours', slug: 'tours', icon: '🧭' },
    { name: 'Packages', slug: 'packages', icon: '📦' },
    { name: 'Attractions', slug: 'attractions', icon: '🎯' },
    { name: 'Hotels', slug: 'hotels', icon: '🏨' },
    { name: 'Blog', slug: 'blog', icon: '📝' },
  ];

  // Scroll listener for compact nav
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the destinations dropdown
      if (destinationsOpen &&
        destinationsRef.current &&
        !destinationsRef.current.contains(event.target as Node) &&
        !(event.target as Element)?.closest?.('[data-dropdown="destinations"]')
      ) {
        setDestinationsOpen(false);
      }

      // Check if the click is outside the holiday types dropdown
      if (holidayTypesOpen &&
        holidayTypesRef.current &&
        !holidayTypesRef.current.contains(event.target as Node) &&
        !(event.target as Element)?.closest?.('[data-dropdown="holiday-types"]')
      ) {
        setHolidayTypesOpen(false);
      }
    };

    // Only add the event listener when one of the dropdowns is open
    if (destinationsOpen || holidayTypesOpen) {
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [destinationsOpen, holidayTypesOpen]);

  // Toggle dropdowns
  const toggleDestinations = () => {
    setDestinationsOpen(!destinationsOpen);
    if (holidayTypesOpen) setHolidayTypesOpen(false);
  };

  const toggleHolidayTypes = () => {
    setHolidayTypesOpen(!holidayTypesOpen);
    if (destinationsOpen) setDestinationsOpen(false);
  };

  return (
    <header className={`sticky top-0 z-[1000] bg-white w-full border-b border-gray-100 transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
      {/* Top Tier: Logo, Contact, CTA — hidden when scrolled */}
      <div className={`border-b border-gray-50 overflow-hidden transition-all duration-300 ease-in-out ${scrolled ? 'max-h-0 border-b-0 opacity-0' : 'max-h-32 opacity-100'}`}>
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <div className="flex items-center">
                <img
                  src="/logo/main_logo.png"
                  alt="AllBound Vacations"
                  className="h-10 sm:h-12 w-auto"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const sibling = target.nextElementSibling as HTMLElement;
                    if (sibling) sibling.style.display = 'block';
                  }}
                />
                <span className="hidden text-2xl font-bold text-charcoal ml-2">AllBound Vacations</span>
              </div>
            </Link>

            {/* Right Side: Contact, Wishlist, CTA */}
            <div className="flex items-center space-x-6">
              {/* Contact Info */}
              <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-xs text-gray-500 font-medium text-right">Call us today from 09:00 - 17:30</span>
                <div className="flex flex-col items-end">
                  <a href="tel:+256782594008" className="text-base lg:text-lg font-bold text-charcoal hover:text-primary transition-colors leading-tight">
                    UG: +(256) 782 594 008
                  </a>
                  <a href="tel:+254723927458" className="text-base lg:text-lg font-bold text-charcoal hover:text-primary transition-colors leading-tight">
                    KE: +(254) 723 927 458
                  </a>
                </div>
              </div>

              {/* Wishlist Icon */}
              <button className="text-charcoal-light hover:text-primary transition-colors" aria-label="Wishlist">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              {/* CTA Button */}
              <Link
                to="/contact-us"
                className="hidden sm:flex items-center px-6 py-3 bg-primary text-white text-sm font-bold rounded uppercase tracking-wider hover:bg-primary-dark transition-all transform hover:scale-[1.02] shadow-sm"
              >
                Start Planning
              </Link>

              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 rounded-md text-charcoal hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tier: Navigation Links & Search — also shows compact logo when scrolled */}
      <div className="hidden lg:block bg-white">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-12' : 'h-14'}`}>

            {/* Compact logo — only visible when scrolled */}
            {scrolled && (
              <Link to="/" className="flex items-center flex-shrink-0 mr-6">
                <img
                  src="/logo/main_logo.png"
                  alt="AllBound Vacations"
                  className="h-7 w-auto"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const sibling = target.nextElementSibling as HTMLElement;
                    if (sibling) sibling.style.display = 'block';
                  }}
                />
                <span className="hidden text-base font-bold text-charcoal ml-2">AllBound</span>
              </Link>
            )}

            {/* Navigation Links */}
            <nav className="flex items-center space-x-0 xl:space-x-1">
              {navItems.map((item) => (
                <div key={item.path} className="relative group">
                  {item.hasDropdown ? (
                    <button
                      className={`flex items-center text-sm xl:text-base font-bold text-gray-700 hover:text-primary transition-colors whitespace-nowrap px-3 xl:px-4 border-b-2 border-transparent hover:border-primary ${scrolled ? 'py-3' : 'py-4'}`}
                      onClick={item.label === 'DESTINATIONS' ? toggleDestinations : toggleHolidayTypes}
                      data-dropdown={item.label === 'DESTINATIONS' ? 'destinations' : 'holiday-types'}
                    >
                      {item.label}
                      <svg
                        className={`ml-1 h-3 w-3 transition-transform ${(item.label === 'DESTINATIONS' && destinationsOpen) ||
                          (item.label === 'HOLIDAY TYPES' && holidayTypesOpen)
                          ? 'rotate-180'
                          : ''
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`inline-block text-sm xl:text-base font-bold text-gray-700 hover:text-primary transition-colors whitespace-nowrap px-3 xl:px-4 border-b-2 border-transparent hover:border-primary ${scrolled ? 'py-3' : 'py-4'}`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="flex-1 max-w-sm ml-8">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Explore your world"
                  className="w-full bg-gray-100 border-none rounded-full py-2 pl-4 pr-10 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                />
                <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-primary transition-colors">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Compact CTA — visible when scrolled */}
            {scrolled && (
              <Link
                to="/contact-us"
                className="ml-6 flex items-center px-4 py-2 bg-primary text-white text-xs font-bold rounded uppercase tracking-wider hover:bg-primary-dark transition-all shadow-sm whitespace-nowrap"
              >
                Start Planning
              </Link>
            )}

            {/* Mobile menu button (scrolled mode) */}
            {scrolled && (
              <button
                className="lg:hidden ml-3 p-2 rounded-md text-charcoal hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-3 space-y-3">
            {navItems.map((item) => (
              <div key={item.path}>
                {item.hasDropdown ? (
                  <div>
                    <button
                      className="flex items-center justify-between w-full text-base font-medium text-charcoal hover:text-hover transition-colors py-2"
                      onClick={() => {
                        if (item.label === 'DESTINATIONS') {
                          setDestinationsOpen(!destinationsOpen);
                          setHolidayTypesOpen(false);
                        } else {
                          setHolidayTypesOpen(!holidayTypesOpen);
                          setDestinationsOpen(false);
                        }
                      }}
                    >
                      {item.label}
                      <svg
                        className={`h-5 w-5 transition-transform ${(item.label === 'DESTINATIONS' && destinationsOpen) ||
                          (item.label === 'HOLIDAY TYPES' && holidayTypesOpen)
                          ? 'rotate-180'
                          : ''
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {item.label === 'DESTINATIONS' && destinationsOpen && (
                      <div className="pl-4 py-2 space-y-2">
                        <Link
                          to="/destinations"
                          className="block text-sm text-blue-600 hover:underline py-1"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          All Destinations
                        </Link>
                        {destinationRegions.slice(0, 3).map((region) => (
                          <div key={region.name} className="py-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{region.name}</p>
                            {region.countries.slice(0, 3).map((country) => (
                              <Link
                                key={country.slug}
                                to={`/destinations/${country.slug}`}
                                className="block text-sm text-gray-700 hover:text-hover py-1 pl-2"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {country.name}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    {item.label === 'HOLIDAY TYPES' && holidayTypesOpen && (
                      <div className="pl-4 py-2 space-y-2">
                        <Link
                          to="/holiday-types"
                          className="block text-sm text-blue-600 hover:underline py-1"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          All Holiday Types
                        </Link>
                        {holidayTypeItems.slice(0, 5).map((type) => (
                          <Link
                            key={type.slug}
                            to={`/holiday-types/${type.slug}`}
                            className="flex items-center space-x-2 text-sm text-gray-700 hover:text-hover py-1"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <span>{type.icon}</span>
                            <span>{type.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className="block text-base font-medium text-charcoal hover:text-hover transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {/* Mobile Contact & Auth */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <span className="text-xs text-gray-500 font-medium">Call us today from 09:00 - 17:30</span>
                <a href="tel:+256782594008" className="text-lg font-bold text-charcoal">
                  UG: +(256) 782 594 008
                </a>
                <a href="tel:+254723927458" className="text-lg font-bold text-charcoal">
                  KE: +(254) 723 927 458
                </a>
              </div>

              <Link
                to="/contact-us"
                className="block w-full text-center px-6 py-3 bg-primary text-white text-sm font-bold rounded uppercase tracking-wider hover:bg-primary-dark transition-colors shadow-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start Planning
              </Link>

              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-center px-4 py-2 border border-gray-200 text-sm font-medium rounded text-charcoal bg-white hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-2 border border-gray-200 text-sm font-medium rounded text-charcoal bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Destinations Dropdown */}
      {destinationsOpen && !mobileMenuOpen && (
        <div
          ref={destinationsRef}
          className="hidden lg:block absolute left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-4">
              <Link
                to="/destinations"
                className="text-blue-600 hover:underline flex items-center"
                onClick={() => setDestinationsOpen(false)}
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                All Destinations
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {isLoadingRegions ? (
                <div className="col-span-6 text-center py-4">Loading destinations...</div>
              ) : regionsError ? (
                <div className="col-span-6 text-center py-4 text-red-500">Failed to load destinations</div>
              ) : (
                destinationRegions.map((region) => (
                  <div key={region.name} className="mb-4">
                    <h3 className="text-lg font-bold text-charcoal mb-2">{region.name}</h3>
                    <ul className="space-y-1">
                      {region.countries.map((country) => (
                        <li key={country.slug}>
                          <Link
                            to={`/destinations/${country.slug}`}
                            className="text-sm text-gray-600 hover:text-hover transition-colors"
                            onClick={() => setDestinationsOpen(false)}
                          >
                            {country.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Holiday Types Dropdown */}
      {holidayTypesOpen && !mobileMenuOpen && (
        <div
          ref={holidayTypesRef}
          className="hidden lg:block absolute left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-4">
              <Link
                to="/holiday-types"
                className="text-blue-600 hover:underline"
                onClick={() => setHolidayTypesOpen(false)}
              >
                All Holidays
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {isLoadingHolidayTypes ? (
                <div className="col-span-5 text-center py-4">Loading holiday types...</div>
              ) : holidayTypesError ? (
                <div className="col-span-5 text-center py-4 text-red-500">Failed to load holiday types</div>
              ) : (
                holidayTypeItems.map((type) => (
                  <Link
                    key={type.slug}
                    to={`/holiday-types/${type.slug}`}
                    className="flex items-center space-x-2 text-charcoal hover:text-hover transition-colors"
                    onClick={() => setHolidayTypesOpen(false)}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <span>{type.name}</span>
                  </Link>
                ))
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {travelOptions.map((option) => (
                <Link
                  key={option.slug}
                  to={`/${option.slug}`}
                  className="flex items-center space-x-2 text-charcoal hover:text-hover transition-colors"
                  onClick={() => setHolidayTypesOpen(false)}
                >
                  <span className="text-xl">{option.icon}</span>
                  <span>{option.name}</span>
                </Link>
              ))}
            </div>

            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Where are you going?"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Check in - Check out</label>
                <div className="flex">
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-l"
                  />
                  <input
                    type="date"
                    className="w-full p-2 border-t border-b border-r border-gray-300 rounded-r"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="block text-xs text-gray-500 mb-1">Guests</label>
                <div className="flex h-full">
                  <select className="w-full p-2 border border-gray-300 rounded-l">
                    <option>2 adults</option>
                    <option>1 adult</option>
                    <option>3 adults</option>
                    <option>4 adults</option>
                  </select>
                  <button className="bg-blue-600 text-white px-4 rounded-r flex items-center justify-center">
                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default MainNavigation;
