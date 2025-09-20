import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRegionsWithCountries } from '../../lib/hooks/useDestinations';
import { useHolidayTypes } from '../../lib/hooks/useHolidayTypes';
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
  const destinationsRef = useRef<HTMLDivElement>(null);
  const holidayTypesRef = useRef<HTMLDivElement>(null);

  // Navigation items
  const navItems: NavItem[] = [
    { label: 'HOME', path: '/' },
    { label: 'DESTINATIONS', path: '/destinations', hasDropdown: true },
    { label: 'HOLIDAY TYPES', path: '/holiday-types', hasDropdown: true },
    { label: 'PACKAGES', path: '/packages' },
    { label: 'GROUP TRIPS', path: '/group-trips' },
    { label: 'ABOUT US', path: '/about-us' },
    { label: 'BLOG', path: '/blog' },
    { label: 'CONTACT US', path: '/contact-us' },
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
  
  // Map of icons for holiday types
  const holidayTypeIcons: Record<string, string> = {
    'safari': '🦁',
    'family': '👨‍👩‍👧‍👦',
    'beach': '🏖️',
    'city': '🏙️',
    'honeymoon': '💑',
    'school': '🎒',
    'incentive': '🏆',
    'weekend': '🌅',
    'inclusive': '🍹',
    'cruise': '🚢',
    'mountain': '🏔️',
    'luxury': '💎',
    'food': '🍷',
    'conference': '🎤',
    'sport': '⚽',
    'default': '✈️'
  };
  
  // Function to determine icon based on holiday type name
  const getHolidayTypeIcon = (name: string): string => {
    const lowerName = name.toLowerCase();
    const iconKey = Object.keys(holidayTypeIcons).find(key => lowerName.includes(key));
    return iconKey ? holidayTypeIcons[iconKey] : holidayTypeIcons.default;
  };
  
  // Transform API data into the format needed for the dropdown
  const holidayTypeItems: HolidayTypeDisplay[] = holidayTypesData ? 
    holidayTypesData.map(type => ({
      name: type.name,
      slug: type.slug,
      icon: getHolidayTypeIcon(type.name)
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
    <header className="relative z-50">
      {/* Main Navigation Bar */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="flex items-center">
                <img 
                  src="/logo/android-chrome-192x192.png" 
                  alt="AllBounds Vacations" 
                  className="h-10 w-auto"
                  onError={(e) => {
                    // Fallback if logo image is not available
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const sibling = target.nextElementSibling as HTMLElement;
                    if (sibling) sibling.style.display = 'block';
                  }}
                />
                <span className="hidden text-xl font-bold text-charcoal ml-2">AllBounds Vacations</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <div key={item.path} className="relative">
                  {item.hasDropdown ? (
                    <button
                      className="flex items-center text-xs font-medium text-charcoal hover:text-hover transition-colors"
                      onClick={item.label === 'DESTINATIONS' ? toggleDestinations : toggleHolidayTypes}
                      data-dropdown={item.label === 'DESTINATIONS' ? 'destinations' : 'holiday-types'}
                    >
                      {item.label}
                      <svg
                        className={`ml-1 h-4 w-4 transition-transform ${
                          (item.label === 'DESTINATIONS' && destinationsOpen) || 
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
                  ) : (
                    <Link
                      to={item.path}
                      className="text-xs font-medium text-charcoal hover:text-hover transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/contact-us"
                className="hidden sm:inline-flex items-center px-4 py-2 bg-[#0a1f44] text-white text-sm font-medium rounded hover:bg-opacity-90 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded text-charcoal bg-white hover:bg-gray-50 transition-colors"
              >
                Sign In / Register
              </Link>
              
              {/* Mobile menu button */}
              <button className="md:hidden p-2 rounded-md text-charcoal hover:bg-gray-100">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Destinations Dropdown */}
      {destinationsOpen && (
        <div 
          ref={destinationsRef}
          className="absolute left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50"
        >
          <div className="container mx-auto px-4 py-6">
            <div className="mb-4">
              <Link to="/destinations" className="text-blue-600 hover:underline flex items-center">
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
                    <h3 className="font-medium text-charcoal mb-2">{region.name}</h3>
                    <ul className="space-y-1">
                      {region.countries.map((country) => (
                        <li key={country.slug}>
                          <Link 
                            to={`/destinations/${country.slug}`}
                            className="text-sm text-gray-600 hover:text-hover transition-colors"
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
      {holidayTypesOpen && (
        <div 
          ref={holidayTypesRef}
          className="absolute left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50"
        >
          <div className="container mx-auto px-4 py-6">
            <div className="mb-4">
              <Link to="/holiday-types" className="text-blue-600 hover:underline">
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
