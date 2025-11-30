import React, { useState } from 'react';
import type { ItineraryItemDetail } from '../../lib/types/api';
import ItineraryDayCard from './ItineraryDayCard';
import { Calendar } from 'lucide-react';

interface ItinerarySectionProps {
  itineraryItems: ItineraryItemDetail[];
}

const ItinerarySection: React.FC<ItinerarySectionProps> = ({ itineraryItems }) => {
  // Track which days are expanded (default: first day expanded)
  const [expandedDays, setExpandedDays] = useState<Set<number>>(
    new Set(itineraryItems.length > 0 ? [itineraryItems[0].id] : [])
  );

  const toggleDay = (dayId: number) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dayId)) {
        newSet.delete(dayId);
      } else {
        newSet.add(dayId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedDays(new Set(itineraryItems.map((item) => item.id)));
  };

  const collapseAll = () => {
    setExpandedDays(new Set());
  };

  if (!itineraryItems || itineraryItems.length === 0) {
    return null;
  }

  // Sort itinerary items by day number
  const sortedItems = [...itineraryItems].sort((a, b) => a.day_number - b.day_number);

  return (
    <section id="itinerary" className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-white to-gray-50 scroll-mt-20" aria-labelledby="itinerary-heading">
      <div className="container mx-auto px-0">
        {/* Section Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 px-4">
          <div className="mb-4 sm:mb-0">
            <h2 id="itinerary-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal mb-2 font-playfair">
              Day by Day Itinerary
            </h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              Explore the detailed daily schedule of your adventure
            </p>
          </div>
          
          {/* Expand/Collapse Controls - Desktop */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <button
              onClick={expandAll}
              className="text-sm text-primary hover:text-primary-dark font-semibold transition-all duration-200 hover:scale-105 touch-manipulation min-h-[44px] px-3 py-2 rounded-lg hover:bg-primary/10"
            >
              Expand All
            </button>
            <span className="text-gray-300 font-bold">|</span>
            <button
              onClick={collapseAll}
              className="text-sm text-primary hover:text-primary-dark font-semibold transition-all duration-200 hover:scale-105 touch-manipulation min-h-[44px] px-3 py-2 rounded-lg hover:bg-primary/10"
            >
              Collapse All
            </button>
          </div>
        </header>

        {/* Timeline Container */}
        <div className="relative px-4" role="list" aria-label="Daily itinerary">
          {/* Timeline Line - Hidden on mobile, visible on tablet and up */}
          <div className="hidden md:block absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary-light to-primary/30 rounded-full shadow-sm" 
               style={{ height: 'calc(100% - 2rem)' }} 
          />

          {/* Itinerary Days */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {sortedItems.map((item, index) => (
              <article key={item.id} className="relative" role="listitem">
                {/* Timeline Dot - Hidden on mobile */}
                <div className="hidden md:block absolute left-8 top-8 w-5 h-5 -ml-2.5 rounded-full bg-gradient-to-br from-primary to-primary-dark border-4 border-white shadow-lg z-10 animate-scale-in" />
                
                {/* Day Card with left margin for timeline on desktop */}
                <div className="md:ml-20">
                  <ItineraryDayCard
                    itineraryItem={item}
                    isExpanded={expandedDays.has(item.id)}
                    onToggle={() => toggleDay(item.id)}
                  />
                </div>

                {/* Optional: Add connector line between days */}
                {index < sortedItems.length - 1 && (
                  <div className="hidden md:block absolute left-8 w-0.5 bg-teal-300 opacity-50" 
                       style={{ 
                         top: 'calc(100% - 1rem)', 
                         height: '2rem',
                         marginLeft: '-1px'
                       }} 
                  />
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Mobile Expand/Collapse Controls */}
        <div className="md:hidden flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 border-t border-gray-200 px-4">
          <button
            onClick={expandAll}
            className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 active:text-teal-800 font-medium transition-colors px-3 sm:px-4 py-2.5 rounded-lg hover:bg-teal-50 active:bg-teal-100 touch-manipulation min-h-[44px]"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden xs:inline">Expand All Days</span>
            <span className="xs:hidden">Expand All</span>
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={collapseAll}
            className="text-sm text-teal-600 hover:text-teal-700 active:text-teal-800 font-medium transition-colors px-3 sm:px-4 py-2.5 rounded-lg hover:bg-teal-50 active:bg-teal-100 touch-manipulation min-h-[44px]"
          >
            Collapse All
          </button>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-gray-200 px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-1 font-playfair">
                {sortedItems.length}
              </div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Days</div>
            </div>
            <div className="text-center bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-4 border border-accent/20">
              <div className="text-3xl sm:text-4xl font-bold text-accent mb-1 font-playfair">
                {sortedItems.reduce((acc, item) => 
                  acc + (item.custom_activities?.length || 0), 0
                )}
              </div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Activities</div>
            </div>
            <div className="text-center bg-gradient-to-br from-success/10 to-success/5 rounded-xl p-4 border border-success/20">
              <div className="text-3xl sm:text-4xl font-bold text-success mb-1 font-playfair">
                {sortedItems.reduce((acc, item) => 
                  acc + (item.hotels?.length || 0), 0
                )}
              </div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Hotels</div>
            </div>
            <div className="text-center bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-4 border border-purple-500/20">
              <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-1 font-playfair">
                {sortedItems.reduce((acc, item) => 
                  acc + (item.attractions?.length || 0), 0
                )}
              </div>
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Attractions</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItinerarySection;
