import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { format } from 'date-fns';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  variant?: 'dark' | 'light';
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ range, setRange, variant = 'dark' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

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

  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
  }, [isOpen]);

  const isDark = variant === 'dark';

  let footer = <p className={`text-sm p-2 ${isDark ? 'text-gray-300' : 'text-charcoal/70'}`}>Please pick the first day.</p>;
  if (range?.from) {
    if (!range.to) {
      footer = <p className={`text-sm p-2 ${isDark ? 'text-gray-300' : 'text-charcoal/70'}`}>{format(range.from, 'PPP')}</p>;
    } else if (range.to) {
      footer = (
        <p className={`text-sm p-2 ${isDark ? 'text-gray-300' : 'text-charcoal/70'}`}>
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

  const pickerContent = isOpen ? (
    <div 
      className="fixed z-[9999] bg-white rounded-lg border-2 border-teal/30 shadow-2xl"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        footer={footer}
        className="bg-white text-charcoal"
        classNames={{
          day_selected: 'bg-teal text-white hover:bg-teal/90',
          day_range_middle: 'bg-teal/30 text-charcoal',
          day_today: 'font-bold text-teal',
        }}
      />
    </div>
  ) : null;

  return (
    <>
      <div className="relative" ref={wrapperRef}>
        <div 
          className={`flex items-center cursor-pointer ${
            isDark 
              ? 'border-b border-white/30 py-1' 
              : 'px-4 py-3 border-2 border-teal/30 rounded-lg hover:border-teal transition-colors bg-white'
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Calendar className={`w-4 h-4 mr-2 ${isDark ? 'text-gray-200' : 'text-charcoal'}`} />
          <div className={`w-full bg-transparent focus:outline-none ${
            range?.from 
              ? (isDark ? 'text-white' : 'text-charcoal') 
              : (isDark ? 'text-gray-300' : 'text-charcoal/50')
          }`}>
            {displayValue}
          </div>
        </div>
      </div>
      {pickerContent && ReactDOM.createPortal(pickerContent, document.body)}
    </>
  );
};

export default DateRangePicker;
