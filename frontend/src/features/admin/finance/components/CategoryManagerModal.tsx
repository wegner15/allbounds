import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Check,
  RotateCcw,
  Tag,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FolderPlus
} from 'lucide-react';
import { financeApi } from '../../../../lib/api/finance';
import type { FinanceCategoryOption } from '../../../../lib/types/finance';
import {
  DEFAULT_SUPPLIER_CATEGORIES,
  DEFAULT_INVOICE_CATEGORIES,
  normalizeCategories,
  slugifyCategory
} from '../utils/categoryUtils';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'supplier' | 'invoice';
  initialCategories?: FinanceCategoryOption[];
  onCategoriesSaved?: (categories: FinanceCategoryOption[], newlyAddedId?: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  type,
  initialCategories,
  onCategoriesSaved
}) => {
  const isSupplier = type === 'supplier';
  const defaultList = isSupplier ? DEFAULT_SUPPLIER_CATEGORIES : DEFAULT_INVOICE_CATEGORIES;
  const title = isSupplier ? 'Supplier Categories' : 'Invoice Line Item Categories';
  const description = isSupplier
    ? 'Configure partner and supplier business categories used across purchasing and supplier profiles.'
    : 'Configure line item service categories used when billing customers and breaking down tour services.';

  const [categories, setCategories] = useState<FinanceCategoryOption[]>([]);
  const [newLabel, setNewLabel] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load categories from props or fetch fresh settings
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSuccessMessage(null);
    setEditingId(null);
    setNewLabel('');
    setLastAddedId(null);

    if (initialCategories && initialCategories.length > 0) {
      setCategories(normalizeCategories(initialCategories, defaultList));
    } else {
      loadFromSettings();
    }
  }, [isOpen, type, initialCategories]);

  const loadFromSettings = async () => {
    try {
      setLoading(true);
      const settings = await financeApi.getSettings();
      const rawList = isSupplier ? settings.supplier_categories : settings.invoice_categories;
      setCategories(normalizeCategories(rawList, defaultList));
    } catch (err: any) {
      console.error('Failed to load categories from finance settings', err);
      setCategories([...defaultList]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const trimmed = newLabel.trim();
    if (!trimmed) {
      setError('Please enter a category name');
      return;
    }

    const newId = slugifyCategory(trimmed);
    const exists = categories.some(
      (c) => c.id === newId || c.label.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      setError(`A category with the name "${trimmed}" already exists.`);
      return;
    }

    const newCategory: FinanceCategoryOption = {
      id: newId,
      label: trimmed,
      is_default: false
    };

    const updated = [...categories, newCategory];
    setCategories(updated);
    setNewLabel('');
    setLastAddedId(newId);
    setSuccessMessage(`Added "${trimmed}" to categories. Click "Save & Apply" to commit.`);
  };

  const handleStartEdit = (cat: FinanceCategoryOption) => {
    setError(null);
    setEditingId(cat.id);
    setEditingLabel(cat.label);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingLabel('');
  };

  const handleSaveEdit = (catId: string) => {
    setError(null);
    const trimmed = editingLabel.trim();
    if (!trimmed) {
      setError('Category name cannot be empty');
      return;
    }

    const duplicate = categories.some(
      (c) => c.id !== catId && c.label.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setError(`Another category is already named "${trimmed}".`);
      return;
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, label: trimmed } : c))
    );
    setEditingId(null);
    setEditingLabel('');
    setSuccessMessage('Category updated in list.');
  };

  const handleDeleteCategory = (catId: string) => {
    setError(null);
    if (categories.length <= 1) {
      setError('At least one category must be kept.');
      return;
    }
    const target = categories.find((c) => c.id === catId);
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    if (target) {
      setSuccessMessage(`Removed "${target.label}". Click "Save & Apply" to commit.`);
    }
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Restore system default categories? Any newly added categories will be removed.')) {
      setCategories([...defaultList]);
      setSuccessMessage('Default categories restored. Click "Save & Apply" to commit.');
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setError(null);

      // Clean list
      const cleanList = categories.map((c) => ({
        id: c.id,
        label: c.label.trim(),
        description: c.description || '',
        is_default: c.is_default || false
      }));

      const payload = isSupplier
        ? { supplier_categories: cleanList }
        : { invoice_categories: cleanList };

      await financeApi.updateSettings(payload);

      if (onCategoriesSaved) {
        onCategoriesSaved(cleanList, lastAddedId || undefined);
      }

      onClose();
    } catch (err: any) {
      console.error('Failed to save categories', err);
      setError(err?.response?.data?.detail || 'Failed to save categories. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Notifications */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Add Category Form */}
          <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-200/70">
            <label className="block text-xs font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
              <FolderPlus className="w-3.5 h-3.5 text-teal-600" /> Add New Category
            </label>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder={
                    isSupplier
                      ? 'e.g. Balloon Safari / Air Charter, Cultural Troupe...'
                      : 'e.g. Visa Fees, Boat Safari, Travel Insurance...'
                  }
                  className="w-full px-3.5 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </form>
            {newLabel.trim() && (
              <p className="text-[11px] text-gray-500 mt-1.5">
                Key slug: <span className="font-mono text-teal-800">{slugifyCategory(newLabel)}</span>
              </p>
            )}
          </div>

          {/* List of categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Current Categories ({categories.length})
              </span>
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="text-[11px] text-gray-500 hover:text-teal-700 flex items-center gap-1 font-medium transition"
              >
                <RotateCcw className="w-3 h-3" /> Reset Defaults
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-400 text-xs">Loading categories...</div>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const isEditing = editingId === cat.id;
                  const isRecentlyAdded = lastAddedId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                        isRecentlyAdded
                          ? 'bg-teal-50/50 border-teal-200'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <input
                            type="text"
                            value={editingLabel}
                            onChange={(e) => setEditingLabel(e.target.value)}
                            className="flex-1 px-2.5 py-1 text-xs border border-teal-500 rounded-lg focus:outline-none bg-white font-medium"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(cat.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat.id)}
                            className="p-1 text-teal-700 hover:bg-teal-100 rounded"
                            title="Save name"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                            <span className="font-semibold text-gray-900 truncate">{cat.label}</span>
                            <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                              {cat.id}
                            </span>
                            {cat.is_default && (
                              <span className="text-[10px] text-gray-500 bg-gray-50 border border-gray-200 px-1.5 py-0.2 rounded-full shrink-0">
                                Default
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(cat)}
                              className="p-1 text-gray-400 hover:text-teal-700 hover:bg-gray-100 rounded transition"
                              title="Edit label"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                              title="Delete category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
            Changes sync to system finance settings.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Apply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
