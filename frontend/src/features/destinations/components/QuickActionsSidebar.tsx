import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapIcon, 
  UserGroupIcon, 
  PencilSquareIcon 
} from '@heroicons/react/24/outline';
import TravelTipsCard from './TravelTipsCard';
import SocialSharingCard from './SocialSharingCard';

interface QuickActionsSidebarProps {
  countrySlug: string;
  countryName: string;
}

const QuickActionsSidebar: React.FC<QuickActionsSidebarProps> = React.memo(({ 
  countrySlug, 
  countryName 
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  // Debounced scroll handler for better performance
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Show the mobile bar after scrolling 300px
          const shouldShow = window.scrollY > 300;
          if (shouldShow !== isVisible) {
            setIsVisible(shouldShow);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // Debounce scroll events
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', debouncedScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [isVisible]);

  const handleViewPackages = useCallback(() => {
    navigate(`/packages?country=${countrySlug}`);
  }, [navigate, countrySlug]);

  const handleJoinGroupTrips = useCallback(() => {
    navigate(`/group-trips?country=${countrySlug}`);
  }, [navigate, countrySlug]);

  const handleCustomItinerary = useCallback(() => {
    navigate(`/contact?destination=${countryName}&type=custom-itinerary`);
  }, [navigate, countryName]);

  return (
    <>
      {/* Desktop Sidebar - Sticky */}
      <aside className="hidden lg:block">
        <div className="sticky top-6 space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Plan Your Trip
            </h3>
            
            <div className="space-y-3">
              {/* Primary CTA - View Packages */}
              <button
                onClick={handleViewPackages}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-sm hover:shadow-md active:scale-95"
                aria-label="View tour packages"
              >
                <MapIcon className="w-5 h-5" aria-hidden="true" />
                <span>View Packages</span>
              </button>

              {/* Secondary CTA - Join Group Trips */}
              <button
                onClick={handleJoinGroupTrips}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-white text-primary-600 font-medium rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors duration-200 active:scale-95"
                aria-label="Join group trips"
              >
                <UserGroupIcon className="w-5 h-5" aria-hidden="true" />
                <span>Join Group Trips</span>
              </button>

              {/* Secondary CTA - Custom Itinerary */}
              <button
                onClick={handleCustomItinerary}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-white text-primary-600 font-medium rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors duration-200 active:scale-95"
                aria-label="Request custom itinerary"
              >
                <PencilSquareIcon className="w-5 h-5" aria-hidden="true" />
                <span>Custom Itinerary</span>
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Need help planning your trip to {countryName}?
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="mt-2 w-full text-sm text-primary-600 hover:text-primary-700 font-medium min-h-[44px]"
                aria-label="Contact us for assistance"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile/Tablet Inline Sections - Shown before fixed bottom bar */}
      <div className="lg:hidden space-y-4 md:space-y-6">
        {/* Quick Actions Card for Mobile/Tablet */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Plan Your Trip
          </h3>
          
          <div className="space-y-3">
            {/* Primary CTA - View Packages */}
            <button
              onClick={handleViewPackages}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-sm active:scale-95"
              aria-label="View tour packages"
            >
              <MapIcon className="w-5 h-5" aria-hidden="true" />
              <span>View Packages</span>
            </button>

            {/* Secondary CTA - Join Group Trips */}
            <button
              onClick={handleJoinGroupTrips}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-white text-primary-600 font-medium rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors duration-200 active:scale-95"
              aria-label="Join group trips"
            >
              <UserGroupIcon className="w-5 h-5" aria-hidden="true" />
              <span>Join Group Trips</span>
            </button>

            {/* Secondary CTA - Custom Itinerary */}
            <button
              onClick={handleCustomItinerary}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-white text-primary-600 font-medium rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors duration-200 active:scale-95"
              aria-label="Request custom itinerary"
            >
              <PencilSquareIcon className="w-5 h-5" aria-hidden="true" />
              <span>Custom Itinerary</span>
            </button>
          </div>
        </div>

        {/* Travel Tips Card - Mobile/Tablet */}
        <TravelTipsCard countryName={countryName} />
        
        {/* Social Sharing Card - Mobile/Tablet */}
        <SocialSharingCard 
          countryName={countryName}
          description={`Discover ${countryName} with AllBounds Vacations`}
        />
      </div>

      {/* Mobile Fixed Bottom Bar - Slide Up Animation */}
      <div 
        className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="navigation"
        aria-label="Quick actions"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2">
            {/* Primary CTA - View Packages */}
            <button
              onClick={handleViewPackages}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 min-h-[44px] bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200 shadow-sm active:scale-95"
              aria-label="View tour packages"
            >
              <MapIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm">Packages</span>
            </button>

            {/* Secondary CTA - Join Group Trips */}
            <button
              onClick={handleJoinGroupTrips}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 min-h-[44px] bg-white text-primary-600 font-medium rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors duration-200 active:scale-95"
              aria-label="Join group trips"
            >
              <UserGroupIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm">Groups</span>
            </button>

            {/* Secondary CTA - Custom Itinerary */}
            <button
              onClick={handleCustomItinerary}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 min-h-[44px] bg-white text-primary-600 font-medium rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors duration-200 active:scale-95"
              aria-label="Request custom itinerary"
            >
              <PencilSquareIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm">Custom</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

QuickActionsSidebar.displayName = 'QuickActionsSidebar';

export default QuickActionsSidebar;
