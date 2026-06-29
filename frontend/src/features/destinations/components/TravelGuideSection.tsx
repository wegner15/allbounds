import React, { useState } from 'react';
import { getTravelGuide } from '../data/travelGuidesData';
import type { CountryTravelGuide } from '../data/travelGuidesData';

interface TravelGuideSectionProps {
  countrySlug?: string;
  countryName: string;
}

type GuideCategory = keyof CountryTravelGuide;

const CATEGORIES: { id: GuideCategory; label: string; icon: string }[] = [
  { id: 'good-to-know', label: 'Good to Know', icon: 'ℹ️' },
  { id: 'things-to-do', label: 'Things to Do', icon: '🎯' },
  { id: 'going-out', label: 'Going Out', icon: '🌃' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'beaches', label: 'Beaches', icon: '🏖️' },
  { id: 'food-drink', label: 'Food & Drink', icon: '🍽️' },
  { id: 'sports', label: 'Sports & Adventure', icon: '🚴' },
  { id: 'events', label: 'Events & Festivals', icon: '🎉' },
];

const TravelGuideSection: React.FC<TravelGuideSectionProps> = ({ countrySlug, countryName }) => {
  const [activeTab, setActiveTab] = useState<GuideCategory>('good-to-know');
  const guideData = getTravelGuide(countrySlug);
  const activeItems = guideData[activeTab] || [];

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
        {CATEGORIES.map((cat) => {
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
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
                  0{index + 1}
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
