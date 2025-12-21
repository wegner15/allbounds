
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { format, startOfDay } from 'date-fns';
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

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        // Check if click is inside the portal content (which is not in wrapperRef)
        const portal = document.getElementById('date-picker-portal');
        if (portal && portal.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  // Update position when opening or scrolling
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
        });
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const isDark = variant === 'dark';
  const isTransparent = variant === 'transparent';

  const footer = (
    <div className="flex items-center justify-between p-3 border-t border-gray-100 mt-2">
      <div className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
        {!range?.from && "Select travel dates"}
        {range?.from && !range.to && "Select return date"}
        {range?.from && range.to && (
          <span className="text-teal font-bold">
            {Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))} nights
          </span>
        )}
      </div>

      {range?.from && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setRange(undefined);
          }}
          className="text-xs text-red-500 hover:text-red-700 font-semibold uppercase tracking-wide transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );

  const displayValue = range?.from
    ? range.to
      ? format(range.from, 'MMM dd') === format(range.to, 'MMM dd')
        ? format(range.from, 'MMM dd')
        : `${format(range.from, 'MMM dd')} - ${format(range.to, 'MMM dd')}`
      : format(range.from, 'MMM dd')
    : 'Add dates';

  const pickerContent = isOpen ? (
    <div
      id="date-picker-portal"
      className="fixed z-[9999] bg-white rounded-2xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-4 animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onClick={(e) => e.stopPropagation()} // Prevent bubbling to outside listeners if any
    >
      <style>{`
        .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #0d9488; --rdp-background-color: #ccfbf1; margin: 0; }
        .rdp-day_selected:not([disabled]) { background-color: var(--rdp-accent-color); color: white; font-weight: bold; }
        .rdp-day_range_middle { background-color: var(--rdp-background-color) !important; color: #115e59 !important; }
        .rdp-nav_button { color: #0d9488; }
        .rdp-caption_label { color: #1f2937; font-weight: 700; font-size: 1rem; }
        .rdp-head_cell { color: #9ca3af; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; }
      `}</style>
      <DayPicker
        mode="range"
        defaultMonth={range?.from || new Date()}
        selected={range}
        onSelect={setRange}
        footer={footer}
        className="font-sans"
        fromDate={startOfDay(new Date())}
        showOutsideDays
        classNames={{
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-full transition-all duration-200",
          day_range_start: "rounded-l-full rounded-r-none",
          day_range_end: "rounded-r-full rounded-l-none",
          day_selected: "bg-teal text-white hover:bg-teal shadow-md",
          day_today: "bg-gray-100 text-charcoal font-bold",
          day_outside: "text-gray-300 opacity-50",
          day_disabled: "text-gray-300 opacity-50",
          day_hidden: "invisible",
        }}
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
