import React, { useState } from 'react';
import { useHolidayTypes } from '../../../../lib/hooks/useHolidayTypes';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';
import ErrorModal from '../../../../components/ui/ErrorModal';
import type { PlanningState } from '../StartPlanningPage';

interface Step4Props {
  state: PlanningState;
  updateState: (updates: Partial<PlanningState>) => void;
  onNext: () => void;
}

const Step4Experience: React.FC<Step4Props> = ({ state, updateState, onNext }) => {
  const { data: holidayTypes, isLoading } = useHolidayTypes();
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleExperience = (id: number) => {
    const current = [...state.experiences];
    const index = current.indexOf(id);
    if (index === -1) {
      current.push(id);
    } else {
      current.splice(index, 1);
    }
    updateState({ experiences: current, experiencesNotSure: false });
  };

  const handleNotSure = () => {
    updateState({ experiences: [], experiencesNotSure: true });
    onNext();
  };

  const handleNext = () => {
    if (state.experiences.length === 0 && !state.experiencesNotSure) {
      setValidationError("Please select at least one experience or choose 'Not sure'");
      return;
    }
    onNext();
  };

  if (isLoading) {
    return <div className="text-center py-20 text-gray-500">Loading experiences...</div>;
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-12">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-center text-gray-900 mb-4">
        What would you like to experience?
      </h1>
      <p className="text-center font-bold text-gray-900 mb-8">
        Choose as many as you like
      </p>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={handleNotSure}
          className={`px-6 py-3 font-bold tracking-widest uppercase rounded transition-colors ${
            state.experiencesNotSure 
              ? 'bg-[#E0DED4] text-gray-900' 
              : 'bg-[#EBE9E1] text-gray-900 hover:bg-[#E0DED4]'
          }`}
        >
          Not sure
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-primary text-white font-bold tracking-widest uppercase rounded flex items-center hover:bg-primary-dark transition-colors"
        >
          Next <span className="ml-2">→</span>
        </button>
      </div>

      {/* Experiences Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {holidayTypes?.map((type) => {
          const isSelected = state.experiences.includes(type.id);
          
          return (
            <button
              key={type.id}
              onClick={() => toggleExperience(type.id)}
              className={`group relative h-24 md:h-32 rounded-xl overflow-hidden transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-primary ${
                isSelected ? 'ring-4 ring-primary scale-105 shadow-xl' : 'hover:-translate-y-1 hover:shadow-lg'
              }`}
            >
              {/* Background Image */}
              <div 
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
                style={{ 
                  backgroundImage: `url(${getImageUrlWithFallback(type.image_id, IMAGE_VARIANTS.MEDIUM)})` 
                }}
              />
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 transition-colors duration-300 ${isSelected ? 'bg-black/60' : 'bg-black/40 group-hover:bg-black/30'}`} />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                <h3 className={`text-sm md:text-base font-bold tracking-wide drop-shadow-md transition-colors ${isSelected ? 'text-primary' : 'text-white'}`}>
                  {type.name}
                </h3>
              </div>
            </button>
          );
        })}
      </div>

      <ErrorModal
        isOpen={!!validationError}
        onClose={() => setValidationError(null)}
        title="Selection Required"
        message={validationError || ''}
      />
    </div>
  );
};

export default Step4Experience;
