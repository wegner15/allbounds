import React from 'react';
import type { PackageDetailResponse } from '../../lib/types/api';
import { Clock, Users, TrendingUp, Sparkles, Check } from 'lucide-react';

interface OverviewSectionProps {
  packageData: PackageDetailResponse;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ packageData }) => {
  // Extract key tour highlights, experiences, attractions, and unique selling points
  const tourHighlights = React.useMemo(() => {
    // 1. If custom highlights are configured by admin, prioritize them directly
    if (packageData.highlights && Array.isArray(packageData.highlights) && packageData.highlights.length > 0) {
      const customItems = packageData.highlights
        .map((h) =>
          typeof h === 'string'
            ? h
                .replace(/<[^>]*>/g, '')
                .trim()
                .replace(/^[-•*–—\s]+/, '')
            : ''
        )
        .filter((h) => h.length > 0);

      if (customItems.length > 0) {
        return customItems;
      }
    }

    const items: string[] = [];
    const seen = new Set<string>();

    const addItem = (text: string) => {
      if (!text) return;
      const clean = text
        .replace(/<[^>]*>/g, '')
        .trim()
        .replace(/^[-•*–—\s]+/, '')
        .replace(/\s+/g, ' ');

      const key = clean.toLowerCase();
      if (clean.length >= 10 && clean.length <= 220 && !seen.has(key)) {
        seen.add(key);
        items.push(clean);
      }
    };

    // 1. Extract explicit list items (<li>) from description if present
    if (packageData.description) {
      const liMatches = packageData.description.match(/<li[^>]*>(.*?)<\/li>/gi);
      if (liMatches && liMatches.length > 0) {
        liMatches.forEach((li) => {
          const text = li.replace(/<[^>]*>/g, '').trim();
          if (text.length > 12 && text.length < 180) {
            addItem(text);
          }
        });
      }
    }

    // 2. Extract key experience sentences from summary (similar to Activity Highlights)
    if (packageData.summary && items.length < 5) {
      const sentences = packageData.summary
        .split(/(?<=[.!?])\s+|\n+/)
        .map((s) => s.trim().replace(/^[•\-\*\s]+/, ''))
        .filter((s) => s.length > 15 && s.length < 180);
      sentences.forEach((s) => addItem(s));
    }

    // 3. Extract key experiences from itinerary day titles
    if (packageData.itinerary_items && packageData.itinerary_items.length > 0 && items.length < 6) {
      packageData.itinerary_items.forEach((day) => {
        if (day.title) {
          const cleanTitle = day.title.replace(/^Day\s*\d+[:\s\-]*/i, '').trim();
          const lower = cleanTitle.toLowerCase();
          const isGenericLogistics =
            lower === 'departure' ||
            lower === 'airport transfer' ||
            lower === 'flight home' ||
            lower === 'check-out';

          if (cleanTitle.length > 10 && !isGenericLogistics) {
            addItem(cleanTitle);
          }
        }
      });
    }

    // 4. Attractions highlights
    if (packageData.attractions && packageData.attractions.length > 0 && items.length < 6) {
      const attractionNames = packageData.attractions.slice(0, 4).map((a) => a.name);
      if (attractionNames.length > 0) {
        addItem(`Visit iconic attractions including ${attractionNames.join(', ')}`);
      }
    }

    // 5. Accommodations USP
    if (packageData.hotels && packageData.hotels.length > 0 && items.length < 6) {
      const hotelNames = packageData.hotels.slice(0, 2).map((h) => h.name).join(' & ');
      const stars = packageData.hotels.filter((h) => h.stars).map((h) => h.stars!);
      if (stars.length > 0) {
        const avgStars = Math.round(stars.reduce((a, b) => a + b, 0) / stars.length);
        addItem(`Handpicked ${avgStars}-star accommodations (${hotelNames}) with daily breakfast`);
      } else {
        addItem(`Handpicked accommodations (${hotelNames}) selected for comfort and prime location`);
      }
    }

    // 6. Curated itinerary & seamless experience USPs
    if (items.length < 5) {
      const dest = packageData.country?.name || 'your destination';
      addItem(
        `Carefully crafted ${packageData.duration_days || 8}-day itinerary designed to maximize your time in ${dest}`
      );
    }

    if (items.length < 6) {
      addItem(
        `Expert local guides and dedicated private transportation for a seamless, hassle-free journey`
      );
    }

    return items.slice(0, 7);
  }, [packageData]);

  // Determine group size (placeholder logic - can be enhanced)
  const groupSize = packageData.hotels && packageData.hotels.length > 0 
    ? '2-15 people' 
    : 'Flexible';

  // Determine difficulty (placeholder logic - can be enhanced based on activities)
  const difficulty = packageData.itinerary_items && packageData.itinerary_items.length > 7
    ? 'Moderate'
    : 'Easy';

  return (
    <section id="overview" className="scroll-mt-20 animate-fade-in" aria-labelledby="overview-heading">
      <article className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 border border-gray-100">
        {/* Section Header */}
        <h2 id="overview-heading" className="text-3xl md:text-4xl font-playfair font-bold text-charcoal mb-4 md:mb-6">
          Tour Overview
        </h2>

        {/* Full Description */}
        {packageData.description && (
          <div 
            className="prose prose-sm sm:prose-base lg:prose-lg max-w-none mb-6 md:mb-8 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: packageData.description }}
            role="article"
            aria-label="Tour description"
          />
        )}

        {/* Tour Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-6 md:mb-8">
          {/* Duration */}
          {packageData.duration_days && (
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 sm:p-6 border border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center mr-3 shadow-md">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide">Duration</div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-charcoal font-playfair ml-13 sm:ml-15">
                {packageData.duration_days} {packageData.duration_days === 1 ? 'Day' : 'Days'}
              </div>
            </div>
          )}

          {/* Group Size */}
          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-5 sm:p-6 border border-accent/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center mr-3 shadow-md">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide">Group Size</div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-charcoal font-playfair ml-13 sm:ml-15">
              {groupSize}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-xl p-5 sm:p-6 border border-success/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide">Difficulty</div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-charcoal font-playfair ml-13 sm:ml-15">
              {difficulty}
            </div>
          </div>
        </div>

        {/* Tour Highlights & "Why Choose This Tour" Callout Box */}
        <div className="bg-gradient-to-br from-primary via-primary-dark to-primary rounded-2xl p-6 sm:p-7 md:p-9 text-white shadow-xl border border-primary-light/20 relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24" />
          </div>
          
          <div className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1 w-full">
              <div className="mb-4 sm:mb-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-teal-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                    Tour Highlights
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-playfair font-bold text-white drop-shadow-sm">
                  Why Choose This Tour?
                </h3>
                <p className="text-teal-100/90 text-xs sm:text-sm font-medium mt-1">
                  Key experiences, top attractions, and unique highlights of this journey
                </p>
              </div>

              {/* Structured Highlights List */}
              <ul className="space-y-3 text-teal-50 text-sm sm:text-base leading-relaxed">
                {tourHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-3 group">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mt-0.5 text-white shadow-2xs">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span className="flex-1 text-white/95 pt-0.5">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

