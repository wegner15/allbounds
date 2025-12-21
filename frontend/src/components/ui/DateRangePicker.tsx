import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { format } from 'date-fns';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  variant?: 'dark' | 'light' | 'transparent';
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ range, setRange, variant = 'dark', className = '' }) => {
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
  const isTransparent = variant === 'transparent';

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
      ? `${format(range.from, 'MMM dd')} - ${format(range.to, 'MMM dd')}`
      : format(range.from, 'MMM dd')
    : 'Add dates';

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
        defaultMonth={new Date()}
        selected={range}
        onSelect={(newRange) => {
          // If user deselects or something weird happens, handle it
          setRange(newRange);
        }}
        footer={footer}
        className="bg-white text-charcoal"
        classNames={{
          day_selected: 'bg-teal text-white hover:bg-teal/90',
          day_range_middle: 'bg-teal/30 text-charcoal',
          day_today: 'font-bold text-teal',
        }}
        fromDate={new Date()}
      />
    </div>
  ) : null;

  return (
    <>
      <div className={`relative ${className} h-full`} ref={wrapperRef}>
        <div
          className={`flex items-center cursor-pointer h-full transition-colors ${isDark
            ? 'border-b border-white/30 py-1'
            : isTransparent
              ? 'bg-transparent'
              : 'px-4 py-3 border border-gray-200 rounded-lg hover:border-teal bg-white'
            }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Calendar className={`w-5 h-5 mr-3 flex-shrink-0 ${isDark ? 'text-gray-200' : 'text-teal'}`} />

          <div className="flex flex-col items-start overflow-hidden">

            <div className={`text-base font-bold truncate w-full text-left ${range?.from
              ? (isDark ? 'text-white' : 'text-charcoal')
              : (isDark ? 'text-gray-300' : 'text-gray-400')
              }`}>
              {displayValue}
            </div>
          </div>
        </div>
      </div>
      {pickerContent && ReactDOM.createPortal(pickerContent, document.body)}
    </>
  );
};

export default DateRangePicker;
