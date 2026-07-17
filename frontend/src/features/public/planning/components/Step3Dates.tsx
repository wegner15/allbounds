import React, { useRef } from 'react';
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

  const monthRef = useRef<HTMLDivElement>(null);
  const durationRef = useRef<HTMLDivElement>(null);
  const nextBtnRef = useRef<HTMLDivElement>(null);

  const handleYearSelect = (year: string) => {
    updateState({ year });
    setTimeout(() => {
      monthRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const handleMonthSelect = (month: string) => {
    updateState({ month });
    setTimeout(() => {
      durationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

  const handleDurationSelect = (duration: string) => {
    updateState({ duration });
    setTimeout(() => {
      nextBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  };

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
                onClick={() => handleYearSelect(year)}
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
          <div ref={monthRef} className="scroll-mt-8">
            <h3 className="text-center font-bold text-gray-900 mb-6">Do you know which month?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {months.map(month => (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(month)}
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
                onClick={() => handleMonthSelect('any')}
                className={`py-3 text-sm font-bold rounded-lg border-2 transition-all ${
                  state.month === 'any' 
                    ? 'border-gray-900 bg-gray-900 text-white' 
                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                }`}
              >
                Any month
              </button>
              <button
                onClick={() => handleMonthSelect('not-sure')}
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
          <div ref={durationRef} className="max-w-4xl mx-auto scroll-mt-8">
            <h3 className="text-center font-bold text-gray-900 mb-6">How long do you want to travel for?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { value: '1-3 days', label: '1-3 days', sub: 'Weekend escape' },
                { value: '4-7 days', label: '4-7 days', sub: 'Short break' },
                { value: '8-14 days', label: '8-14 days', sub: 'Classic holiday' },
                { value: '15-21 days', label: '15-21 days', sub: 'Extended trip' },
                { value: '3+ weeks', label: '3+ weeks', sub: 'Epic journey' },
                { value: 'Not sure', label: 'Not sure yet', sub: 'Decide later' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleDurationSelect(opt.value)}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-300 ${
                    state.duration === opt.value
                      ? 'border-gray-900 bg-gray-900 text-white shadow-lg transform scale-[1.02]'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400 hover:shadow-md hover:-translate-y-1'
                  }`}
                >
                  <span className="text-lg font-bold mb-1">{opt.label}</span>
                  <span className={`text-sm ${state.duration === opt.value ? 'text-gray-300' : 'text-gray-500'}`}>
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
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
      <div ref={nextBtnRef} className="mt-12 flex justify-center scroll-mt-8">
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
