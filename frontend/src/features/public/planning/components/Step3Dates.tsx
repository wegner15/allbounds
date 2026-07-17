import React from 'react';
import type { PlanningState } from '../StartPlanningPage';

interface Step3Props {
  state: PlanningState;
  updateState: (updates: Partial<PlanningState>) => void;
  onNext: () => void;
}

const Step3Dates: React.FC<Step3Props> = ({ state, updateState, onNext }) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear.toString(), (currentYear + 1).toString(), (currentYear + 2).toString(), (currentYear + 3).toString()];
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleNext = () => {
    // Basic validation
    if (state.dateType === 'idea') {
      if (!state.year) {
        alert("Please select a year");
        return;
      }
      if (!state.month) {
        alert("Please select a month or 'Not sure'");
        return;
      }
      if (!state.duration) {
        alert("Please select a duration");
        return;
      }
    }
    onNext();
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto pb-12">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair text-center text-gray-900 mb-8">
        When would you like to travel?
      </h1>

      {/* Date Type Toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => updateState({ dateType: 'idea' })}
            className={`px-6 py-3 text-xs font-bold tracking-widest uppercase border border-gray-900 rounded-l-md transition-colors ${
              state.dateType === 'idea' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-900 hover:bg-gray-50'
            }`}
          >
            I have an idea
          </button>
          <button
            type="button"
            onClick={() => updateState({ dateType: 'exact' })}
            className={`px-6 py-3 text-xs font-bold tracking-widest uppercase border border-gray-900 border-l-0 rounded-r-md transition-colors ${
              state.dateType === 'exact' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-900 hover:bg-gray-50'
            }`}
          >
            I have exact dates
          </button>
        </div>
      </div>

      {state.dateType === 'idea' ? (
        <div className="space-y-10 animate-fade-in">
          {/* Year Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {years.map(year => (
              <button
                key={year}
                onClick={() => updateState({ year })}
                className={`py-8 text-xl font-bold rounded-xl border-2 transition-all ${
                  state.year === year 
                    ? 'border-gray-900 bg-gray-900 text-white shadow-lg' 
                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Month Selection */}
          <div>
            <h3 className="text-center font-bold text-gray-900 mb-6">Do you know which month?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {months.map(month => (
                <button
                  key={month}
                  onClick={() => updateState({ month })}
                  className={`py-3 text-sm font-bold rounded-lg border-2 transition-all ${
                    state.month === month 
                      ? 'border-gray-900 bg-gray-900 text-white' 
                      : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                  }`}
                >
                  {month}
                </button>
              ))}
              <button
                onClick={() => updateState({ month: 'any' })}
                className={`py-3 text-sm font-bold rounded-lg border-2 transition-all ${
                  state.month === 'any' 
                    ? 'border-gray-900 bg-gray-900 text-white' 
                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                }`}
              >
                Any month
              </button>
              <button
                onClick={() => updateState({ month: 'not-sure' })}
                className={`py-3 text-sm font-bold rounded-lg border-2 transition-all ${
                  state.month === 'not-sure' 
                    ? 'border-gray-900 bg-[#EBE9E1] text-gray-900' 
                    : 'border-transparent bg-[#EBE9E1] text-gray-900 hover:bg-[#E0DED4]'
                }`}
              >
                Not sure
              </button>
            </div>
          </div>

          {/* Duration Selection */}
          <div className="max-w-md mx-auto">
            <h3 className="text-center font-bold text-gray-900 mb-6">How long do you want to travel for?</h3>
            <select
              value={state.duration || ''}
              onChange={(e) => updateState({ duration: e.target.value })}
              className="w-full p-4 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none text-center cursor-pointer font-medium"
            >
              <option value="" disabled>Select duration...</option>
              <option value="1-3 days">1-3 days (Weekend escape)</option>
              <option value="4-7 days">4-7 days (Short break)</option>
              <option value="8-14 days">8-14 days (Classic holiday)</option>
              <option value="15-21 days">15-21 days (Extended trip)</option>
              <option value="3+ weeks">3+ weeks (Epic journey)</option>
              <option value="Not sure">Not sure yet</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 animate-fade-in">
          <p className="text-gray-500 mb-4">Please provide your exact dates below.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <input 
              type="date" 
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900"
              onChange={(e) => updateState({ year: e.target.value.split('-')[0], month: e.target.value.split('-')[1] })} 
            />
            <span className="text-gray-400">to</span>
            <input 
              type="date" 
              className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900"
              onChange={(e) => {
                if (e.target.value) updateState({ duration: 'exact' })
              }}
            />
          </div>
        </div>
      )}

      {/* Next Button */}
      <div className="mt-12 flex justify-center">
        <button
          onClick={handleNext}
          className="px-12 py-4 bg-primary text-white font-bold tracking-widest uppercase rounded flex items-center hover:bg-primary-dark transition-colors"
        >
          Next <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
};

export default Step3Dates;
