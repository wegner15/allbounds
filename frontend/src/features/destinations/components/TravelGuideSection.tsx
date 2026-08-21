import React, { useState, useMemo } from 'react';
import { getTravelGuide } from '../data/travelGuidesData';
import { useTravelGuideCategories, useDestinationGuideItems } from '../../../lib/hooks/useTravelGuides';

interface TravelGuideSectionProps {
  countrySlug?: string;
  countryName: string;
}

const STATIC_CATEGORIES = [
  { id: 'good-to-know', slug: 'good-to-know', label: 'Good to Know', icon: 'ℹ️' },
  { id: 'things-to-do', slug: 'things-to-do', label: 'Things to Do', icon: '🎯' },
  { id: 'going-out', slug: 'going-out', label: 'Going Out', icon: '🌃' },
  { id: 'shopping', slug: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'beaches', slug: 'beaches', label: 'Beaches', icon: '🏖️' },
  { id: 'food-drink', slug: 'food-drink', label: 'Food & Drink', icon: '🍽️' },
  { id: 'sports', slug: 'sports', label: 'Sports & Adventure', icon: '🚴' },
  { id: 'events', slug: 'events', label: 'Events & Festivals', icon: '🎉' },
];

const TravelGuideSection: React.FC<TravelGuideSectionProps> = ({ countrySlug, countryName }) => {
  // Dynamic API queries
  const { data: apiCategories = [] } = useTravelGuideCategories(false);
  const { data: apiItems = [] } = useDestinationGuideItems({ countrySlug, includeInactive: false });

  // Use API categories if present, otherwise static
  const categories = useMemo(() => {
    if (apiCategories.length > 0) {
      return apiCategories.map((c) => ({
        id: c.slug || String(c.id),
        categoryId: c.id,
        slug: c.slug,
        label: c.name,
        icon: c.icon || 'ℹ️',
      }));
    }
    return STATIC_CATEGORIES.map((c) => ({ ...c, categoryId: 0 }));
  }, [apiCategories]);

  const [activeTabSlug, setActiveTabSlug] = useState<string>('good-to-know');

  // Fallback static guide data
  const staticGuideData = useMemo(() => getTravelGuide(countrySlug), [countrySlug]);

  // Determine active items
  const activeItems = useMemo(() => {
    if (apiItems.length > 0) {
      const activeCat = categories.find((c) => c.slug === activeTabSlug || c.id === activeTabSlug);
      if (activeCat && activeCat.categoryId) {
        const filtered = apiItems.filter((item) => item.category_id === activeCat.categoryId);
        return filtered.map((item) => ({
          title: item.title,
          content: item.content,
          icon: item.icon || activeCat.icon || 'ℹ️',
        }));
      }
    }
    // Fallback to static data
    const key = activeTabSlug as keyof typeof staticGuideData;
    return staticGuideData[key] || [];
  }, [apiItems, categories, activeTabSlug, staticGuideData]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-150 pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Traveler Insights</span>
          <h2 className="text-2xl md:text-3xl font-playfair font-bold text-gray-900 mt-1">
            {countryName} Travel Guide
          </h2>
        </div>
        <p className="text-gray-500 text-sm md:text-base max-w-md md:text-right">
          Expert recommendations, practical advice, and local secrets to plan your perfect trip.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto pb-4 mb-8 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-none gap-2">
        {categories.map((cat) => {
          const isActive = activeTabSlug === cat.slug || activeTabSlug === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTabSlug(cat.slug || cat.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeItems.length > 0 ? (
          activeItems.map((item, index) => (
            <div
              key={index}
              className="group bg-gray-50/50 hover:bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200/80 transition-all duration-300 hover:shadow-md flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl p-3 bg-white group-hover:bg-primary-light/10 rounded-xl transition-colors duration-300 shadow-sm border border-gray-100">
                  {item.icon || 'ℹ️'}
                </span>
                <span className="text-xs font-bold text-gray-400 group-hover:text-primary transition-colors duration-300">
                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 font-playfair group-hover:text-primary transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                {item.content}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No guide recommendations found for this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelGuideSection;
