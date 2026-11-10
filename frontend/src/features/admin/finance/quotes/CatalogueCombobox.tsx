import React, { useState, useEffect, useRef } from 'react';
import { Search, Building, Landmark, Compass, Sparkles, Loader2 } from 'lucide-react';
import { tourQuotesApi, type CatalogueItem } from '../../../../lib/api/tourQuotes';
import { getCloudflareImageUrl } from '../../../../utils/cloudflareImageUtils';

interface CatalogueComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onSelectCatalogueItem: (item: CatalogueItem) => void;
  placeholder?: string;
  destination?: string | null;
  disabled?: boolean;
  className?: string;
}

export const CatalogueCombobox: React.FC<CatalogueComboboxProps> = ({
  value,
  onChange,
  onSelectCatalogueItem,
  placeholder = 'Type custom title or search catalogue...',
  destination,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<number>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (term: string) => {
    onChange(term);
    window.clearTimeout(searchTimeout.current);

    if (!term || term.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);

    searchTimeout.current = window.setTimeout(async () => {
      try {
        const data = await tourQuotesApi.searchCatalogue({
          q: term.trim(),
          destination: destination || undefined,
          limit: 10,
        });
        setResults(data);
      } catch (err) {
        console.error('Catalogue search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
  };

  const handleSelectItem = (item: CatalogueItem) => {
    onSelectCatalogueItem(item);
    setIsOpen(false);
    setResults([]);
  };

  const getBadge = (type: string, stars?: number | null) => {
    switch (type) {
      case 'hotel':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            <Building className="w-2.5 h-2.5" /> Hotel {stars ? `★${stars}` : ''}
          </span>
        );
      case 'attraction':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Landmark className="w-2.5 h-2.5" /> Park / Attraction
          </span>
        );
      case 'activity':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
            <Compass className="w-2.5 h-2.5" /> Activity
          </span>
        );
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <input
          disabled={disabled}
          type="text"
          value={value}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (value && value.trim().length >= 2 && results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-md pl-2.5 pr-8 py-1.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow bg-white"
        />

        <div className="absolute right-2 flex items-center gap-1 text-gray-400">
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" />
          ) : (
            <Search className="w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl max-h-72 overflow-y-auto divide-y divide-gray-100">
          <div className="px-3 py-1.5 bg-gray-50 text-[11px] font-medium text-gray-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-700" /> Matching Catalogue Items
            </span>
            <span>Click to auto-fill details</span>
          </div>

          {results.length === 0 && !loading ? (
            <div className="p-3 text-xs text-gray-500 text-center">
              No matching hotels, attractions, or activities found.{' '}
              <span className="font-semibold text-gray-700">Custom title will be used.</span>
            </div>
          ) : (
            results.map((item) => (
              <button
                key={`${item.entity_type}-${item.entity_id}`}
                type="button"
                onClick={() => handleSelectItem(item)}
                className="w-full text-left p-2.5 hover:bg-teal-50/80 flex items-start gap-2.5 transition-colors group cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 mt-0.5">
                  {item.image_url ? (
                    <img
                      src={getCloudflareImageUrl(item.image_url, 'thumbnail')}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/home-heros/hero1.jpeg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Search className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-gray-900 truncate group-hover:text-teal-900">
                      {item.name}
                    </span>
                    {getBadge(item.entity_type, item.stars)}
                  </div>

                  {item.destination && (
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">{item.destination}</p>
                  )}

                  {item.summary && (
                    <p className="text-[10.5px] text-gray-600 line-clamp-1 mt-0.5">
                      {item.summary}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1 text-[10px] text-teal-800 font-medium">
                    <span className="capitalize">Category: {item.suggested_component_type}</span>
                    <span>•</span>
                    <span>Basis: {item.suggested_cost_basis.replace('_', ' ')}</span>
                    {item.default_price ? (
                      <>
                        <span>•</span>
                        <span>Fee: ${item.default_price}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
