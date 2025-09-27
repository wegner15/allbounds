import React from 'react';
import { useStats } from '../../../../lib/hooks/useStats';

const StatsSection: React.FC = () => {
  const { data: stats, isLoading, error } = useStats();

  const statItems = [
    {
      label: 'Group Trips',
      value: stats?.group_trips || 0,
      icon: (
        <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: 'Activities',
      value: stats?.activities || 0,
      icon: (
        <svg className="w-8 h-8 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: 'Hotels',
      value: stats?.hotels || 0,
      icon: (
        <svg className="w-8 h-8 text-butter" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: 'Attractions',
      value: stats?.attractions || 0,
      icon: (
        <svg className="w-8 h-8 text-sand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  if (error) {
    return null; // Don't show stats if there's an error
  }

  return (
    <div className="py-16 bg-paper">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-h2 font-playfair font-bold text-charcoal mb-4">Our Platform at a Glance</h2>
          <p className="text-body font-lato text-charcoal/70 max-w-2xl mx-auto">
            Discover the breadth of experiences and destinations we offer across our platform
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statItems.map((item, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                {item.icon}
              </div>
              <div className="text-3xl font-playfair font-bold text-charcoal mb-2">
                {isLoading ? (
                  <div className="h-8 bg-charcoal/10 rounded animate-pulse"></div>
                ) : (
                  item.value.toLocaleString()
                )}
              </div>
              <div className="text-charcoal/70 font-lato font-medium">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;