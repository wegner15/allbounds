import React from 'react';
import { useRegions } from '../../../../lib/hooks/useDestinations';
import type { PlanningState } from '../StartPlanningPage';

interface Step1Props {
  state: PlanningState;
  updateState: (updates: Partial<PlanningState>) => void;
  onNext: () => void;
}

const Step1Region: React.FC<Step1Props> = ({ state, updateState, onNext }) => {
  const { data: regions, isLoading } = useRegions();

  const handleSelect = (id: number | 'not-sure') => {
    updateState({ regionId: id, countryId: null }); // Reset country if region changes
    onNext();
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500">Loading destinations...</div>;
  }

  // Add standard images for common regions if backend doesn't provide them
  const getRegionImage = (regionName: string) => {
    const lowerName = regionName.toLowerCase();
    if (lowerName.includes('africa')) return 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=800'; // Lion
    if (lowerName.includes('asia')) return 'https://images.unsplash.com/photo-1464817739973-0128fe77aaa1?auto=format&fit=crop&q=80&w=800'; // Tiger's Nest/Asia
    if (lowerName.includes('latin america') || lowerName.includes('south america')) return 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=80&w=800'; // Machu Picchu / Andes
    if (lowerName.includes('europe')) return 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=800'; // Paris/Europe
    if (lowerName.includes('antarctica')) return 'https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?auto=format&fit=crop&q=80&w=800'; // Ice
    return 'https://images.unsplash.com/photo-1488646953014-c8cb4b524d55?auto=format&fit=crop&q=80&w=800'; // Default landscape
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-center text-gray-900 mb-12">
        Do you know where you want to go?
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {regions?.map((region) => (
          <button
            key={region.id}
            onClick={() => handleSelect(region.id)}
            className={`group relative h-48 md:h-56 rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary ${
              state.regionId === region.id ? 'ring-4 ring-primary' : ''
            }`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${getRegionImage(region.name)})` }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <h3 className="text-white text-xl md:text-2xl font-bold tracking-wide drop-shadow-md">
                {region.name}
              </h3>
            </div>
          </button>
        ))}

        {/* Not Sure Button */}
        <button
          onClick={() => handleSelect('not-sure')}
          className={`group relative h-48 md:h-56 rounded-xl overflow-hidden bg-[#EBE9E1] hover:bg-[#E0DED4] transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-primary ${
            state.regionId === 'not-sure' ? 'ring-4 ring-primary' : ''
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

export default Step1Region;
