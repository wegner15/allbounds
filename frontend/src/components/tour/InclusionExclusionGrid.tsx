import React, { useState } from 'react';
import type { InclusionDetail, ExclusionDetail } from '../../lib/types/api';
import {
  Check,
  X,
  Compass,
  Bed,
  Utensils,
  Car,
  Plane,
  FileText,
  ShieldCheck,
  Ticket,
  Camera,
  Wallet,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface InclusionExclusionGridProps {
  inclusions: InclusionDetail[];
  exclusions: ExclusionDetail[];
}

interface GroupedItems<T> {
  [category: string]: T[];
}

// Category icon selector matching hotel amenities pattern
const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('guide') || cat.includes('leader') || cat.includes('escort') || cat.includes('staff')) {
    return <Compass className="w-4 h-4" />;
  }
  if (
    cat.includes('accommodat') ||
    cat.includes('lodge') ||
    cat.includes('hotel') ||
    cat.includes('camp') ||
    cat.includes('room') ||
    cat.includes('stay')
  ) {
    return <Bed className="w-4 h-4" />;
  }
  if (
    cat.includes('meal') ||
    cat.includes('food') ||
    cat.includes('din') ||
    cat.includes('breakfast') ||
    cat.includes('lunch') ||
    cat.includes('drink') ||
    cat.includes('beverage')
  ) {
    return <Utensils className="w-4 h-4" />;
  }
  if (
    cat.includes('flight') ||
    cat.includes('air') ||
    cat.includes('plane') ||
    cat.includes('aviation')
  ) {
    return <Plane className="w-4 h-4" />;
  }
  if (
    cat.includes('transport') ||
    cat.includes('transfer') ||
    cat.includes('vehicle') ||
    cat.includes('car') ||
    cat.includes('drive')
  ) {
    return <Car className="w-4 h-4" />;
  }
  if (cat.includes('visa') || cat.includes('passport') || cat.includes('border') || cat.includes('document')) {
    return <FileText className="w-4 h-4" />;
  }
  if (
    cat.includes('insurance') ||
    cat.includes('medical') ||
    cat.includes('health') ||
    cat.includes('safety') ||
    cat.includes('emergency')
  ) {
    return <ShieldCheck className="w-4 h-4" />;
  }
  if (
    cat.includes('ticket') ||
    cat.includes('fee') ||
    cat.includes('permit') ||
    cat.includes('park') ||
    cat.includes('tax') ||
    cat.includes('toll')
  ) {
    return <Ticket className="w-4 h-4" />;
  }
  if (
    cat.includes('activit') ||
    cat.includes('tour') ||
    cat.includes('safari') ||
    cat.includes('sightsee') ||
    cat.includes('excursion')
  ) {
    return <Camera className="w-4 h-4" />;
  }
  if (
    cat.includes('wallet') ||
    cat.includes('expense') ||
    cat.includes('tip') ||
    cat.includes('personal') ||
    cat.includes('money') ||
    cat.includes('shopping')
  ) {
    return <Wallet className="w-4 h-4" />;
  }
  return <Sparkles className="w-4 h-4" />;
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
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
          </div>
          <span>What's Included</span>
        </h3>

        {Object.keys(groupedInclusions).length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-500 italic p-4 rounded-xl bg-gray-50 border border-gray-100">
            No specific inclusions listed for this package.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedInclusions).map(([category, items]) => (
              <CategoryCard
                key={category}
                category={category}
                items={items}
                type="inclusion"
              />
            ))}
          </div>
        )}
      </div>

      {/* Exclusions Column */}
      <div className="mt-6 lg:mt-0 animate-fade-in">
        <h3 className="text-xl sm:text-2xl font-semibold text-charcoal mb-4 sm:mb-6 flex items-center gap-3 font-playfair">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-500/20">
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
          </div>
          <span>What's Not Included</span>
        </h3>

        {Object.keys(groupedExclusions).length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-500 italic p-4 rounded-xl bg-gray-50 border border-gray-100">
            No specific exclusions listed for this package.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedExclusions).map(([category, items]) => (
              <CategoryCard
                key={category}
                category={category}
                items={items}
                type="exclusion"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Clustered Category Card Component
interface CategoryCardProps {
  category: string;
  items: (InclusionDetail | ExclusionDetail)[];
  type: 'inclusion' | 'exclusion';
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, items, type }) => {
  const isInclusion = type === 'inclusion';

  return (
    <div
      className={`rounded-xl border transition-all duration-200 p-4 sm:p-5 flex flex-col ${
        isInclusion
          ? 'border-emerald-100/90 bg-emerald-50/25 hover:bg-white hover:border-emerald-300/80 hover:shadow-sm'
          : 'border-rose-100/90 bg-rose-50/25 hover:bg-white hover:border-rose-300/80 hover:shadow-sm'
      }`}
    >
      {/* Category Card Header */}
      <div
        className={`flex items-center justify-between gap-3 pb-3 mb-3.5 border-b ${
          isInclusion ? 'border-emerald-100/80' : 'border-rose-100/80'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              isInclusion
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-rose-500/10 text-rose-600'
            }`}
          >
            {getCategoryIcon(category)}
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-gray-800 tracking-wider uppercase">
            {category}
          </h4>
        </div>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white border shadow-2xs ${
            isInclusion
              ? 'border-emerald-200/80 text-emerald-700'
              : 'border-rose-200/80 text-rose-700'
          }`}
        >
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Scannable list of items clustered inside this category */}
      <ul className="space-y-2.5 flex-1">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} type={type} />
        ))}
      </ul>
    </div>
  );
};

// Item Row Component inside a category cluster
interface ItemRowProps {
  item: InclusionDetail | ExclusionDetail;
  type: 'inclusion' | 'exclusion';
}

const ItemRow: React.FC<ItemRowProps> = ({ item, type }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDescription = Boolean(item.description && item.description.trim().length > 0);
  const hasCustomIcon = Boolean(item.icon && item.icon.trim().length > 0);
  const isInclusion = type === 'inclusion';

  return (
    <li
      className={`group rounded-lg transition-colors p-1.5 -mx-1.5 ${
        hasDescription ? 'cursor-pointer hover:bg-white/80' : ''
      }`}
      onClick={() => hasDescription && setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start gap-2.5">
        {/* Item Icon / Bullet */}
        <span
          className={`mt-0.5 p-1 rounded-full shrink-0 transition-colors ${
            isInclusion
              ? 'bg-emerald-500/15 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
              : 'bg-rose-500/15 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
          }`}
        >
          {hasCustomIcon ? (
            <i className={`fas fa-${item.icon} text-xs w-3 h-3 flex items-center justify-center`} />
          ) : isInclusion ? (
            <Check className="w-3 h-3 stroke-[2.5]" />
          ) : (
            <X className="w-3 h-3 stroke-[2.5]" />
          )}
        </span>

        {/* Item Name & Description */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-medium text-gray-800 group-hover:text-gray-950 transition-colors block leading-snug">
              {item.name}
            </span>
            {hasDescription && (
              <button
                type="button"
                className="text-gray-400 group-hover:text-gray-600 p-0.5 rounded transition-colors"
                aria-label={isExpanded ? 'Collapse description' : 'Expand description'}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* Expandable Description */}
          {hasDescription && isExpanded && (
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed animate-fade-in pl-0.5 bg-white/70 rounded-md p-2 border border-gray-100">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </li>
  );
};

export default InclusionExclusionGrid;
