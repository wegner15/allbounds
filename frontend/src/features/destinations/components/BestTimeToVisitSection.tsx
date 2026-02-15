import React from 'react';
import type { CountryVisitInfo } from '../../../lib/types/api';

interface BestTimeToVisitSectionProps {
  visitInfo?: CountryVisitInfo;
}

// Month names for display
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Rating color mapping
const getRatingColor = (rating: string): string => {
  switch (rating) {
    case 'excellent':
      return 'bg-green-500 hover:bg-green-600 text-white';
    case 'good':
      return 'bg-primary hover:bg-primary-dark text-white';
    case 'fair':
      return 'bg-yellow-400 hover:bg-yellow-500 text-gray-900';
    case 'poor':
      return 'bg-gray-400 hover:bg-gray-500 text-white';
    case 'discouraged':
      return 'bg-red-500 hover:bg-red-600 text-white';
    default:
      return 'bg-gray-200 hover:bg-gray-300 text-gray-600';
  }
};

// Rating legend data
const RATING_LEGEND = [
  { rating: 'excellent', color: 'bg-green-500', label: 'Excellent', description: 'Perfect time to visit' },
  { rating: 'good', color: 'bg-primary', label: 'Good', description: 'Great conditions' },
  { rating: 'fair', color: 'bg-yellow-400', label: 'Fair', description: 'Acceptable conditions' },
  { rating: 'poor', color: 'bg-gray-400', label: 'Poor', description: 'Less favorable' },
];

const BestTimeToVisitSection: React.FC<BestTimeToVisitSectionProps> = React.memo(({ visitInfo }) => {
  // Don't render if no visit info is available
  if (!visitInfo || !visitInfo.monthly_ratings || visitInfo.monthly_ratings.length === 0) {
    return null;
  }

  // Create a map of ratings by month for easier lookup
  const ratingsByMonth = visitInfo.monthly_ratings.reduce((acc, item) => {
    acc[item.month] = item;
    return acc;
  }, {} as Record<string, typeof visitInfo.monthly_ratings[0]>);

  return (
    <section className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl lg:text-3xl font-playfair font-bold text-gray-900 mb-2">
          Best Time to Visit
        </h2>
        <p className="text-gray-600">
          Plan your trip during the ideal season for the best experience
        </p>
      </div>

      {/* Monthly Ratings Grid - 3x4 layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {MONTH_NAMES.map((month) => {
          const monthData = ratingsByMonth[month];
          const rating = monthData?.rating || 'unknown';
          const notes = monthData?.notes;

          return (
            <div
              key={month}
              className={`
                relative rounded-lg p-4 text-center transition-all duration-200 cursor-default
                ${getRatingColor(rating)}
                group
              `}
            >
              {/* Month name */}
              <div className="text-sm font-semibold mb-1">
                {month.substring(0, 3)}
              </div>

              {/* Rating label */}
              <div className="text-xs capitalize opacity-90">
                {rating === 'unknown' ? 'N/A' : rating}
              </div>

              {/* Tooltip for month-specific notes */}
              {notes && (
                <div className="
                  absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3
                  scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 ease-out origin-bottom
                  pointer-events-none group-hover:pointer-events-auto
                  bg-white text-gray-900 text-sm rounded-xl p-4
                  w-96 z-50
                  shadow-xl border border-gray-100
                ">
                  <div className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-2 flex items-center justify-between">
                    <span>{month}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${rating === 'excellent' ? 'bg-green-100 text-green-800' :
                      rating === 'good' ? 'bg-primary/10 text-primary' :
                        rating === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                          rating === 'poor' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                      }`}>
                      {rating}
                    </span>
                  </div>
                  <div
                    className="text-left py-1 text-gray-600 leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0"
                    dangerouslySetInnerHTML={{ __html: notes }}
                  />
                  {/* Arrow */}
                  <div className="
                    absolute top-full left-1/2 transform -translate-x-1/2
                    border-8 border-transparent border-t-white
                    drop-shadow-sm
                  "></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rating Legend */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Rating Guide</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {RATING_LEGEND.map(({ rating, color, label, description }) => (
            <div key={rating} className="flex items-start space-x-2">
              <div className={`w-4 h-4 rounded ${color} flex-shrink-0 mt-0.5`}></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{label}</div>
                <div className="text-xs text-gray-600">{description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* General Notes */}
      {visitInfo.general_notes && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Travel Tips
          </h3>
          <div
            className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: visitInfo.general_notes }}
          />
        </div>
      )}
    </section>
  );
});

BestTimeToVisitSection.displayName = 'BestTimeToVisitSection';

export default BestTimeToVisitSection;
