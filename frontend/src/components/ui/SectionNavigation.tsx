import React, { useEffect, useState } from 'react';

export interface NavigationSection {
    id: string;
    label: string;
}

interface SectionNavigationProps {
    sections: NavigationSection[];
    activeSectionId?: string;
    onSectionClick?: (sectionId: string) => void;
    className?: string;
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({
    sections,
    activeSectionId,
    onSectionClick,
    className = ''
}) => {
    const [activeSection, setActiveSection] = useState<string>(activeSectionId || sections[0]?.id || '');

    // Sync activeSection with activeSectionId prop if provided
    useEffect(() => {
        if (activeSectionId !== undefined) {
            setActiveSection(activeSectionId);
        }
    }, [activeSectionId]);

    useEffect(() => {
        // Only run IntersectionObserver if activeSectionId is not explicitly controlled from props
        if (activeSectionId !== undefined) return;

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
    }, [sections, activeSectionId]);

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

    const handleSectionClick = (sectionId: string) => {
        if (onSectionClick) {
            onSectionClick(sectionId);
        } else {
            scrollToSection(sectionId);
        }
    };

    return (
        <nav
            className={`sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm ${className}`}
            role="navigation"
            aria-label="Section navigation"
        >
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap py-2 gap-1.5 md:gap-2 justify-center lg:justify-start">
                    {sections.map((section) => {
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => handleSectionClick(section.id)}
                                className={`
                                  whitespace-nowrap px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200
                                  flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                                  ${isActive
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
