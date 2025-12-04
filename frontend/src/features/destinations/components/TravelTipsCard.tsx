import React from 'react';
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface TravelTip {
  icon: React.ReactNode;
  text: string;
}

interface TravelTipsCardProps {
  countryName: string;
}

const TravelTipsCard: React.FC<TravelTipsCardProps> = React.memo(({ countryName }) => {
  const defaultTips: TravelTip[] = [
    {
      icon: <DocumentTextIcon className="w-5 h-5 text-primary-600" />,
      text: 'Check visa requirements before booking',
    },
    {
      icon: <ShieldCheckIcon className="w-5 h-5 text-primary-600" />,
      text: 'Review recommended vaccinations',
    },
    {
      icon: <DevicePhoneMobileIcon className="w-5 h-5 text-primary-600" />,
      text: 'Consider getting a local SIM card',
    },
    {
      icon: <CalendarIcon className="w-5 h-5 text-primary-600" />,
      text: 'Plan your visit during the best season',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Travel Tips for {countryName}
      </h3>
      
      <div className="space-y-3">
        {defaultTips.map((tip, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex-shrink-0 mt-0.5">
              {tip.icon}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {tip.text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Always check official government travel advisories before your trip
        </p>
      </div>
    </div>
  );
});

TravelTipsCard.displayName = 'TravelTipsCard';

export default TravelTipsCard;
