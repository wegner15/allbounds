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
    <div className="bg-gradient-to-br from-[#f0f6f4] via-[#f7faf9] to-[#edf4f1] rounded-2xl border border-[#d8e7e1] shadow-xs p-6">
      <h3 className="text-lg font-bold font-playfair text-charcoal mb-4">
        Travel Tips for {countryName}
      </h3>
      
      <div className="space-y-3">
        {defaultTips.map((tip, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-white/80 shadow-2xs hover:bg-white transition-colors duration-200"
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

      <div className="mt-6 pt-5 border-t border-[#d8e7e1]">
        <p className="text-xs text-gray-500 text-center">
          Always check official government travel advisories before your trip
        </p>
      </div>
    </div>
  );
});

TravelTipsCard.displayName = 'TravelTipsCard';

export default TravelTipsCard;
