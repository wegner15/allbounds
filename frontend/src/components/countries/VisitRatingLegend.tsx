import React from 'react';
import type { VisitRating } from '../../lib/types/country';

const VisitRatingLegend: React.FC = () => {
  const ratings: { rating: VisitRating; color: string; description: string }[] = [
    { rating: 'excellent', color: '#91b5a9', description: 'Ideal conditions, perfect time to visit' },
    { rating: 'good', color: '#abad98', description: 'Good conditions, recommended time to visit' },
    { rating: 'fair', color: '#eeca80', description: 'Average conditions, can be considered' },
    { rating: 'poor', color: '#9d683c', description: 'Less favorable conditions' },
    { rating: 'discouraged', color: '#ef4444', description: 'Not recommended, unfavorable conditions' },
  ];

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-lg font-medium mb-3">Rating Legend</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {ratings.map(({ rating, color, description }) => (
          <div key={rating} className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: color }}
            ></div>
            <div>
              <span className="font-medium capitalize">{rating}</span>
              <p className="text-xs text-gray-600">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisitRatingLegend;
