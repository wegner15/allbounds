import React from 'react';

interface IconSelectorProps {
  selectedIcon?: string;
  onIconSelect: (icon: string) => void;
  label?: string;
  helperText?: string;
}

// Predefined set of icons for holiday types
const AVAILABLE_ICONS = [
  // Travel & Vacation
  '✈️', '🏖️', '🏔️', '🏙️', '🚢', '🗽', '🏛️', '🌴', '🏜️', '🏕️',

  // Adventure & Activities
  '🦁', '🧗‍♂️', '⛷️', '🏊‍♀️', '🚣', '🏇', '🎣', '🏂', '🪂', '🏃‍♂️',

  // Luxury & Romance
  '💎', '💑', '💍', '🏰', '🍾', '🍷', '🍽️', '🛥️', '🏨', '🌟',

  // Family & Groups
  '👨‍👩‍👧‍👦', '👨‍👩‍👧', '👨‍👩‍👦', '👨‍👩‍👧‍👦‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧',

  // Food & Culture
  '🍽️', '🍷', '🏺', '🎭', '🎨', '🎪', '🎡', '🎢', '🎠', '🎪',

  // Sports & Active
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🎱', '🎯',

  // Business & Corporate
  '🏆', '🎤', '📊', '💼', '🤝', '📈', '🏢', '💻', '📱', '📋',

  // Education & Learning
  '🎒', '📚', '🎓', '🧠', '🔬', '🧪', '🌍', '🗺️', '📖', '✏️',

  // Wellness & Relaxation
  '🧘‍♀️', '🛀', '💆‍♀️', '🌿', '🌸', '🌺', '🌻', '🌹', '🌷', '🌼',

  // Seasonal & Special
  '🎄', '🎅', '🦃', '🎃', '👻', '🦇', '🎆', '🎇', '🎊', '🎉'
];

const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onIconSelect,
  label = "Select an Icon",
  helperText = "Choose an icon to represent this holiday type"
}) => {
  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-semibold text-gray-800">
          {label}
        </label>
      )}

      {/* Selected Icon Display */}
      {selectedIcon && (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
          <div className="text-3xl">{selectedIcon}</div>
          <div>
            <p className="text-sm font-medium text-gray-900">Selected Icon</p>
            <p className="text-xs text-gray-500">{selectedIcon}</p>
          </div>
          <button
            type="button"
            onClick={() => onIconSelect('')}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Icon Grid */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <p className="text-sm text-gray-600 mb-3">{helperText}</p>
        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2 max-h-64 overflow-y-auto">
          {AVAILABLE_ICONS.map((icon, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onIconSelect(icon)}
              className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                selectedIcon === icon
                  ? 'border-teal bg-teal/10 text-teal'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}
              title={`Select ${icon}`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Icon Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Or enter a custom icon/emoji
        </label>
        <input
          type="text"
          value={selectedIcon || ''}
          onChange={(e) => onIconSelect(e.target.value)}
          placeholder="e.g. 🏖️ or ⭐"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal focus:border-teal sm:text-sm"
          maxLength={10}
        />
        <p className="text-xs text-gray-500">
          Enter any emoji or icon character (max 10 characters)
        </p>
      </div>
    </div>
  );
};

export default IconSelector;