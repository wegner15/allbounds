import React from 'react';
import { Compass } from 'lucide-react';
import ActivityCard from './ActivityCard';
import type { Activity } from '../../../lib/types/api';

interface ActivitiesSectionProps {
  activities: Activity[];
  countryName: string;
}

const ActivitiesSection: React.FC<ActivitiesSectionProps> = React.memo(({ 
  activities,
  countryName 
}) => {
  // Filter featured and active activities, limit to 6
  const featuredActivities = activities
    .filter(activity => activity.is_active && activity.is_featured)
    .slice(0, 6);

  // Don't render if no featured activities
  if (featuredActivities.length === 0) {
    return null;
  }

  return (
    <section 
      className="bg-white rounded-lg shadow-sm p-6 md:p-8"
      aria-labelledby="activities-section-title"
    >
      {/* Section Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-teal-100 rounded-lg">
          <Compass className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h2 
            id="activities-section-title"
            className="text-2xl md:text-3xl font-playfair font-bold text-gray-900"
          >
            Featured Activities
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Exciting experiences in {countryName}
          </p>
        </div>
      </div>

      {/* Activities Grid - Responsive: 3 columns desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredActivities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>

      {/* Activity Count Info */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600 text-center">
          Showing {featuredActivities.length} featured {featuredActivities.length === 1 ? 'activity' : 'activities'}
        </p>
      </div>
    </section>
  );
});

ActivitiesSection.displayName = 'ActivitiesSection';

export default ActivitiesSection;
