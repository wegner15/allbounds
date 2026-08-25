import React, { useMemo } from 'react';
import { useFieldArray, useWatch, type Control, type UseFormRegister } from 'react-hook-form';
import { usePackages } from '../../lib/hooks/usePackages';
import { useGroupTrips } from '../../lib/hooks/useGroupTrips';
import { Sparkles, Plus, Check, Tag } from 'lucide-react';

interface ConversionTriggersManagerProps {
  control: Control<any>;
  register: UseFormRegister<any>;
}

export const ConversionTriggersManager: React.FC<ConversionTriggersManagerProps> = ({ control, register }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'conversion_triggers',
  });

  const currentTriggers = useWatch({
    control,
    name: 'conversion_triggers',
    defaultValue: [],
  });

  const { data: packages } = usePackages({ limit: 100 });
  const { data: groupTrips } = useGroupTrips({ limit: 100 });

  // Extract all unique existing triggers from packages, group trips, and defaults
  const allSuggestedTriggers = useMemo(() => {
    const set = new Set<string>();

    // Common standard defaults
    const defaults = [
      'Most Popular',
      'Hot Deal',
      'Best Seller',
      'Limited Time Offer',
      'Family Choice',
      'Luxury Escape',
      'Early Bird Discount',
      'All-Inclusive',
      'Top Rated',
      'Highly Recommended',
      'Exclusive Deal',
      'Bucket List',
    ];
    defaults.forEach((d) => set.add(d));

    if (packages && Array.isArray(packages)) {
      packages.forEach((pkg) => {
        if (pkg.conversion_triggers && Array.isArray(pkg.conversion_triggers)) {
          pkg.conversion_triggers.forEach((t) => {
            if (t && typeof t === 'string' && t.trim()) {
              set.add(t.trim());
            }
          });
        }
      });
    }

    if (groupTrips && Array.isArray(groupTrips)) {
      groupTrips.forEach((gt) => {
        if (gt.conversion_triggers && Array.isArray(gt.conversion_triggers)) {
          gt.conversion_triggers.forEach((t) => {
            if (t && typeof t === 'string' && t.trim()) {
              set.add(t.trim());
            }
          });
        }
      });
    }

    return Array.from(set).sort();
  }, [packages, groupTrips]);

  // Set of currently selected trigger values (case-insensitive)
  const selectedValuesSet = useMemo(() => {
    const set = new Set<string>();
    if (Array.isArray(currentTriggers)) {
      currentTriggers.forEach((item: any) => {
        if (item && item.value && typeof item.value === 'string' && item.value.trim()) {
          set.add(item.value.trim().toLowerCase());
        }
      });
    }
    return set;
  }, [currentTriggers]);

  const handleToggleTrigger = (triggerText: string) => {
    const lower = triggerText.trim().toLowerCase();
    if (selectedValuesSet.has(lower)) {
      // Remove it
      const indexToRemove = currentTriggers.findIndex(
        (item: any) => item?.value?.trim()?.toLowerCase() === lower
      );
      if (indexToRemove !== -1) {
        remove(indexToRemove);
      }
    } else {
      // Add it
      append({ value: triggerText });
    }
  };

  return (
    <div className="space-y-4">
      {/* Suggestions Pills Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Quick Select & Existing Triggers
          </span>
          <span className="text-[11px] text-gray-400 font-normal">
            (Click to add/remove)
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {allSuggestedTriggers.map((trigger) => {
            const isSelected = selectedValuesSet.has(trigger.toLowerCase());
            return (
              <button
                key={trigger}
                type="button"
                onClick={() => handleToggleTrigger(trigger)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-teal text-white shadow-xs border border-teal'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-teal hover:bg-teal-50/50 hover:text-teal'
                }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-gray-400" />
                )}
                {trigger}
              </button>
            );
          })}
        </div>
      </div>

      {/* Datalist for autocomplete as the user types */}
      <datalist id="existing-conversion-triggers-list">
        {allSuggestedTriggers.map((trigger) => (
          <option key={trigger} value={trigger} />
        ))}
      </datalist>

      {/* Active Trigger Fields List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-gray-800">
            Conversion Triggers ({fields.length})
          </label>
          <button
            type="button"
            onClick={() => append({ value: '' })}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal text-white text-xs font-bold rounded-lg shadow-2xs hover:bg-teal-dark transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Trigger
          </button>
        </div>

        <div className="space-y-3">
          {fields.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
              <Tag className="w-6 h-6 text-gray-400 mx-auto mb-1 opacity-60" />
              <p className="text-xs text-gray-500 font-medium">No conversion triggers added yet.</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Click a suggestion pill above or "+ Add Trigger"</p>
            </div>
          ) : (
            fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3">
                <input
                  {...register(`conversion_triggers.${index}.value`)}
                  list="existing-conversion-triggers-list"
                  placeholder='e.g. "Most Popular" or "Pay 50% deposit now"'
                  className="flex-1 px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-teal transition-all"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 cursor-pointer hover:bg-red-50 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversionTriggersManager;
