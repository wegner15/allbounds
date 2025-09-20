import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ range, setRange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  let footer = <p className="text-sm text-gray-300 p-2">Please pick the first day.</p>;
  if (range?.from) {
    if (!range.to) {
      footer = <p className="text-sm text-gray-300 p-2">{format(range.from, 'PPP')}</p>;
    } else if (range.to) {
      footer = (
        <p className="text-sm text-gray-300 p-2">
          {format(range.from, 'PPP')}–{format(range.to, 'PPP')}
        </p>
      );
    }
  }

  const displayValue = range?.from
    ? range.to
      ? `${format(range.from, 'LLL dd, y')} - ${format(range.to, 'LLL dd, y')}`
      : format(range.from, 'LLL dd, y')
    : 'Select dates';

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        className="flex items-center border-b border-white/30 py-1 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="w-4 h-4 mr-2 text-gray-200" />
        <div className={`w-full bg-transparent focus:outline-none ${range?.from ? 'text-white' : 'text-gray-300'}`}>
          {displayValue}
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-2 bg-gray-800/80 backdrop-blur-lg rounded-lg border border-white/30 shadow-2xl">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            footer={footer}
            className="bg-gray-800 text-white"
            classNames={{
              day_selected: 'bg-blue-600 text-white',
              day_range_middle: 'bg-blue-600/50 text-white',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
