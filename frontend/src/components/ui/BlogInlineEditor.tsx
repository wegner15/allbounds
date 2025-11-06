import React, { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditorType } from 'tinymce';
import { RichTextDisplay } from './RichTextDisplay';
import ImageSelector from './ImageSelector';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

interface BlogInlineEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  isEditing?: boolean;
  onEditToggle?: () => void;
}

const BlogInlineEditor: React.FC<BlogInlineEditorProps> = ({
  title,
  content,
  onTitleChange,
  onContentChange,
  isEditing = false,
  onEditToggle,
}) => {
  const contentEditorRef = useRef<TinyMCEEditorType | null>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);

  // Handle image selection from custom picker
  const handleImageSelected = (imageId: string) => {
    console.log('Image selected:', imageId);
    if (contentEditorRef.current && imageId) {
      const imageUrl = getImageUrlWithFallback(imageId, IMAGE_VARIANTS.MEDIUM);
      console.log('Generated image URL:', imageUrl);
      if (imageUrl) {
        contentEditorRef.current.insertContent(`<img src="${imageUrl}" alt="" />`);
        console.log('Image inserted into editor');
      } else {
        console.error('Failed to generate image URL');
      }
    } else {
      console.error('Editor ref not available or no imageId');
    }
    setShowImageSelector(false);
  };

  // TinyMCE configuration for inline editing
  const baseConfig = {
    menubar: false,
    plugins: [
      'lists', 'link', 'charmap', 'preview',
      'anchor', 'searchreplace', 'code', 'fullscreen',
      'insertdatetime', 'table', 'help', 'wordcount'
    ],
    toolbar: 'undo redo | blocks | ' +
      'bold italic | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | link customimage | help',
    content_style: `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        font-size: 16px;
        line-height: 1.6;
        color: #374151;
        margin: 0;
        padding: 0;
      }
      p { margin: 0 0 1rem 0; }
      h1, h2, h3, h4, h5, h6 {
        color: #1f2937;
        font-weight: 600;
        margin: 1.5rem 0 0.5rem 0;
      }
      h1 { font-size: 2.25rem; line-height: 2.5rem; }
      h2 { font-size: 1.875rem; line-height: 2.25rem; }
      h3 { font-size: 1.5rem; line-height: 2rem; }
      ul, ol { padding-left: 1.5rem; margin: 1rem 0; }
    `,
    branding: false,
    promotion: false,
    setup: (editor: TinyMCEEditorType) => {
      // Add custom image button
      (editor as any).ui.registry.addButton('customimage', {
        text: 'Image',
        icon: 'image',
        tooltip: 'Insert image',
        onAction: () => setShowImageSelector(true)
      });
    }
  };



  const contentConfig = {
    ...baseConfig,
    inline: true,
    height: 400, // fallback for non-inline
    placeholder: 'Start writing your blog post...',
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Edit Toggle */}
      {onEditToggle && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={onEditToggle}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>
        </div>
      )}

      {/* Blog Title */}
      <div className="mb-8">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter blog title..."
            className="w-full text-4xl font-bold border-2 border-dashed border-gray-300 rounded-lg p-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          />
        ) : (
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            {title || 'Untitled Blog Post'}
          </h1>
        )}
      </div>

      {/* Blog Content */}
      <div className="prose prose-lg max-w-none">
        {isEditing ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[400px]">
            <Editor
              tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js"
              onInit={(evt, editor) => contentEditorRef.current = editor}
              value={content}
              onEditorChange={onContentChange}
              init={contentConfig}
            />
          </div>
        ) : (
          <RichTextDisplay content={content || '<p>Start writing your blog post...</p>'} />
        )}
      </div>

      {/* Image Selector Modal */}
      {showImageSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Image</h3>
              <button
                onClick={() => setShowImageSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ImageSelector
              onImageSelected={handleImageSelected}
              label=""
              helperText="Select an image to insert into the blog post"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogInlineEditor;