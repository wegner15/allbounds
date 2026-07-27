import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';
import {
  useContentTags,
  useCreateContentTag,
  useUpdateContentTag,
  useDeleteContentTag,
} from '../../../lib/hooks/useContentTags';
import type { ContentTag, ContentTagCreate, ContentTagUpdate } from '../../../lib/types/content-tag';

// Preset color options for tags
const COLOR_PRESETS = [
  { name: 'Teal', value: '#0d9488', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  { name: 'Emerald', value: '#059669', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { name: 'Blue', value: '#2563eb', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { name: 'Indigo', value: '#4f46e5', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  { name: 'Purple', value: '#7c3aed', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  { name: 'Pink', value: '#db2777', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  { name: 'Amber', value: '#d97706', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { name: 'Rose', value: '#e11d48', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  { name: 'Slate', value: '#475569', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  { name: 'Dark', value: '#1f2937', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
];

// Preset icon options
const ICON_PRESETS = [
  'tag',
  'compass',
  'umbrella',
  'mountain',
  'sun',
  'star',
  'heart',
  'leaf',
  'coffee',
  'shield',
  'camera',
  'sparkles',
  'award',
  'fire',
  'globe',
  'map',
];

// Default category list
const DEFAULT_CATEGORIES = [
  'style',
  'vibe',
  'activity_type',
  'destination_type',
  'budget',
  'duration',
  'general',
];

const TagsListPage: React.FC = () => {
  const [includeInactive, setIncludeInactive] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<ContentTag | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryName, setEditingCategoryName] = useState<{ oldName: string; newName: string } | null>(null);

  // Custom, deleted, and renamed categories state (persisted in localStorage)
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('allbounds_custom_tag_categories') || '[]');
    } catch {
      return [];
    }
  });

  const [deletedCategories, setDeletedCategories] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('allbounds_deleted_tag_categories') || '[]');
    } catch {
      return [];
    }
  });

  const [categoryRenames, setCategoryRenames] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('allbounds_tag_category_renames') || '{}');
    } catch {
      return {};
    }
  });

  // Form state for Tag Modal
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    description: string;
    category: string;
    customCategory: string;
    icon: string;
    color: string;
    order_index: number;
    is_active: boolean;
  }>({
    name: '',
    slug: '',
    description: '',
    category: 'general',
    customCategory: '',
    icon: 'tag',
    color: '#0d9488',
    order_index: 0,
    is_active: true,
  });

  // Queries & Mutations
  const { data: tags = [], isLoading, error } = useContentTags({
    include_inactive: includeInactive,
  });
  const createTagMutation = useCreateContentTag();
  const updateTagMutation = useUpdateContentTag();
  const deleteTagMutation = useDeleteContentTag();

  // Extract all unique categories (merging defaults, custom, deleted, renames, and DB tags)
  const categories = useMemo(() => {
    const set = new Set<string>();

    // 1. Add default categories (mapped or skipped if deleted)
    DEFAULT_CATEGORIES.forEach((cat) => {
      const mapped = categoryRenames[cat] || cat;
      if (!deletedCategories.includes(cat) && !deletedCategories.includes(mapped)) {
        set.add(mapped);
      }
    });

    // 2. Add custom categories
    customCategories.forEach((cat) => {
      if (!deletedCategories.includes(cat)) {
        set.add(cat);
      }
    });

    // 3. Add categories present on tags
    tags.forEach((t) => {
      if (t.category && !deletedCategories.includes(t.category)) {
        set.add(t.category);
      }
    });

    return Array.from(set).sort();
  }, [tags, customCategories, deletedCategories, categoryRenames]);

  // Filtered tags based on search and category
  const filteredTags = useMemo(() => {
    return tags.filter((tag) => {
      const matchesSearch =
        !searchQuery ||
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tag.description && tag.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || tag.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [tags, searchQuery, selectedCategory]);

  // Open modal to create a tag
  const handleOpenCreateModal = () => {
    setEditingTag(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      category: selectedCategory !== 'all' ? selectedCategory : 'general',
      customCategory: '',
      icon: 'tag',
      color: '#0d9488',
      order_index: 0,
      is_active: true,
    });
    setIsTagModalOpen(true);
  };

  // Open modal to edit a tag
  const handleOpenEditModal = (tag: ContentTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      category: tag.category || 'general',
      customCategory: '',
      icon: tag.icon || 'tag',
      color: tag.color || '#0d9488',
      order_index: tag.order_index || 0,
      is_active: tag.is_active,
    });
    setIsTagModalOpen(true);
  };

  // Generate slug automatically from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingTag ? prev.slug : generatedSlug,
    }));
  };

  // Handle Save Tag
  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Tag name is required');
      return;
    }

    const finalCategory =
      formData.category === '__new__'
        ? formData.customCategory.trim().toLowerCase().replace(/\s+/g, '_')
        : formData.category;

    if (!finalCategory) {
      toast.error('Please specify a category');
      return;
    }

    // Persist new category to customCategories if it's not already tracked
    if (!customCategories.includes(finalCategory) && !categories.includes(finalCategory)) {
      const nextCustom = Array.from(new Set([...customCategories, finalCategory]));
      setCustomCategories(nextCustom);
      localStorage.setItem('allbounds_custom_tag_categories', JSON.stringify(nextCustom));
    }

    const payload: ContentTagCreate | ContentTagUpdate = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description.trim() || undefined,
      category: finalCategory,
      icon: formData.icon || undefined,
      color: formData.color || undefined,
      order_index: formData.order_index,
      is_active: formData.is_active,
    };

    try {
      if (editingTag) {
        await updateTagMutation.mutateAsync({ id: editingTag.id, data: payload });
        toast.success('Tag updated successfully');
      } else {
        await createTagMutation.mutateAsync(payload as ContentTagCreate);
        toast.success('Tag created successfully');
      }
      setIsTagModalOpen(false);
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to save tag';
      toast.error(message);
    }
  };

  // Delete Tag
  const handleDeleteTag = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the tag "${name}"?`)) {
      try {
        await deleteTagMutation.mutateAsync(id);
        toast.success('Tag deleted successfully');
      } catch (err) {
        toast.error('Failed to delete tag');
      }
    }
  };

  // Add New Category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const cat = newCategoryName.trim().toLowerCase().replace(/\s+/g, '_');

    if (categories.includes(cat)) {
      toast.info(`Category "${cat.replace(/_/g, ' ')}" already exists!`);
      return;
    }

    if (deletedCategories.includes(cat)) {
      const nextDeleted = deletedCategories.filter((c) => c !== cat);
      setDeletedCategories(nextDeleted);
      localStorage.setItem('allbounds_deleted_tag_categories', JSON.stringify(nextDeleted));
    }

    const nextCustom = Array.from(new Set([...customCategories, cat]));
    setCustomCategories(nextCustom);
    localStorage.setItem('allbounds_custom_tag_categories', JSON.stringify(nextCustom));

    setNewCategoryName('');
    toast.success(`Created category "${cat.replace(/_/g, ' ')}". Select it when creating a tag!`);
  };

  // Bulk Edit / Rename Category
  const handleRenameCategory = async () => {
    if (!editingCategoryName || !editingCategoryName.newName.trim()) return;

    const { oldName, newName } = editingCategoryName;
    const normalizedNew = newName.trim().toLowerCase().replace(/\s+/g, '_');

    if (oldName === normalizedNew) {
      setEditingCategoryName(null);
      return;
    }

    const affectedTags = tags.filter((t) => t.category === oldName);

    try {
      if (affectedTags.length > 0) {
        toast.info(`Updating ${affectedTags.length} tag${affectedTags.length > 1 ? 's' : ''} to category "${normalizedNew.replace(/_/g, ' ')}"...`);
        for (const tag of affectedTags) {
          await updateTagMutation.mutateAsync({
            id: tag.id,
            data: { category: normalizedNew },
          });
        }
      }

      // Update custom categories
      if (customCategories.includes(oldName)) {
        const nextCustom = customCategories.map((c) => (c === oldName ? normalizedNew : c));
        setCustomCategories(nextCustom);
        localStorage.setItem('allbounds_custom_tag_categories', JSON.stringify(nextCustom));
      }

      // Track rename for default categories
      const origDefault = DEFAULT_CATEGORIES.find((d) => (categoryRenames[d] || d) === oldName) || oldName;
      if (DEFAULT_CATEGORIES.includes(origDefault)) {
        const nextRenames = { ...categoryRenames, [origDefault]: normalizedNew };
        setCategoryRenames(nextRenames);
        localStorage.setItem('allbounds_tag_category_renames', JSON.stringify(nextRenames));
      }

      // Update selectedCategory filter if active
      if (selectedCategory === oldName) {
        setSelectedCategory(normalizedNew);
      }

      toast.success(`Successfully renamed category to "${normalizedNew.replace(/_/g, ' ')}"`);
      setEditingCategoryName(null);
    } catch (err) {
      toast.error('Failed to rename category across all tags');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat: string) => {
    const affectedTags = tags.filter((t) => t.category === cat);

    if (affectedTags.length > 0) {
      if (
        !window.confirm(
          `Category "${cat.replace(/_/g, ' ')}" has ${affectedTags.length} tag(s). Are you sure you want to delete this category? The affected tags will be reassigned to "general".`
        )
      ) {
        return;
      }
      try {
        for (const tag of affectedTags) {
          await updateTagMutation.mutateAsync({
            id: tag.id,
            data: { category: 'general' },
          });
        }
      } catch (err) {
        toast.error('Failed to reassign tags when deleting category');
        return;
      }
    }

    const nextCustom = customCategories.filter((c) => c !== cat);
    setCustomCategories(nextCustom);
    localStorage.setItem('allbounds_custom_tag_categories', JSON.stringify(nextCustom));

    const nextDeleted = Array.from(new Set([...deletedCategories, cat]));
    setDeletedCategories(nextDeleted);
    localStorage.setItem('allbounds_deleted_tag_categories', JSON.stringify(nextDeleted));

    if (selectedCategory === cat) {
      setSelectedCategory('all');
    }

    toast.success(`Deleted category "${cat.replace(/_/g, ' ')}"`);
  };

  // Helper to render tag badge
  const renderTagBadge = (tag: Partial<ContentTag>) => {
    return (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
        style={{
          backgroundColor: tag.color ? `${tag.color}15` : '#0d948815',
          color: tag.color || '#0d9488',
          borderColor: tag.color ? `${tag.color}40` : '#0d948840',
        }}
      >
        {tag.icon && <i className={`fas fa-${tag.icon} mr-1.5`} />}
        {tag.name || 'Preview Tag'}
      </span>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-charcoal">Content Tags & Categories</h1>
          <p className="mt-1 text-sm text-gray-600">
            Organize dynamic tags and categories used across Packages, Hotels, Attractions, Group Trips, and Activities.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            <i className="fas fa-folder mr-2" />
            Manage Categories
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenCreateModal}
          >
            <i className="fas fa-plus mr-2" />
            Create Tag
          </Button>
        </div>
      </div>

      {/* Category Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-3 rounded-lg border text-left transition-all ${
            selectedCategory === 'all'
              ? 'bg-teal text-white border-teal shadow'
              : 'bg-white border-gray-200 text-gray-700 hover:border-teal'
          }`}
        >
          <div className="text-xs uppercase tracking-wider font-semibold opacity-80">All Tags</div>
          <div className="text-xl font-bold mt-1">{tags.length}</div>
        </button>

        {categories.map((cat) => {
          const count = tags.filter((t) => t.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-teal text-white border-teal shadow'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-teal'
              }`}
            >
              <div className="text-xs uppercase tracking-wider font-semibold opacity-80 truncate">
                {cat.replace(/_/g, ' ')}
              </div>
              <div className="text-xl font-bold mt-1">{count}</div>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tags by name, slug or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-teal focus:border-teal"
          />
        </div>

        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
          <label className="inline-flex items-center text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="mr-2 rounded border-gray-300 text-teal focus:ring-teal"
            />
            Include Inactive
          </label>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow-md border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">
            <i className="fas fa-circle-notch fa-spin text-2xl text-teal mb-2" />
            <p>Loading tags...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 text-red-700 border-b border-red-200">
            Failed to load tags from server.
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <i className="fas fa-tags text-4xl text-gray-300 mb-3" />
            <p className="text-base font-medium">No tags found</p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your search criteria or add a new tag.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tag Badge
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Order Index
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredTags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                    {renderTagBadge(tag)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs font-mono text-gray-600">
                    {tag.slug}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      {tag.category || 'general'}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {tag.description || '-'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono">
                    {tag.order_index}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        tag.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tag.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditModal(tag)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTag(tag.id, tag.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE / EDIT TAG MODAL */}
      {isTagModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setIsTagModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-lg" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingTag ? 'Edit Content Tag' : 'Create Content Tag'}
            </h2>

            <form onSubmit={handleSaveTag} className="space-y-4">
              {/* Preview */}
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Badge Preview:</span>
                {renderTagBadge({
                  name: formData.name || 'Sample Tag',
                  color: formData.color,
                  icon: formData.icon,
                })}
              </div>

              {/* Tag Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luxury Escape"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal focus:border-teal text-sm"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. luxury-escape"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal focus:border-teal text-sm font-mono"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal focus:border-teal text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </option>
                  ))}
                  <option value="__new__">+ Create New Category...</option>
                </select>

                {formData.category === '__new__' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter new category name (e.g. season)"
                    value={formData.customCategory}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customCategory: e.target.value }))
                    }
                    className="mt-2 w-full px-3 py-2 border border-teal-500 rounded-md focus:ring-teal focus:border-teal text-sm"
                  />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short explanation of what this tag represents..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal focus:border-teal text-sm"
                />
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Color
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="h-8 w-12 border border-gray-300 rounded cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-28 px-2 py-1 text-xs border border-gray-300 rounded font-mono"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, color: preset.value }))}
                      className={`h-6 w-6 rounded-full border-2 transition-transform ${
                        formData.color === preset.value
                          ? 'scale-110 border-gray-900 shadow'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon (FontAwesome)
                </label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="icon name (e.g. compass)"
                    value={formData.icon}
                    onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-teal focus:border-teal"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1 bg-gray-50 rounded border">
                  {ICON_PRESETS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, icon: iconName }))}
                      className={`px-2 py-1 rounded text-xs border flex items-center ${
                        formData.icon === iconName
                          ? 'bg-teal text-white border-teal'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-teal'
                      }`}
                    >
                      <i className={`fas fa-${iconName} mr-1`} />
                      {iconName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Index & Status */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal focus:border-teal text-sm"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="inline-flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                      }
                      className="h-4 w-4 text-teal focus:ring-teal border-gray-300 rounded mr-2"
                    />
                    Active Tag
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsTagModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={createTagMutation.isPending || updateTagMutation.isPending}
                >
                  {createTagMutation.isPending || updateTagMutation.isPending
                    ? 'Saving...'
                    : editingTag
                    ? 'Update Tag'
                    : 'Create Tag'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE CATEGORIES MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-lg" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-2">Category Management</h2>
            <p className="text-xs text-gray-500 mb-4">
              View and edit content tag category groupings.
            </p>

            {/* Add New Category Input */}
            <div className="mb-6 p-3 bg-gray-50 rounded-md border border-gray-200">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Add New Category Option
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. season or difficulty"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-teal focus:border-teal"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddCategory}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Existing Categories List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Existing Categories ({categories.length})
              </label>
              {categories.map((cat) => {
                const count = tags.filter((t) => t.category === cat).length;
                const isEditingThis = editingCategoryName?.oldName === cat;

                return (
                  <div
                    key={cat}
                    className="p-2.5 bg-white border border-gray-200 rounded-md flex items-center justify-between"
                  >
                    {isEditingThis ? (
                      <div className="flex items-center space-x-2 w-full">
                        <input
                          type="text"
                          value={editingCategoryName.newName}
                          onChange={(e) =>
                            setEditingCategoryName({
                              ...editingCategoryName,
                              newName: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleRenameCategory();
                            } else if (e.key === 'Escape') {
                              setEditingCategoryName(null);
                            }
                          }}
                          autoFocus
                          className="flex-1 px-2 py-1 text-xs border border-teal-500 rounded focus:ring-teal"
                        />
                        <Button variant="primary" size="sm" onClick={handleRenameCategory}>
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCategoryName(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="font-semibold text-sm text-gray-800">
                            {cat.replace(/_/g, ' ')}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            ({count} {count === 1 ? 'tag' : 'tags'})
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setEditingCategoryName({ oldName: cat, newName: cat.replace(/_/g, ' ') })}
                            className="text-xs text-teal hover:underline font-medium"
                          >
                            Rename All
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                            title="Delete category"
                          >
                            <i className="fas fa-trash-alt" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end">
              <Button variant="outline" size="md" onClick={() => setIsCategoryModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsListPage;
