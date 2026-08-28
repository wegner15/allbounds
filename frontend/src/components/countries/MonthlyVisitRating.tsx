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

  // Get color based on rating
  const getRatingStyle = (rating: VisitRating | undefined) => {
    switch (rating) {
      case 'excellent':
        return { backgroundColor: '#91b5a9', color: '#ffffff' };
      case 'good':
        return { backgroundColor: '#abad98', color: '#ffffff' };
      case 'fair':
        return { backgroundColor: '#eeca80', color: '#ffffff' };
      case 'poor':
        return { backgroundColor: '#9d683c', color: '#ffffff' };
      case 'discouraged':
        return { backgroundColor: '#ef4444', color: '#ffffff' }; // Keeping red for discouraged
      default:
        return { backgroundColor: '#e5e7eb', color: '#4b5563' }; // gray-200 and gray-600
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-medium mb-4">Best Time to Visit</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {allMonths.map(month => {
          const rating = ratingsByMonth[month];
          const style = getRatingStyle(rating);
          return (
            <div
              key={month}
              className="rounded-lg p-2.5 text-center flex items-center justify-center shadow-xs"
              style={style}
              title={rating ? `${month}: ${rating}` : `${month}: No data`}
            >
              <div className="text-sm font-semibold">{month.substring(0, 3)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyVisitRating;
