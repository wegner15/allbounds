import React, { useState, useMemo, useEffect } from 'react';
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

  // Fallback static guide data
  const staticGuideData = useMemo(() => getTravelGuide(countrySlug), [countrySlug]);

  // Base list of categories
  const rawCategories = useMemo(() => {
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

  // Filter categories to ONLY include those with contents for this country
  const categories = useMemo(() => {
    return rawCategories.filter((cat) => {
      // 1. Check API items in database
      if (apiItems.length > 0 && cat.categoryId) {
        const hasApiItems = apiItems.some((item) => item.category_id === cat.categoryId);
        if (hasApiItems) return true;
      }
      // 2. Check static guide data items
      if (staticGuideData && cat.slug) {
        const key = cat.slug as keyof typeof staticGuideData;
        const staticItems = staticGuideData[key];
        if (Array.isArray(staticItems) && staticItems.length > 0) {
          return true;
        }
      }
      return false;
    });
  }, [rawCategories, apiItems, staticGuideData]);

  const [activeTabSlug, setActiveTabSlug] = useState<string>('');

  // Automatically sync activeTabSlug to the first category with contents
  useEffect(() => {
    if (categories.length > 0) {
      const isValid = categories.some((c) => c.slug === activeTabSlug || c.id === activeTabSlug);
      if (!isValid) {
        setActiveTabSlug(categories[0].slug || categories[0].id);
      }
    }
  }, [categories, activeTabSlug]);

  const activeCategory = useMemo(() => {
    return categories.find((c) => c.slug === activeTabSlug || c.id === activeTabSlug) || categories[0];
  }, [categories, activeTabSlug]);

  // Determine active items matching the active category
  const activeItems = useMemo(() => {
    if (!activeCategory) return [];

    // 1. Try DB items matching activeCategory
    if (apiItems.length > 0 && activeCategory.categoryId) {
      const filtered = apiItems.filter((item) => item.category_id === activeCategory.categoryId);
      if (filtered.length > 0) {
        return filtered.map((item) => ({
          title: item.title,
          content: item.content,
          icon: item.icon || activeCategory.icon || 'ℹ️',
        }));
      }
    }

    // 2. Try static guide data matching activeCategory slug
    if (staticGuideData && activeCategory.slug) {
      const key = activeCategory.slug as keyof typeof staticGuideData;
      if (staticGuideData[key] && Array.isArray(staticGuideData[key]) && staticGuideData[key].length > 0) {
        return staticGuideData[key];
      }
    }

    return [];
  }, [apiItems, activeCategory, staticGuideData]);

  if (categories.length === 0) {
    return null;
  }

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
          const isActive = (activeCategory?.slug && cat.slug === activeCategory.slug) || (activeCategory?.id && cat.id === activeCategory.id);
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
        {activeItems.map((item, index) => (
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
        ))}
      </div>
    </div>
  );
};

export default TravelGuideSection;
