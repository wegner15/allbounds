import React from 'react';
import MonthlyVisitRating from './MonthlyVisitRating';
import VisitRatingLegend from './VisitRatingLegend';
import type { CountryVisitInfo as CountryVisitInfoType } from '../../lib/types/country';

interface CountryVisitInfoProps {
  visitInfo?: CountryVisitInfoType;
}

const CountryVisitInfo: React.FC<CountryVisitInfoProps> = ({ visitInfo }) => {
  // If no visit info is provided, show a placeholder
  if (!visitInfo || !visitInfo.monthly_ratings || visitInfo.monthly_ratings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-2xl font-playfair text-charcoal mb-4">Best Time to Visit</h2>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-600 mb-2">Information about the best time to visit is not available yet.</p>
          <p className="text-sm text-gray-500">Our travel experts are working on gathering this information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <MonthlyVisitRating ratings={visitInfo.monthly_ratings} />
      <VisitRatingLegend />
      
      {visitInfo.general_notes && (
        <div className="mt-4">
          <h4 className="text-lg font-medium mb-2">Additional Information</h4>
          <p className="text-gray-700">{visitInfo.general_notes}</p>
        </div>
      )}
    </div>
  );
};

export default CountryVisitInfo;
