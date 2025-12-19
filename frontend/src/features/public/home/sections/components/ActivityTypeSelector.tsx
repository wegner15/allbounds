import React, { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

interface ActivityTypeSelectorProps {
    selectedTypes: string[];
    onChange: (types: string[]) => void;
    className?: string;
}

const ACTIVITY_TYPES = [
    'Anything',
    'Gift Inspiration',
    'Top Activities',
    'Day Tours',
    'Wine & Dine',
    'Water Sports',
    'Classes & Workshops',
    'Outdoor Adventures'
];

const ActivityTypeSelector: React.FC<ActivityTypeSelectorProps> = ({
    selectedTypes,
    onChange,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleType = (type: string) => {
        if (type === 'Anything') {
            onChange([]);
            return;
        }

        // If Anything was implied (empty), start new list
        const current = selectedTypes;

        if (current.includes(type)) {
            onChange(current.filter(t => t !== type));
        } else {
            onChange([...current, type]);
        }
    };

    const displayValue = selectedTypes.length === 0
        ? ''
        : selectedTypes.length === 1
            ? selectedTypes[0]
            : `${selectedTypes.length} types selected`;

    return (
        <div className={`relative w-full ${className}`} ref={wrapperRef}>
            <input
                type="text"
                className="w-full bg-transparent border-none p-0 text-charcoal placeholder-gray-400 focus:ring-0 font-medium text-base truncate cursor-pointer"
                placeholder="e.g. Food, Hiking..."
                value={displayValue}
                readOnly
                onClick={() => setIsOpen(!isOpen)}
            />

            {isOpen && (
                <div className="absolute z-[100] mt-4 w-[300px] -left-6 bg-white shadow-2xl rounded-2xl p-2 max-h-80 overflow-auto border border-gray-100">
                    {ACTIVITY_TYPES.map((type) => {
                        const isSelected = type === 'Anything'
                            ? selectedTypes.length === 0
                            : selectedTypes.includes(type);

                        return (
                            <div
                                key={type}
                                className="px-4 py-3 flex items-center cursor-pointer hover:bg-gray-50 rounded-xl"
                                onClick={() => toggleType(type)}
                            >
                                <div className={`
                  w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors
                  ${isSelected ? 'bg-teal border-teal' : 'border-gray-300'}
                `}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-charcoal">{type}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ActivityTypeSelector;
