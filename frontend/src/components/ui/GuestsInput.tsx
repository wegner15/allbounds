import React, { useState, useRef, useEffect } from 'react';
import { Users, Minus, Plus } from 'lucide-react';

export interface GuestConfig {
    adults: number;
    children: number;
    rooms: number;
}

interface GuestsInputProps {
    value: GuestConfig;
    onChange: (value: GuestConfig) => void;
    className?: string;
    variant?: 'dark' | 'light';
    showRooms?: boolean;
}

const GuestsInput: React.FC<GuestsInputProps> = ({
    value,
    onChange,
    className = '',
    variant = 'light',
    showRooms = true
}) => {
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

    const updateCount = (field: keyof GuestConfig, increment: boolean) => {
        const newValue = { ...value };
        if (increment) {
            newValue[field]++;
        } else {
            if (field === 'adults' && newValue[field] > 1) newValue[field]--;
            if (field === 'children' && newValue[field] > 0) newValue[field]--;
            if (field === 'rooms' && newValue[field] > 1) newValue[field]--;
        }
        onChange(newValue);
    };

    const isDark = variant === 'dark';

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <div
                className="flex items-center cursor-pointer h-full"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex bg-transparent items-center">
                    {/* Icon removed here as it will likely be in the parent label or input addon */}
                    <div className={`text-base font-medium truncate ${isDark ? 'text-white' : 'text-charcoal'
                        }`}>
                        {value.adults + value.children} Guests, {showRooms ? `${value.rooms} Room${value.rooms > 1 ? 's' : ''}` : ''}
                        <span className="block text-xs font-normal text-charcoal/60 truncate">
                            {value.adults} Adults, {value.children} Children
                        </span>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full right-0 mt-4 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {/* Adults */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="font-bold text-charcoal">Adults</p>
                            <p className="text-sm text-gray-500">Ages 13 or above</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); updateCount('adults', false); }}
                                disabled={value.adults <= 1}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-teal hover:text-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-4 text-center font-medium text-charcoal">{value.adults}</span>
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); updateCount('adults', true); }}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-teal hover:text-teal transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Children */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="font-bold text-charcoal">Children</p>
                            <p className="text-sm text-gray-500">Ages 2-12</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); updateCount('children', false); }}
                                disabled={value.children <= 0}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-teal hover:text-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-4 text-center font-medium text-charcoal">{value.children}</span>
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); updateCount('children', true); }}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-teal hover:text-teal transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Rooms */}
                    {showRooms && (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold text-charcoal">Rooms</p>
                                <p className="text-sm text-gray-500">Number of rooms</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); updateCount('rooms', false); }}
                                    disabled={value.rooms <= 1}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-teal hover:text-teal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-4 text-center font-medium text-charcoal">{value.rooms}</span>
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); updateCount('rooms', true); }}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-teal hover:text-teal transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GuestsInput;
