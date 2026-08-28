import React from 'react';
import { useHotelTypes } from '../../../../lib/hooks/useHotelTypes';
import type { PlanningState } from '../StartPlanningPage';

interface Step5Props {
  state: PlanningState;
  updateState: (updates: Partial<PlanningState>) => void;
  onNext: () => void;
}

const Step5Accommodation: React.FC<Step5Props> = ({ state, updateState, onNext }) => {
  const { data: hotelTypes, isLoading } = useHotelTypes();

  const handleSelect = (id: number | 'not-sure') => {
    updateState({ accommodation: id });
    onNext();
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500">Loading accommodation styles...</div>;
  }

  // Map backend IDs to generic styles if we don't have images for them, or just use hardcoded ones for visual appeal if backend is sparse
  // We'll use the backend data if available, but inject fallback images
  const getStyleImage = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('classic') || lowerName.includes('budget') || lowerName.includes('camp')) {
      return '/home-heros/hero5.jpeg';
    }
    if (lowerName.includes('luxury') || lowerName.includes('premium')) {
      return '/home-heros/hero4.jpeg';
    }
    // Mid-range / default
    return '/home-heros/hero4.jpeg';
  };

  const getStyleDescription = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('classic') || lowerName.includes('budget')) return 'Simple and rustic but always comfortable';
    if (lowerName.includes('mid') || lowerName.includes('standard')) return 'The full works for a taste of the good life';
    if (lowerName.includes('luxury') || lowerName.includes('premium')) return "You won't want to go home";
    return 'A great place to rest your head';
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-12">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-center text-gray-900 mb-16">
        What is your preferred accommodation style?
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {hotelTypes?.map((type) => (
          <button
            key={type.id}
            onClick={() => handleSelect(type.id)}
            className={`group relative h-48 md:h-64 rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary ${
              state.accommodation === type.id ? 'ring-4 ring-primary' : ''
            }`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${getStyleImage(type.name)})` }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <h3 className="text-white text-xl md:text-2xl font-bold tracking-wide drop-shadow-md">
                {type.name}
              </h3>
            </div>
          </button>
        ))}

        {/* Not Sure Button */}
        <button
          onClick={() => handleSelect('not-sure')}
          className={`group relative h-48 md:h-64 rounded-xl overflow-hidden bg-[#EBE9E1] hover:bg-[#E0DED4] transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-primary ${
            state.accommodation === 'not-sure' ? 'ring-4 ring-primary' : ''
          }`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <h3 className="text-gray-900 text-xl md:text-2xl font-bold tracking-wide mb-2">
              Not sure
            </h3>
            <span className="text-gray-500 text-sm">Skip</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Step5Accommodation;
