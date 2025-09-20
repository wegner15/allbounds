import React from 'react';
import type { MonthlyVisitRating as MonthlyVisitRatingType, VisitRating } from '../../lib/types/country';

interface MonthlyVisitRatingProps {
  ratings: MonthlyVisitRatingType[];
}

const MonthlyVisitRating: React.FC<MonthlyVisitRatingProps> = ({ ratings }) => {
  // All months in order
  const allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Create a map of ratings by month for easier lookup
  const ratingsByMonth = ratings.reduce((acc, { month, rating }) => {
    acc[month] = rating;
    return acc;
  }, {} as Record<string, VisitRating>);

  // Get color and text based on rating
  const getRatingStyle = (rating: VisitRating | undefined) => {
    switch (rating) {
      case 'excellent':
        return 'bg-green-500 text-white';
      case 'good':
        return 'bg-blue-500 text-white';
      case 'fair':
        return 'bg-yellow-500 text-gray-800';
      case 'poor':
        return 'bg-orange-500 text-white';
      case 'discouraged':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-medium mb-4">Best Time to Visit</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {allMonths.map(month => {
          const rating = ratingsByMonth[month];
          return (
            <div 
              key={month} 
              className={`rounded-lg p-3 text-center ${getRatingStyle(rating)}`}
              title={rating ? `${month}: ${rating}` : `${month}: No data`}
            >
              <div className="text-sm font-medium">{month.substring(0, 3)}</div>
              <div className="text-xs mt-1 capitalize">{rating || 'No data'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyVisitRating;
