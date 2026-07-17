import React from 'react';
import { useCountries } from '../../../../lib/hooks/useDestinations';
import { getImageUrlWithFallback } from '../../../../lib/utils/imageUtils';
import { IMAGE_VARIANTS } from '../../../../lib/constants';
import { PlanningState } from '../StartPlanningPage';

interface Step2Props {
  state: PlanningState;
  updateState: (updates: Partial<PlanningState>) => void;
  onNext: () => void;
}

const Step2Country: React.FC<Step2Props> = ({ state, updateState, onNext }) => {
  const { data: allCountries, isLoading } = useCountries();

  // Filter countries by region if a region was selected
  const countries = React.useMemo(() => {
    if (!allCountries) return [];
    if (typeof state.regionId === 'number') {
      return allCountries.filter(c => c.region_id === state.regionId);
    }
    return allCountries;
  }, [allCountries, state.regionId]);

  const handleSelect = (id: number | 'not-sure') => {
    updateState({ countryId: id });
    onNext();
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500">Loading countries...</div>;
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-center text-gray-900 mb-12">
        Do you know which country?
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {countries.map((country) => (
          <button
            key={country.id}
            onClick={() => handleSelect(country.id)}
            className={`group relative h-28 md:h-36 rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#F3E24A] ${
              state.countryId === country.id ? 'ring-4 ring-[#F3E24A]' : ''
            }`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ 
                backgroundImage: `url(${getImageUrlWithFallback(country.image_id, IMAGE_VARIANTS.MEDIUM)})` 
              }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
              <h3 className="text-white text-sm md:text-base font-bold tracking-wide drop-shadow-md">
                {country.name}
              </h3>
            </div>
          </button>
        ))}

        {/* Not Sure Button */}
        <button
          onClick={() => handleSelect('not-sure')}
          className={`group relative h-28 md:h-36 rounded-xl overflow-hidden bg-[#EBE9E1] hover:bg-[#E0DED4] transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#F3E24A] ${
            state.countryId === 'not-sure' ? 'ring-4 ring-[#F3E24A]' : ''
          }`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
            <h3 className="text-gray-900 text-sm md:text-base font-bold tracking-wide mb-1">
              Not sure
            </h3>
            <span className="text-gray-500 text-xs">Skip</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Step2Country;
