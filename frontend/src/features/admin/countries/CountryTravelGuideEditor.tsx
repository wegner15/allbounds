import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import {
  useTravelGuideCategories,
  useDestinationGuideItems,
  useCreateDestinationGuideItem,
  useUpdateDestinationGuideItem,
  useDeleteDestinationGuideItem,
} from '../../../lib/hooks/useTravelGuides';
import type { DestinationGuideItem, TravelGuideCategory } from '../../../lib/types/travel-guide';

interface CountryTravelGuideEditorProps {
  countryId: number;
}

const COMMON_EMOJIS = ['ℹ️', '🎯', '🌃', '🛍️', '🏖️', '🍽️', '🚴', '🎉', '🎫', '💵', '🗣️', '📅', '🦁', '🌊', '🍷', '🏃', '🏄', '✈️', '⛵', '🗺️', '☕', '🍖', '🍹', '🌴'];

export const CountryTravelGuideEditor: React.FC<CountryTravelGuideEditorProps> = ({ countryId }) => {
  const { data: categories = [], isLoading: categoriesLoading } = useTravelGuideCategories(true);
  const { data: items = [], isLoading: itemsLoading } = useDestinationGuideItems({
    countryId,
    includeInactive: true,
  });

  const createMutation = useCreateDestinationGuideItem();
  const updateMutation = useUpdateDestinationGuideItem();
  const deleteMutation = useDeleteDestinationGuideItem();

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<DestinationGuideItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    icon: 'ℹ️',
    category_id: 0,
    order_index: 0,
    is_active: true,
  });

  // Set default active category once loaded
  React.useEffect(() => {
    if (categories.length > 0 && activeCategoryId === null) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  const activeCategory = categories.find((c) => c.id === activeCategoryId) || categories[0];
  const activeItems = items.filter((item) => item.category_id === (activeCategoryId || activeCategory?.id));

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      icon: activeCategory?.icon || 'ℹ️',
      category_id: activeCategoryId || activeCategory?.id || 0,
      order_index: activeItems.length,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: DestinationGuideItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      icon: item.icon || 'ℹ️',
      category_id: item.category_id,
      order_index: item.order_index,
      is_active: item.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!formData.title || !formData.content) return;

    if (editingItem) {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        data: {
          title: formData.title,
          content: formData.content,
          icon: formData.icon,
          category_id: formData.category_id,
          order_index: formData.order_index,
          is_active: formData.is_active,
        },
      });
    } else {
      await createMutation.mutateAsync({
        country_id: countryId,
        category_id: formData.category_id || activeCategoryId || 0,
        title: formData.title,
        content: formData.content,
        icon: formData.icon,
        order_index: formData.order_index,
        is_active: formData.is_active,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this travel guide item?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (categoriesLoading || itemsLoading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-150 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-6"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200/70 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Destination Travel Guide Items</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage custom traveler guide recommendations and tips for this destination.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Guide Item</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-3 mb-6 border-b border-gray-100 scrollbar-thin">
        {categories.map((cat) => {
          const itemCount = items.filter((i) => i.category_id === cat.id).length;
          const isActive = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{cat.icon || 'ℹ️'}</span>
              <span>{cat.name}</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {itemCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Guide Items Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeItems.length > 0 ? (
          activeItems.map((item, index) => (
            <div
              key={item.id}
              className="group bg-gray-50/70 hover:bg-white rounded-xl p-5 border border-gray-200/70 hover:border-primary/40 transition-all shadow-xs hover:shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl p-2 bg-white rounded-lg border border-gray-100 shadow-2xs">
                    {item.icon || 'ℹ️'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">0{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1 text-gray-400 hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 text-base mb-1.5">{item.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">{item.content}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>Order: {item.order_index}</span>
                <span className={item.is_active ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-500 mb-3">
              No guide recommendations added for <strong>{activeCategory?.name}</strong> yet.
            </p>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Recommendation</span>
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingItem ? 'Edit Travel Guide Item' : 'Add Travel Guide Item'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value, 10) })}
                  className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon || 'ℹ️'} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Icon */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kitesurfing in Diani"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Icon Emoji
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full text-sm text-center border border-gray-200 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Quick Emoji Picker */}
              <div>
                <span className="block text-[11px] text-gray-400 mb-1">Quick Select Icon:</span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className={`text-base p-1.5 rounded-lg border transition-colors ${
                        formData.icon === emoji ? 'border-primary bg-primary/10' : 'border-gray-100 hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Description / Content *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter detailed recommendation or tip for travelers..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Order & Active */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 font-medium">Order Index:</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value, 10) || 0 })}
                    className="w-16 text-xs text-center border border-gray-200 rounded-lg p-1.5"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Active</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-50"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryTravelGuideEditor;
