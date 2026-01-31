import React, { useState, useEffect, useRef } from 'react';

interface NavigationSection {
  id: string;
  label: string;
}

interface StickyNavigationProps {
  sections: NavigationSection[];
  offset?: number;
  onBookNow?: () => void;
  packageName?: string;
}

const StickyNavigation: React.FC<StickyNavigationProps> = ({
  sections,
  offset = 100,
  onBookNow,
  packageName
}) => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Handle sticky positioning based on scroll
    const handleScroll = () => {
      if (navRef.current) {
        const navTop = navRef.current.getBoundingClientRect().top;
        setIsSticky(navTop <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Set up Intersection Observer to detect active section
    const observerOptions = {
      root: null,
      rootMargin: `-${offset}px 0px -50% 0px`,
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all sections
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sections, offset]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      ref={navRef}
      className={`sticky top-16 lg:top-20 z-40 bg-white border-b border-gray-200 transition-all duration-300 ${isSticky ? 'shadow-lg' : 'shadow-sm'
        }`}
    >
      <nav className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Package Name (Left) - Hidden on mobile */}
          {packageName && isSticky && (
            <div className="hidden lg:block flex-shrink-0 py-4">
              <h2 className="text-base font-semibold text-gray-900 truncate max-w-xs">
                {packageName}
              </h2>
            </div>
          )}

          {/* Navigation Links (Center) */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-6 md:space-x-8 py-4">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`flex-shrink-0 px-3 py-2 text-sm font-semibold transition-all duration-200 relative whitespace-nowrap ${activeSection === section.id
                      ? 'text-primary'
                      : 'text-gray-600 hover:text-charcoal'
                    }`}
                >
                  {section.label}
                  {activeSection === section.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-t-full transition-all duration-300 shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Book Now Button (Right) - Shows when sticky */}
          {onBookNow && isSticky && (
            <div className="flex-shrink-0 py-4">
              <button
                onClick={onBookNow}
                className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg text-sm whitespace-nowrap"
              >
                Book Now
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default StickyNavigation;
