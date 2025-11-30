import React, { useState } from 'react';
import type { InclusionDetail, ExclusionDetail } from '../../lib/types/api';
import { Check, X } from 'lucide-react';

interface InclusionExclusionGridProps {
  inclusions: InclusionDetail[];
  exclusions: ExclusionDetail[];
}

interface GroupedItems<T> {
  [category: string]: T[];
}

const InclusionExclusionGrid: React.FC<InclusionExclusionGridProps> = ({
  inclusions,
  exclusions,
}) => {
  // Group items by category
  const groupedInclusions = groupByCategory(inclusions);
  const groupedExclusions = groupByCategory(exclusions);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      {/* Inclusions Column */}
      <div className="animate-fade-in">
        <h3 className="text-xl sm:text-2xl font-semibold text-charcoal mb-4 sm:mb-6 flex items-center gap-3 font-playfair">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-success to-green-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          What's Included
        </h3>
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(groupedInclusions).map(([category, items]) => (
            <CategorySection
              key={category}
              category={category}
              items={items}
              type="inclusion"
            />
          ))}
        </div>
      </div>

      {/* Exclusions Column */}
      <div className="mt-6 lg:mt-0 animate-fade-in">
        <h3 className="text-xl sm:text-2xl font-semibold text-charcoal mb-4 sm:mb-6 flex items-center gap-3 font-playfair">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-error to-red-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          What's Not Included
        </h3>
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(groupedExclusions).map(([category, items]) => (
            <CategorySection
              key={category}
              category={category}
              items={items}
              type="exclusion"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to group items by category
function groupByCategory<T extends { category?: string }>(items: T[]): GroupedItems<T> {
  return items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as GroupedItems<T>);
}

// Category Section Component
interface CategorySectionProps {
  category: string;
  items: (InclusionDetail | ExclusionDetail)[];
  type: 'inclusion' | 'exclusion';
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, items, type }) => {
  return (
    <div>
      <h4 className="text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
        <div className={`w-1 h-4 rounded-full ${type === 'inclusion' ? 'bg-success' : 'bg-error'}`} />
        {category}
      </h4>
      <div className="space-y-2 sm:space-y-2.5">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} type={type} />
        ))}
      </div>
    </div>
  );
};

// Item Row Component
interface ItemRowProps {
  item: InclusionDetail | ExclusionDetail;
  type: 'inclusion' | 'exclusion';
}

const ItemRow: React.FC<ItemRowProps> = ({ item, type }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDescription = item.description && item.description.trim().length > 0;
  const hasCustomIcon = item.icon && item.icon.trim().length > 0;

  const iconColor = type === 'inclusion' ? 'text-success' : 'text-error';
  const bgColor = type === 'inclusion' ? 'bg-success/10' : 'bg-error/10';
  const borderColor = type === 'inclusion' ? 'border-success/20' : 'border-error/20';
  const hoverBgColor = type === 'inclusion' ? 'hover:bg-success/20' : 'hover:bg-error/20';
  const hoverBorderColor = type === 'inclusion' ? 'hover:border-success/30' : 'hover:border-error/30';

  return (
    <div
      className={`rounded-lg transition-all duration-200 ${hasDescription ? 'cursor-pointer touch-manipulation' : ''}`}
      onClick={() => hasDescription && setIsExpanded(!isExpanded)}
    >
      <div className={`flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-lg border ${bgColor} ${borderColor} ${hasDescription ? `${hoverBgColor} ${hoverBorderColor} hover:shadow-sm` : ''} min-h-[44px] transition-all duration-200`}>
        <div className="flex-shrink-0 mt-0.5">
          {hasCustomIcon ? (
            <div className={`w-5 h-5 rounded-full ${type === 'inclusion' ? 'bg-success/20' : 'bg-error/20'} flex items-center justify-center`}>
              <i className={`fas fa-${item.icon} text-xs ${iconColor}`} />
            </div>
          ) : type === 'inclusion' ? (
            <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
              <Check className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${iconColor} font-bold`} strokeWidth={3} />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-error/20 flex items-center justify-center">
              <X className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${iconColor} font-bold`} strokeWidth={3} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-charcoal">{item.name}</p>
          {isExpanded && hasDescription && (
            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed animate-slide-down">
              {item.description}
            </p>
          )}
        </div>
        {hasDescription && (
          <div className="flex-shrink-0 flex items-center">
            <div className={`w-6 h-6 rounded-full ${type === 'inclusion' ? 'bg-success/20' : 'bg-error/20'} flex items-center justify-center transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              <span className={`text-sm font-bold ${iconColor}`}>
                {isExpanded ? '−' : '+'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InclusionExclusionGrid;
