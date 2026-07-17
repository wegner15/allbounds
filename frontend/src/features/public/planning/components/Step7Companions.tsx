import React from 'react';
import { PlanningState } from '../StartPlanningPage';

interface Step7Props {
  state: PlanningState;
  updateState: (updates: Partial<PlanningState>) => void;
  onNext: () => void;
}

const Step7Companions: React.FC<Step7Props> = ({ state, updateState, onNext }) => {
  const options = [
    { id: 'solo', label: 'I am travelling solo' },
    { id: 'partner', label: 'With my partner' },
    { id: 'family', label: 'With my family' },
    { id: 'friends', label: 'With friends' },
  ];

  const handleSelect = (id: string) => {
    updateState({ companions: id });
    setTimeout(() => onNext(), 300); // Slight delay for visual feedback before auto-advancing
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-12">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-center text-gray-900 mb-16">
        Who will you be travelling with?
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`py-12 px-6 rounded-xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${
              state.companions === option.id 
                ? 'border-gray-900 bg-gray-900 text-white shadow-lg scale-105' 
                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400 hover:shadow-md'
            }`}
          >
            <h3 className="text-sm md:text-base font-bold text-center tracking-wide">
              {option.label}
            </h3>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Step7Companions;
