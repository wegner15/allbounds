import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, Sparkles, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import {
  useTravelGuideCategories,
  useCreateTravelGuideCategory,
  useUpdateTravelGuideCategory,
  useDeleteTravelGuideCategory,
} from '../../../lib/hooks/useTravelGuides';
import type { TravelGuideCategory } from '../../../lib/types/travel-guide';

const COMMON_EMOJIS = ['ℹ️', '🎯', '🌃', '🛍️', '🏖️', '🍽️', '🚴', '🎉', '🎫', '💵', '🗣️', '📅', '🦁', '🌊', '🍷', '🏃', '🏄', '✈️', '⛵', '🗺️', '☕', '🍖', '🍹', '🌴'];

export const TravelGuideCategoriesPage: React.FC = () => {
  const { data: categories = [], isLoading, error } = useTravelGuideCategories(true);
  const createMutation = useCreateTravelGuideCategory();
  const updateMutation = useUpdateTravelGuideCategory();
  const deleteMutation = useDeleteTravelGuideCategory();

  const [editingCategory, setEditingCategory] = useState<TravelGuideCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'ℹ️',
    description: '',
    order_index: 0,
    is_active: true,
  });

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      icon: 'ℹ️',
      description: '',
      order_index: categories.length + 1,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: TravelGuideCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || 'ℹ️',
      description: cat.description || '',
      order_index: cat.order_index,
      is_active: cat.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingCategory) {
      await updateMutation.mutateAsync({
        id: editingCategory.id,
        data: {
          name: formData.name,
          slug: formData.slug || undefined,
          icon: formData.icon,
          description: formData.description,
          order_index: formData.order_index,
          is_active: formData.is_active,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: formData.name,
        slug: formData.slug || undefined,
        icon: formData.icon,
        description: formData.description,
        order_index: formData.order_index,
        is_active: formData.is_active,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Deleting a category will also delete all associated guide items. Continue?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/destinations"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Destinations
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span>Global Travel Guide Categories</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage shared categories for traveler insights (e.g. Good to Know, Things to Do, Beaches, Sports).
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Table / List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/70 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No travel guide categories defined. Click &ldquo;New Category&rdquo; to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-150 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3.5">Icon</th>
                  <th className="px-6 py-3.5">Category Name</th>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-6 py-3.5 text-center">Order</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-2xl p-2 bg-gray-100 rounded-lg inline-block">{cat.icon || 'ℹ️'}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {cat.name}
                      {cat.description && (
                        <p className="text-xs text-gray-400 font-normal mt-0.5">{cat.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">{cat.slug}</td>
                    <td className="px-6 py-4 text-center font-medium text-gray-600">{cat.order_index}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          cat.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingCategory ? 'Edit Travel Category' : 'New Travel Category'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sports & Adventure"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Slug (URL Key)
                  </label>
                  <input
                    type="text"
                    placeholder="sports-adventure"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full text-sm font-mono border border-gray-200 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
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

              {/* Quick Emoji Selector */}
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional summary for this guide category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>

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
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelGuideCategoriesPage;
