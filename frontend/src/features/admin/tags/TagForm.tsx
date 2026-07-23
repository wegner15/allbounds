import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { ContentTag, ContentTagCreate, ContentTagUpdate } from '../../../lib/types/content-tag';

interface TagFormProps {
  initialData?: ContentTag;
  onSubmit: (data: ContentTagCreate | ContentTagUpdate) => Promise<void>;
  isSubmitting: boolean;
}

const TAG_CATEGORIES = [
  { value: 'style', label: 'Style' },
  { value: 'vibe', label: 'Vibe' },
  { value: 'activity_type', label: 'Activity Type' },
  { value: 'destination_type', label: 'Destination Type' },
  { value: 'budget', label: 'Budget' },
  { value: 'duration', label: 'Duration' },
  { value: 'general', label: 'General' },
];

const PRESET_COLORS = [
  '#0d9488', // teal
  '#7c3aed', // purple
  '#d97706', // amber
  '#dc2626', // red
  '#16a34a', // green
  '#2563eb', // blue
  '#db2777', // pink
  '#9333ea', // violet
  '#ea580c', // orange
  '#64748b', // slate
];

const TagForm: React.FC<TagFormProps> = ({ initialData, onSubmit, isSubmitting }) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    category: initialData?.category || 'general',
    icon: initialData?.icon || '',
    color: initialData?.color || '',
    order_index: initialData?.order_index ?? 0,
    is_active: initialData?.is_active ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from name (create only)
  useEffect(() => {
    if (!isEdit && form.name) {
      setForm((prev) => ({
        ...prev,
        slug: form.name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-'),
      }));
    }
  }, [form.name, isEdit]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.slug.trim()) newErrors.slug = 'Slug is required.';
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug))
      newErrors.slug = 'Slug must be lowercase letters, numbers, and hyphens only.';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    setErrors({});
    await onSubmit({
      ...form,
      color: form.color || undefined,
      icon: form.icon || undefined,
      description: form.description || undefined,
    });
  };

  const inputClass = (field: string) =>
    `block w-full px-4 py-2.5 sm:text-sm border-0 rounded-lg shadow-sm ring-1 ring-inset transition-all duration-200 focus:ring-2 ${
      errors[field]
        ? 'ring-red-300 bg-red-50 focus:ring-red-500'
        : 'ring-gray-300 bg-white focus:ring-teal'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
          Tag Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder='e.g. "Luxury", "Adventure", "Beach"'
          className={inputClass('name')}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
          placeholder="e.g. luxury"
          className={inputClass('slug')}
        />
        {errors.slug ? (
          <p className="mt-1 text-xs text-red-600">{errors.slug}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">Used in URLs for filtering: ?tag=your-slug</p>
        )}
      </div>

      {/* Category & Icon (2-col) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className={inputClass('category')}
          >
            {TAG_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">Groups tags for admins &amp; filter UIs.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Icon <span className="text-gray-400 font-normal">(emoji / optional)</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-3xl leading-none w-10 h-10 flex items-center justify-center bg-gray-50 ring-1 ring-gray-200 rounded-lg">
              {form.icon || '🏷️'}
            </span>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
              placeholder="e.g. 🏖️"
              maxLength={4}
              className={`${inputClass('icon')} flex-1`}
            />
          </div>
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
          Color <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm((p) => ({ ...p, color: c }))}
              className={`w-7 h-7 rounded-full border-2 transition-all ${
                form.color === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
          {form.color && !PRESET_COLORS.includes(form.color) && (
            <div
              className="w-7 h-7 rounded-full border-2 border-gray-900"
              style={{ backgroundColor: form.color }}
            />
          )}
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, color: '' }))}
            className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 text-gray-400 text-xs flex items-center justify-center hover:border-gray-400"
            title="Clear color"
          >
            ✕
          </button>
        </div>
        <input
          type="text"
          value={form.color}
          onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
          placeholder="#0d9488 — or leave blank"
          className={inputClass('color')}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
          Description <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          rows={2}
          placeholder="Brief description of what this tag represents..."
          className={inputClass('description')}
        />
      </div>

      {/* Order Index & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Sort Order</label>
          <input
            type="number"
            min={0}
            value={form.order_index}
            onChange={(e) => setForm((p) => ({ ...p, order_index: Number(e.target.value) }))}
            className={inputClass('order_index')}
          />
          <p className="mt-1 text-xs text-gray-500">Lower numbers appear first.</p>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal"></div>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {form.is_active ? 'Active' : 'Inactive'}
            </span>
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Preview</p>
        <div className="flex flex-wrap gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white"
            style={{ backgroundColor: form.color || '#0d9488' }}
          >
            {form.icon && <span>{form.icon}</span>}
            {form.name || 'Your Tag Name'}
          </span>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Tag' : 'Create Tag'}
        </button>
      </div>
    </form>
  );
};

export default TagForm;
