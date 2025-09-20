import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import type { BlogPost, BlogPostCreateInput, BlogPostUpdateInput } from '../../../lib/hooks/useBlogs';

interface BlogFormProps {
  initialData?: BlogPost;
  onSubmit: (data: BlogPostCreateInput | BlogPostUpdateInput) => void;
  isLoading: boolean;
}

const BlogForm: React.FC<BlogFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    tags: [] as string[],
    slug: ''
  });
  const [newTag, setNewTag] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData(prev => ({ ...prev, content: html }));
    },
  });

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      const newFormData = {
        title: initialData.title || '',
        slug: initialData.slug || '',
        summary: initialData.summary || '',
        content: initialData.content || '',
        tags: initialData.tags?.map(tag => tag.name) || [],
      };
      setFormData(newFormData);
      if (editor && initialData.content) {
        editor.commands.setContent(initialData.content);
      }
    }
  }, [initialData, editor]);

  // Tiptap toolbar functions
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleStrike = () => editor?.chain().focus().toggleStrike().run();
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
  const setHeading = (level: 1 | 2 | 3) => editor?.chain().focus().toggleHeading({ level }).run();
  const setParagraph = () => editor?.chain().focus().setParagraph().run();

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: !initialData ? generateSlug(title) : prev.slug
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
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

            {/* Title */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-3">
                Post Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Enter an engaging title for your blog post..."
                className="w-full px-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-gray-400"
                required
              />
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
              <label htmlFor="summary" className="block text-sm font-semibold text-gray-900 mb-3">
                Post Summary
              </label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="Write a compelling summary that will appear in previews and search results..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-colors placeholder-gray-400"
              />
              <p className="mt-2 text-sm text-gray-500">
                A good summary helps readers understand what your post is about and improves SEO.
              </p>
            </div>
          </div>

          {/* Content Editor Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Post Content *
              </label>
              <p className="text-sm text-gray-600">
                Write your blog post content using the rich text editor below.
              </p>
            </div>
            
            {/* Enhanced Toolbar */}
            {editor && (
              <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Text Formatting */}
                  <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
                    <button
                      type="button"
                      onClick={toggleBold}
                      className={`p-2 rounded-md transition-colors ${
                        editor.isActive('bold') 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Bold"
                    >
                      <svg className="w-4 h-4 font-bold" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 4v12h4.5c2.5 0 4.5-2 4.5-4.5 0-1.5-.8-2.8-2-3.5C14.2 7.2 15 5.9 15 4.5 15 2 13 0 10.5 0H6v4zm3 0h1.5C11.3 4 12 4.7 12 5.5S11.3 7 10.5 7H9V4zm0 5h2c1.1 0 2 .9 2 2s-.9 2-2 2H9V9z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={toggleItalic}
                      className={`p-2 rounded-md transition-colors ${
                        editor.isActive('italic') 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Italic"
                    >
                      <svg className="w-4 h-4 italic" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 1h6v2H12l-2 12h2v2H6v-2h2L10 3H8V1z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={toggleStrike}
                      className={`p-2 rounded-md transition-colors ${
                        editor.isActive('strike') 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Strikethrough"
                    >
                      <span className="text-sm font-medium line-through">S</span>
                    </button>
                  </div>

                  {/* Headings */}
                  <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
                    <button
                      type="button"
                      onClick={() => setHeading(1)}
                      className={`px-3 py-2 text-sm font-bold rounded-md transition-colors ${
                        editor.isActive('heading', { level: 1 }) 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Heading 1"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeading(2)}
                      className={`px-3 py-2 text-sm font-bold rounded-md transition-colors ${
                        editor.isActive('heading', { level: 2 }) 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeading(3)}
                      className={`px-3 py-2 text-sm font-bold rounded-md transition-colors ${
                        editor.isActive('heading', { level: 3 }) 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={setParagraph}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        editor.isActive('paragraph') 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Paragraph"
                    >
                      P
                    </button>
                  </div>

                  {/* Lists */}
                  <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
                    <button
                      type="button"
                      onClick={toggleBulletList}
                      className={`p-2 rounded-md transition-colors ${
                        editor.isActive('bulletList') 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Bullet List"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 6a2 2 0 100-4 2 2 0 000 4zM4 12a2 2 0 100-4 2 2 0 000 4zM4 18a2 2 0 100-4 2 2 0 000 4zM8 5h10v2H8V5zM8 11h10v2H8v-2zM8 17h10v2H8v-2z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={toggleOrderedList}
                      className={`p-2 rounded-md transition-colors ${
                        editor.isActive('orderedList') 
                          ? 'bg-blue-500 text-white shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Numbered List"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4h1v1H3V4zm0 3h1v1H3V7zm0 3h1v1H3v-1zm0 3h1v1H3v-1zM7 4h11v2H7V4zm0 4h11v2H7V8zm0 4h11v2H7v-2zm0 4h11v2H7v-2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Editor Content Area */}
            <div className="relative">
              <EditorContent 
                editor={editor} 
                className="prose prose-lg max-w-none px-8 py-8 min-h-[500px] focus-within:bg-white"
                style={{
                  fontSize: '16px',
                  lineHeight: '1.7',
                }}
              />
              {(!editor?.getText() || editor?.getText().trim() === '') && (
                <div className="absolute top-8 left-8 pointer-events-none text-gray-400 text-lg">
                  Start writing your blog post here...
                </div>
              )}
            </div>
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

          {/* Form Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
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
