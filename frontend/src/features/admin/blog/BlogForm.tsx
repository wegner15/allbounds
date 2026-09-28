import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import BlogInlineEditor from '../../../components/ui/BlogInlineEditor';
import ImageSelector from '../../../components/ui/ImageSelector';
import type { BlogPost, BlogPostCreateInput, BlogPostUpdateInput } from '../../../lib/hooks/useBlogs';
import { usePackages } from '../../../lib/hooks/usePackages';

interface BlogFormProps {
  initialData?: BlogPost;
  onSubmit: (data: BlogPostCreateInput | BlogPostUpdateInput) => void;
  isLoading: boolean;
  error?: string | null;
  onClearError?: () => void;
}

const BlogForm: React.FC<BlogFormProps> = ({ initialData, onSubmit, isLoading, error, onClearError }) => {
  const navigate = useNavigate();
  const { data: packages, isLoading: isLoadingPackages } = usePackages();
  const [localError, setLocalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    cover_image_id: '',
    tags: [] as string[],
    slug: '',
    package_ids: [] as number[]
  });
  const [newTag, setNewTag] = useState('');
  const [isEditing, setIsEditing] = useState(true);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      const newFormData = {
        title: initialData.title || '',
        slug: initialData.slug || '',
        summary: initialData.summary || '',
        content: initialData.content || '',
        cover_image_id: initialData.cover_image_id || '',
        tags: initialData.tags?.map(tag => tag.name) || [],
        package_ids: initialData.package_ids || initialData.packages?.map(p => p.id) || [],
      };
      setFormData(newFormData);
    }
  }, [initialData]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };



  const displayError = error || localError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    onClearError?.();

    if (!formData.title.trim()) {
      const msg = 'Please enter a title for your blog post.';
      setLocalError(msg);
      toast.error(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const strippedContent = formData.content.replace(/<[^>]*>/g, '').trim();
    if (!strippedContent && !formData.content.includes('<img')) {
      const msg = 'Please write some content for your blog post before publishing.';
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    if (formData.summary && formData.summary.length > 1000) {
      const msg = `Post summary is too long (${formData.summary.length}/1000 characters). Please shorten it to under 1000 characters before saving.`;
      setLocalError(msg);
      toast.error(msg);
      return;
    }

    const cleanedData: BlogPostCreateInput | BlogPostUpdateInput = {
      ...formData,
      title: formData.title.trim(),
      summary: formData.summary.trim() || undefined,
      slug: formData.slug.trim() || undefined,
      cover_image_id: formData.cover_image_id.trim() || undefined,
    };

    onSubmit(cleanedData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Alert Banner */}
          {displayError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-semibold text-red-800">
                    {initialData ? 'Failed to update blog post' : 'Failed to publish blog post'}
                  </h3>
                  <div className="mt-1 text-sm text-red-700 whitespace-pre-line leading-relaxed">
                    {displayError}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLocalError(null);
                    onClearError?.();
                  }}
                  className="ml-auto pl-3 text-red-400 hover:text-red-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {initialData ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h1>
              <p className="text-gray-600">
                {initialData ? 'Update your blog post content and settings.' : 'Write and publish your thoughts to the world.'}
              </p>
            </div>



            {/* Slug */}
            <div className="mb-6">
              <label htmlFor="slug" className="block text-sm font-semibold text-gray-900 mb-3">
                URL Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="url-friendly-slug"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <p className="mt-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
                <span className="font-medium">Preview URL:</span> /blog/{formData.slug || 'your-slug-here'}
              </p>
            </div>

            {/* Summary */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="summary" className="block text-sm font-semibold text-gray-900">
                  Post Summary
                </label>
                <span
                  className={`text-xs font-semibold ${
                    formData.summary.length > 1000 ? 'text-red-600 font-bold' : 'text-gray-500'
                  }`}
                >
                  {formData.summary.length} / 1000 characters
                </span>
              </div>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="Write a compelling summary that will appear in previews and search results..."
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-vertical transition-colors placeholder-gray-400 ${
                  formData.summary.length > 1000
                    ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50/30'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {formData.summary.length > 1000 ? (
                <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Summary exceeds the 1000-character limit by {formData.summary.length - 1000} characters. Please shorten it so the post can be saved.
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  A good summary helps readers understand what your post is about and improves SEO (up to 1,000 characters).
                </p>
              )}
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Cover Image
              </label>
              <ImageSelector
                initialImageId={formData.cover_image_id}
                onImageSelected={(imageId) => {
                  setFormData(prev => ({
                    ...prev,
                    cover_image_id: imageId
                  }));
                }}
                label="Select Cover Image"
                helperText="Choose an eye-catching image that represents your blog post."
              />
              {formData.cover_image_id && (
                <p className="mt-2 text-sm text-gray-600">
                  Cover image selected (ID: {formData.cover_image_id})
                </p>
              )}
            </div>
          </div>

          {/* Content Editor Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <BlogInlineEditor
              title={formData.title}
              content={formData.content}
              onTitleChange={(title) => {
                setFormData(prev => ({
                  ...prev,
                  title,
                  slug: !initialData ? generateSlug(title) : prev.slug
                }));
              }}
              onContentChange={(content) => setFormData(prev => ({ ...prev, content }))}
              isEditing={isEditing}
              onEditToggle={() => setIsEditing(!isEditing)}
            />
          </div>

          {/* Tags Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tags
              </label>
              <p className="text-sm text-gray-600">
                Add relevant tags to help readers discover your content.
              </p>
            </div>

            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter a tag..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Add Tag
              </button>
            </div>

            {/* Display tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    <span className="font-medium">{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Related Tours Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Related Tours
              </label>
              <p className="text-sm text-gray-600">
                Link relevant tours to this blog post to help readers find travel packages.
              </p>
            </div>

            {isLoadingPackages ? (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-charcoal"></div>
                <span>Loading tours...</span>
              </div>
            ) : packages && packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map((pkg) => {
                  const checkboxId = `package-${pkg.id}`;
                  const isChecked = formData.package_ids.includes(pkg.id);

                  return (
                    <div key={pkg.id} className="relative flex items-start p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex h-6 items-center">
                        <input
                          id={checkboxId}
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                          checked={isChecked}
                          onChange={(e) => {
                            const currentPackages = formData.package_ids;
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                package_ids: [...currentPackages, pkg.id]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                package_ids: currentPackages.filter(id => id !== pkg.id)
                              }));
                            }
                          }}
                        />
                      </div>
                      <div className="ml-3 text-sm leading-6">
                        <label htmlFor={checkboxId} className="font-medium text-gray-900 cursor-pointer flex flex-col">
                          <span>{pkg.name}</span>
                          <span className="text-xs text-gray-500">
                            {pkg.duration_days} days • Starting from ${pkg.price}
                          </span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No tours found.</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {displayError && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-sm text-red-700">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 whitespace-pre-line leading-snug">
                  <span className="font-semibold">Unable to save: </span>
                  {displayError}
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-gray-600">
                {initialData ? 'Update your changes to save the blog post.' : 'Ready to publish your blog post?'}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/blog')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    initialData ? 'Update Post' : 'Publish Post'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;
