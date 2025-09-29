import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateContent, useUpdateContent, useContent } from '../../../lib/hooks/useContent';
import TinyMCEEditor from '../../../components/ui/TinyMCEEditor';

const contentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug must be less than 100 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  content: z.string().min(1, 'Content is required'),
  meta_title: z.string().max(200, 'Meta title must be less than 200 characters').optional(),
  meta_description: z.string().max(500, 'Meta description must be less than 500 characters').optional(),
  is_published: z.boolean(),
});

type ContentFormData = z.infer<typeof contentSchema>;

interface ContentFormProps {
  initialData?: {
    id: number;
    title: string;
    slug: string;
    content: string;
    meta_title?: string;
    meta_description?: string;
    is_published: boolean;
  };
}

const ContentForm: React.FC<ContentFormProps> = ({ initialData }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createContentMutation = useCreateContent();
  const updateContentMutation = useUpdateContent();

  const { data: existingContent } = useContent(isEditing ? parseInt(id!) : undefined);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      meta_title: '',
      meta_description: '',
      is_published: false,
    },
  });

  const title = watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !isEditing) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', generatedSlug);
    }
  }, [title, setValue, isEditing]);

  // Load existing data for editing
  useEffect(() => {
    if (isEditing && existingContent) {
      reset({
        title: existingContent.title,
        slug: existingContent.slug,
        content: existingContent.content,
        meta_title: existingContent.meta_title || '',
        meta_description: existingContent.meta_description || '',
        is_published: existingContent.is_published,
      });
    } else if (initialData) {
      reset({
        title: initialData.title,
        slug: initialData.slug,
        content: initialData.content,
        meta_title: initialData.meta_title || '',
        meta_description: initialData.meta_description || '',
        is_published: initialData.is_published,
      });
    }
  }, [existingContent, initialData, isEditing, reset]);

  const onSubmit = async (data: ContentFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateContentMutation.mutateAsync({
          id: parseInt(id!),
          data,
        });
      } else {
        await createContentMutation.mutateAsync(data);
      }
      navigate('/admin/content');
    } catch (error) {
      console.error('Error saving content page:', error);
      alert('Failed to save content page. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? 'Edit Content Page' : 'Create Content Page'}
            </h1>
            <p className="text-gray-600">
              {isEditing
                ? 'Update your content page information and settings.'
                : 'Create a new content page for your website with rich formatting and SEO optimization.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-3">
                Page Title *
              </label>
              <input
                type="text"
                id="title"
                {...register('title')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter an engaging page title"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-semibold text-gray-900 mb-3">
                URL Slug *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">/</span>
                </div>
                <input
                  type="text"
                  id="slug"
                  {...register('slug')}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="page-slug"
                />
              </div>
              {errors.slug && (
                <p className="mt-2 text-sm text-red-600">{errors.slug.message}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                URL-friendly identifier (auto-generated from title)
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Content</h2>
            <p className="text-gray-600">Write your content using the rich text editor below.</p>
          </div>

          <Controller
            name="content"
            control={control}
            render={({ field, fieldState }) => (
              <TinyMCEEditor
                value={field.value}
                onChange={field.onChange}
                label=""
                placeholder="Start writing your content here..."
                height={600}
                maxLength={50000}
                error={fieldState.error?.message}
                helperText="Use the rich text editor to format your content with headings, lists, links, images, and more."
                required
              />
            )}
          />
        </div>

                  {/* SEO Settings */}
        {/* SEO & Settings Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">SEO & Publishing Settings</h2>
            <p className="text-gray-600">Optimize your page for search engines and control its visibility.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Meta Title */}
            <div>
              <label htmlFor="meta_title" className="block text-sm font-semibold text-gray-900 mb-3">
                Meta Title
              </label>
              <input
                type="text"
                id="meta_title"
                {...register('meta_title')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Custom title for search engines (optional)"
              />
              {errors.meta_title && (
                <p className="mt-2 text-sm text-red-600">{errors.meta_title.message}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Leave blank to use the page title
              </p>
            </div>

            {/* Publishing Options */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Publishing Status
              </label>
              <div className="flex items-center space-x-3">
                <input
                  id="is_published"
                  type="checkbox"
                  {...register('is_published')}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div>
                  <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                    Publish immediately
                  </label>
                  <p className="text-sm text-gray-500">
                    Make this page visible to the public
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Meta Description */}
          <div className="mt-6">
            <label htmlFor="meta_description" className="block text-sm font-semibold text-gray-900 mb-3">
              Meta Description
            </label>
            <textarea
              id="meta_description"
              rows={4}
              {...register('meta_description')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
              placeholder="Brief description for search engines (optional)"
            />
            {errors.meta_description && (
              <p className="mt-2 text-sm text-red-600">{errors.meta_description.message}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Appears in search results. Leave blank for automatic generation.
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/content')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Page' : 'Create Page')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentForm;