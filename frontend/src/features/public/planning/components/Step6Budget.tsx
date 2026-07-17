import React from 'react';
import type { PlanningState } from '../StartPlanningPage';

interface Step6Props {
  state: PlanningState;
  updateState: (updates: Partial<PlanningState>) => void;
  onNext: () => void;
}

const Step6Budget: React.FC<Step6Props> = ({ state, updateState, onNext }) => {
  const minBudget = 5000;
  const maxBudget = 50000;
  
  // Format currency
  const formatCurrency = (value: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(value) + (value >= maxBudget ? '+' : '');
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ budget: parseInt(e.target.value, 10) });
  };

  const handleNotSure = () => {
    updateState({ budget: 'not-sure' });
    onNext();
  };

  const handleNext = () => {
    if (state.budget === null) {
      updateState({ budget: 10000 }); // Default if somehow null
    }
    onNext();
  };

  // Currencies list based on typical travel sites
  const currencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'ZAR'];

  return (
    <div className="animate-fade-in max-w-3xl mx-auto pb-12">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-center text-gray-900 mb-6">
        How much would you like to spend per person?
      </h1>
      <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
        The price below is price <span className="font-bold text-gray-900">per person</span> for your trip, including accommodation, activities and local travel but does not include international flights
      </p>

      {/* Currency Selector */}
      <div className="flex justify-center mb-16">
        <select
          value={state.currency}
          onChange={(e) => updateState({ currency: e.target.value })}
          className="px-6 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900 appearance-none font-medium cursor-pointer"
        >
          {currencies.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Range Slider */}
      <div className="px-4 mb-20 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <span className="text-2xl font-bold text-gray-900">
            {state.budget === 'not-sure' 
              ? formatCurrency(10000, state.currency) // Visual fallback
              : formatCurrency(state.budget as number || 10000, state.currency)
            }
          </span>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">per person</p>
        </div>
        
        <input
          type="range"
          min={minBudget}
          max={maxBudget}
          step={500}
          value={state.budget === 'not-sure' ? 10000 : (state.budget || 10000)}
          onChange={handleSliderChange}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary accent-primary"
          style={{
            background: `linear-gradient(to right, #8fbac0 0%, #8fbac0 ${(
              (( (state.budget === 'not-sure' ? 10000 : (state.budget || 10000)) - minBudget) / (maxBudget - minBudget)) * 100
            )}%, #e5e7eb ${(
              (( (state.budget === 'not-sure' ? 10000 : (state.budget || 10000)) - minBudget) / (maxBudget - minBudget)) * 100
            )}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between mt-3 text-sm text-gray-400 font-medium">
          <span>{formatCurrency(minBudget, state.currency)}</span>
          <span>{formatCurrency(maxBudget, state.currency)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleNotSure}
          className="px-6 py-4 bg-[#EBE9E1] text-gray-900 font-bold tracking-widest uppercase rounded hover:bg-[#E0DED4] transition-colors"
        >
          Not sure
        </button>
        <button
          onClick={handleNext}
          className="px-10 py-4 bg-primary text-white font-bold tracking-widest uppercase rounded flex items-center hover:bg-primary-dark transition-colors"
        >
          Next <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
};

export default Step6Budget;
