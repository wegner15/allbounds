import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useContentTags, useDeleteContentTag } from '../../../lib/hooks/useContentTags';
import type { ContentTag } from '../../../lib/types/content-tag';
import Button from '../../../components/ui/Button';

const CATEGORY_LABELS: Record<string, string> = {
  style: 'Style',
  vibe: 'Vibe',
  activity_type: 'Activity Type',
  destination_type: 'Destination Type',
  budget: 'Budget',
  duration: 'Duration',
  general: 'General',
};

const TagsListPage: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const { data: tags, isLoading, error } = useContentTags({ include_inactive: true });
  const deleteMutation = useDeleteContentTag();

  const filtered = (tags || []).filter((t) => {
    const catMatch = !categoryFilter || t.category === categoryFilter;
    const activeMatch = showInactive || t.is_active;
    return catMatch && activeMatch;
  });

  const handleDelete = async (tag: ContentTag) => {
    if (!window.confirm(`Delete tag "${tag.name}"? This will remove it from all associated content.`)) return;
    try {
      await deleteMutation.mutateAsync(tag.id);
      toast.success(`Tag "${tag.name}" deleted.`);
    } catch {
      toast.error('Failed to delete tag.');
    }
  };

  const categories = Array.from(new Set((tags || []).map((t) => t.category).filter(Boolean)));

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center mb-6">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-playfair text-charcoal">Content Tags</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage shared tags used to categorize Packages, Hotels, Activities, Attractions, and Group Trips.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link to="/admin/tags/new">
              <Button variant="primary" size="md">
                + New Tag
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c!}>
                {CATEGORY_LABELS[c!] || c}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-teal focus:ring-teal"
            />
            Show inactive tags
          </label>

          <span className="ml-auto text-sm text-gray-500">{filtered.length} tag{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <div className="overflow-hidden shadow-md border border-gray-100 rounded-lg">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse text-charcoal">Loading tags...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-50 border border-red-200 rounded-md text-red-700">
              Failed to load tags.
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-10 w-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="text-gray-500 text-sm">No tags found. <Link to="/admin/tags/new" className="text-teal underline">Create one</Link>.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 sm:pl-6">Tag</th>
                  <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                  <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Slug</th>
                  <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Order</th>
                  <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: tag.color || '#64748b' }}
                        >
                          {tag.icon && <span>{tag.icon}</span>}
                          {tag.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600">
                      {tag.category ? (CATEGORY_LABELS[tag.category] || tag.category) : '—'}
                    </td>
                    <td className="px-3 py-4 text-sm font-mono text-gray-500">{tag.slug}</td>
                    <td className="px-3 py-4 text-sm text-gray-500 text-center">{tag.order_index}</td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        tag.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tag.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right sm:pr-6">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/tags/${tag.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(tag)}
                          disabled={deleteMutation.isPending}
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
      </div>
    </>
  );
};

export default TagsListPage;
