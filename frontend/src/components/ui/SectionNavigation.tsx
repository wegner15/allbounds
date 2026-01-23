import React, { useEffect, useState } from 'react';

export interface NavigationSection {
    id: string;
    label: string;
}

interface SectionNavigationProps {
    sections: NavigationSection[];
    className?: string;
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({ sections, className = '' }) => {
    const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // Trigger when section is roughly in the middle of viewport
            threshold: 0,
        };

        const observerCallback: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe all sections
        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            observer.disconnect();
        };
    }, [sections]);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 100; // Account for sticky header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });
        }
    };

    return (
        <nav
            className={`sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm ${className}`}
            role="navigation"
            aria-label="Section navigation"
        >
            <div className="container mx-auto px-4">
                <div className="flex overflow-x-auto scrollbar-hide py-3 gap-2 md:gap-4">
                    {sections.map((section) => {
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={`
                  whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-all duration-200
                  flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  ${isActive
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }
                `}
                                aria-current={isActive ? 'location' : undefined}
                            >
                                {section.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default SectionNavigation;
