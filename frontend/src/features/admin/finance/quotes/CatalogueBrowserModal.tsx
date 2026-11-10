import React, { useState, useEffect } from 'react';
import {
  Search,
  Building,
  Landmark,
  Compass,
  X,
  Loader2,
  Check,
  Plus,
  Sparkles,
  MapPin,
  Star,
} from 'lucide-react';
import { tourQuotesApi, type CatalogueItem } from '../../../../lib/api/tourQuotes';
import { getCloudflareImageUrl } from '../../../../utils/cloudflareImageUtils';

interface CatalogueBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCostItem: (item: CatalogueItem) => void;
  onSetDayHighlight?: (item: CatalogueItem) => void;
  dayNumber?: number | null;
  destination?: string | null;
}

export const CatalogueBrowserModal: React.FC<CatalogueBrowserModalProps> = ({
  isOpen,
  onClose,
  onSelectCostItem,
  onSetDayHighlight,
  dayNumber,
  destination,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'hotel' | 'attraction' | 'activity'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await tourQuotesApi.searchCatalogue({
          q: searchTerm.trim() || undefined,
          category: activeCategory,
          destination: destination || undefined,
          limit: 30,
        });
        setItems(data);
      } catch (err) {
        console.error('Failed to load catalogue items:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [isOpen, activeCategory, searchTerm, destination]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between gap-3 bg-gray-50/50">
          <div>
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-700" />
              Catalogue Explorer: Hotels, Attractions & Activities
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Select existing destination content to pre-fill titles, images, and descriptions into{' '}
              {dayNumber ? <strong>Day {dayNumber}</strong> : <strong>Trip-Wide Costs</strong>}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-gray-100 space-y-3 bg-white">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search hotel name, national park, city, safari excursion..."
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-teal-800 text-white border-teal-800'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                All Items
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('hotel')}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${
                  activeCategory === 'hotel'
                    ? 'bg-amber-700 text-white border-amber-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Building className="w-3.5 h-3.5" /> Hotels & Lodges
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('attraction')}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${
                  activeCategory === 'attraction'
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" /> Parks & Attractions
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('activity')}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 transition-colors ${
                  activeCategory === 'activity'
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Compass className="w-3.5 h-3.5" /> Activities
              </button>
            </div>
          </div>
        </div>

        {/* Items Grid View */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-700 mb-2" />
              <p className="text-sm font-medium">Searching catalogue items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <p className="text-base font-semibold text-gray-700">No catalogue items found</p>
              <p className="text-xs text-gray-500 mt-1">
                Try searching with a different keyword or category. Custom titles can still be entered manually.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => {
                const img = item.image_url ? getCloudflareImageUrl(item.image_url, 'medium') : '/home-heros/hero1.jpeg';
                return (
                  <div
                    key={`${item.entity_type}-${item.entity_id}`}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="relative h-32 w-full bg-gray-100 overflow-hidden">
                        <img
                          src={img}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/home-heros/hero1.jpeg';
                          }}
                        />
                        <div className="absolute top-2 left-2 flex gap-1.5">
                          {item.entity_type === 'hotel' && (
                            <span className="bg-amber-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                              <Building className="w-3 h-3" /> Hotel
                              {item.stars && <span>★{item.stars}</span>}
                            </span>
                          )}
                          {item.entity_type === 'attraction' && (
                            <span className="bg-emerald-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                              <Landmark className="w-3 h-3" /> Park / Attraction
                            </span>
                          )}
                          {item.entity_type === 'activity' && (
                            <span className="bg-blue-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                              <Compass className="w-3 h-3" /> Activity
                            </span>
                          )}
                          {item.price_category && (
                            <span className="bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                              {item.price_category}
                            </span>
                          )}
                        </div>

                        {item.default_price ? (
                          <div className="absolute bottom-2 right-2 bg-white/95 text-gray-900 text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                            Fee: ${item.default_price}
                          </div>
                        ) : null}
                      </div>

                      {/* Content Details */}
                      <div className="p-3.5 space-y-1.5">
                        <h4 className="font-bold text-sm text-gray-900 leading-snug">{item.name}</h4>

                        {item.destination && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-teal-700 flex-shrink-0" />
                            <span className="truncate">{item.destination}</span>
                          </p>
                        )}

                        {item.summary && (
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {item.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-3 border-t border-gray-100 bg-gray-50/70 flex flex-wrap items-center justify-end gap-2 text-xs">
                      {onSetDayHighlight && dayNumber && (
                        <button
                          type="button"
                          onClick={() => {
                            onSetDayHighlight(item);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-100 flex items-center gap-1 transition-colors"
                          title="Sets Day Title, Narrative and Highlight Photo"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-teal-700" /> Set as Day Theme
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onSelectCostItem(item);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-teal-800 text-white font-semibold rounded-md hover:bg-teal-900 flex items-center gap-1 shadow-2xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add as Cost Line
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>
            {items.length} item{items.length === 1 ? '' : 's'} available. Selecting an item auto-carries image, description, and classification.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
