import React, { useState, useMemo } from 'react';
import type { ContentTag } from '../../lib/types/content-tag';

interface TagSelectorProps {
  tags: ContentTag[];
  selectedTagIds: number[];
  onChange: (ids: number[]) => void;
  label?: string;
  helperText?: string;
  groupByCategory?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  style: 'Style',
  vibe: 'Vibe',
  activity_type: 'Activity Type',
  destination_type: 'Destination Type',
  budget: 'Budget',
  duration: 'Duration',
  general: 'General',
};

const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTagIds,
  onChange,
  label = 'Tags',
  helperText = 'Select tags to categorize this content and enable filtering.',
  groupByCategory = true,
}) => {
  const [search, setSearch] = useState('');

  const filteredTags = useMemo(
    () =>
      tags.filter(
        (t) =>
          t.is_active &&
          (t.name.toLowerCase().includes(search.toLowerCase()) ||
            (t.category || '').toLowerCase().includes(search.toLowerCase()))
      ),
    [tags, search]
  );

  const grouped = useMemo(() => {
    if (!groupByCategory) return { '': filteredTags };
    return filteredTags.reduce<Record<string, ContentTag[]>>((acc, tag) => {
      const cat = tag.category || 'general';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(tag);
      return acc;
    }, {});
  }, [filteredTags, groupByCategory]);

  const toggle = (id: number) => {
    if (selectedTagIds.includes(id)) {
      onChange(selectedTagIds.filter((t) => t !== id));
    } else {
      onChange([...selectedTagIds, id]);
    }
  };

  const selectedCount = selectedTagIds.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-800">
          {label}{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        {selectedCount > 0 && (
          <span className="text-xs font-medium text-teal bg-teal/10 px-2 py-0.5 rounded-full">
            {selectedCount} selected
          </span>
        )}
      </div>

      <div className="bg-white rounded-lg ring-1 ring-inset ring-gray-200 p-4">
        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
          />
        </div>

        {tags.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4 italic">
            No tags available. Create tags in{' '}
            <a href="/admin/tags" className="text-teal underline" target="_blank" rel="noreferrer">
              Admin → Content Tags
            </a>
            .
          </p>
        ) : filteredTags.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4 italic">No tags match your search.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([category, categoryTags]) => (
              <div key={category}>
                {groupByCategory && category && (
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    {CATEGORY_LABELS[category] || category}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {categoryTags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggle(tag.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal ${
                          isSelected
                            ? 'bg-teal text-white border-teal shadow-sm'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                        style={
                          isSelected && tag.color
                            ? { backgroundColor: tag.color, borderColor: tag.color }
                            : undefined
                        }
                        title={tag.description || tag.name}
                      >
                        {tag.icon && <span className="text-base leading-none">{tag.icon}</span>}
                        {tag.name}
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};

export default TagSelector;
