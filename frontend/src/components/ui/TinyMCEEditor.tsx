import React, { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditorType } from 'tinymce';
import ImageSelector from './ImageSelector';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  label?: string;
  error?: string;
  height?: number;
  placeholder?: string;
  helperText?: string;
  maxLength?: number;
  name?: string;
  control?: any; // For react-hook-form integration
  required?: boolean;
  disabled?: boolean;
}

const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({
  value,
  onChange,
  label,
  error,
  height = 400,
  placeholder = 'Enter your content here...',
  helperText,
  maxLength,
  name,
  control,
  required = false,
  disabled = false,
}) => {
  const editorRef = useRef<TinyMCEEditorType | null>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);

  // Handle image selection from custom picker
  const handleImageSelected = (imageId: string) => {
    if (editorRef.current && imageId) {
      const imageUrl = getImageUrlWithFallback(imageId, IMAGE_VARIANTS.MEDIUM);
      if (imageUrl) {
        editorRef.current.insertContent(`<img src="${imageUrl}" alt="" />`);
      }
    }
    setShowImageSelector(false);
  };

  // TinyMCE configuration - simplified for free version
  const editorConfig = {
    height,
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
        font-size: 14px;
        line-height: 1.6;
        color: #374151;
      }
      p { margin: 0 0 1rem 0; }
      h1, h2, h3, h4, h5, h6 {
        color: #1f2937;
        font-weight: 600;
        margin: 1.5rem 0 0.5rem 0;
      }
      h1 { font-size: 2rem; }
      h2 { font-size: 1.5rem; }
      h3 { font-size: 1.25rem; }
      ul, ol { padding-left: 1.5rem; margin: 1rem 0; }
    `,
    placeholder,
    branding: false,
    promotion: false,
    setup: (editor: any) => {
      editorRef.current = editor;

      // Add custom image button that only allows uploads
      editor.ui.registry.addButton('customimage', {
        text: 'Image',
        icon: 'image',
        tooltip: 'Insert image',
        onAction: () => setShowImageSelector(true)
      });
    }
  };

  // Handle editor change
  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-semibold text-gray-800">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {maxLength && (
            <span className="text-xs text-gray-500 font-medium">
              {value?.length || 0}/{maxLength} characters
            </span>
          )}
        </div>
      )}

      <div className="tinymce-wrapper">
        <Editor
          tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js"
          value={value}
          onEditorChange={handleEditorChange}
          disabled={disabled}
          init={editorConfig}
        />
      </div>

      {error ? (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-2 text-xs text-gray-500">{helperText}</p>
      ) : null}

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
              helperText="Select an image to insert into the editor"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TinyMCEEditor;