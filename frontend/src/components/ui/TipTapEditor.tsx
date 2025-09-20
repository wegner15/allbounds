import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Controller } from 'react-hook-form';
import CloudflareImageUpload from './CloudflareImageUpload';

import './TipTapEditorStyles.css';

interface TipTapEditorProps {
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
}

const MenuBar = ({ editor, onImageClick }: { editor: any; onImageClick: () => void }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-menu-bar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        type="button"
        title="Bold"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8z" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        type="button"
        title="Italic"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        type="button"
        title="Heading 1"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        type="button"
        title="Heading 2"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        type="button"
        title="Bullet List"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M8 4h13v2H8V4zM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
        type="button"
        title="Ordered List"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M8 4h13v2H8V4zM5 3v3h1v1H3V6h1V4H3V3h2zM3 14v-2.5h2V11H3v-1h3v2.5H4v.5h2v1H3zm2 5.5H3v-1h2V18H3v-1h3v4H3v-1h2v-.5zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" />
        </svg>
      </button>
      <button
        onClick={() => {
          const url = window.prompt('Enter the URL of the link:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={editor.isActive('link') ? 'is-active' : ''}
        type="button"
        title="Link"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z" />
        </svg>
      </button>
      <button
        onClick={onImageClick}
        type="button"
        title="Add Image"
        className="image-button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
        </svg>
        <span className="image-button-text">Add Image</span>
      </button>
    </div>
  );
};

const TipTapEditor: React.FC<TipTapEditorProps> = ({
  value,
  onChange,
  label,
  error,
  height = 300,
  placeholder = 'Enter your content here...',
  helperText,
  maxLength,
  name,
  control,
  required = false,
}) => {
  const [editorContent, setEditorContent] = useState(value || '');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Function to strip HTML tags for character count
  const stripHtml = (html: string) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    
    // Remove all image elements before counting text
    const images = tmp.querySelectorAll('img');
    images.forEach(img => img.remove());
    
    return tmp.textContent || tmp.innerText || '';
  };

  const textLength = editorContent ? stripHtml(editorContent).length : 0;

  // Initialize editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setEditorContent(html);
      if (typeof onChange === 'function') {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editable',
        'data-placeholder': placeholder,
      },
    },
  });

  // Update content when value prop changes
  useEffect(() => {
    if (editor && value !== editorContent) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // Handle image insertion
  useEffect(() => {
    if (editor && selectedImageId) {
      const imageUrl = `${import.meta.env.VITE_CLOUDFLARE_IMAGES_DELIVERY_URL}/${selectedImageId}/public`;
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setSelectedImageId(null);
      setShowImagePicker(false);
    }
  }, [selectedImageId, editor]);

  // If using react-hook-form with Controller
  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          // Function to strip HTML tags for character count
          const stripHtml = (html: string) => {
            if (!html) return '';
            const tmp = document.createElement('DIV');
            tmp.innerHTML = html;
            
            // Remove all image elements before counting text
            const images = tmp.querySelectorAll('img');
            images.forEach(img => img.remove());
            
            return tmp.textContent || tmp.innerText || '';
          };
          
          const textLength = field.value ? stripHtml(field.value).length : 0;
          
          // Initialize editor
          const editor = useEditor({
            extensions: [
              StarterKit,
              Link.configure({
                openOnClick: false,
              }),
              Image.configure({
                HTMLAttributes: {
                  class: 'tiptap-image',
                },
              }),
            ],
            content: field.value,
            onUpdate: ({ editor }) => {
              const html = editor.getHTML();
              if (typeof field.onChange === 'function') {
                field.onChange(html);
              }
            },
            editorProps: {
              attributes: {
                class: 'tiptap-editable',
                'data-placeholder': placeholder,
              },
            },
          });
          
          const [showImagePicker, setShowImagePicker] = useState(false);
          const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
          
          // Handle image insertion
          useEffect(() => {
            if (editor && selectedImageId) {
              const imageUrl = `${import.meta.env.VITE_CLOUDFLARE_IMAGES_DELIVERY_URL}/${selectedImageId}/public`;
              editor.chain().focus().setImage({ src: imageUrl }).run();
              setSelectedImageId(null);
              setShowImagePicker(false);
            }
          }, [selectedImageId, editor]);
          
          return (
            <div className="tiptap-editor w-full">
              {label && (
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-gray-800">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  {maxLength && (
                    <span className="text-xs text-gray-500 font-medium">
                      {textLength}/{maxLength} characters
                    </span>
                  )}
                </div>
              )}
              <div className="mt-2 rounded-lg overflow-hidden transition-all duration-200 w-full">
                <MenuBar editor={editor} onImageClick={() => setShowImagePicker(true)} />
                <div className="tiptap-content-wrapper w-full" style={{ height: `${height}px` }}>
                  <EditorContent editor={editor} className="tiptap-content w-full" />
                </div>
              </div>
              
              {/* Image Picker Modal */}
              {showImagePicker && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Upload an Image</h3>
                      <button 
                        onClick={() => setShowImagePicker(false)}
                        className="text-gray-500 hover:text-gray-700"
                        type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Upload new image section */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Upload an image</h4>
                      <CloudflareImageUpload
                        onUploadComplete={(imageData) => {
                          // Immediately use the uploaded image
                          if (imageData?.id) {
                            // Set the selected image ID which will trigger the image insertion
                            setSelectedImageId(imageData.id);
                            
                            // Close the modal after a short delay to allow the user to see the upload completed
                            setTimeout(() => {
                              setShowImagePicker(false);
                            }, 500);
                          }
                        }}
                        buttonText="Choose Image to Upload"
                        className="w-full"
                        maxSizeMB={5}
                      />
                    </div>
                    
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={() => setShowImagePicker(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (selectedImageId) {
                            // This will trigger the effect to insert the image
                            setSelectedImageId(selectedImageId);
                          } else {
                            setShowImagePicker(false);
                          }
                        }}
                        disabled={!selectedImageId}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal hover:bg-teal-dark disabled:opacity-50"
                        type="button"
                      >
                        Insert Image
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {fieldState.error ? (
                <p className="mt-2 text-sm text-red-600 font-medium">{fieldState.error.message}</p>
              ) : helperText ? (
                <p className="mt-2 text-xs text-gray-500">{helperText}</p>
              ) : null}
            </div>
          );
        }}
      />
    );
  }

  // Regular usage without react-hook-form
  return (
    <div className="tiptap-editor w-full">
      {label && (
        <div className="flex justify-between items-center">
          <label className="block text-sm font-semibold text-gray-800">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {maxLength && (
            <span className="text-xs text-gray-500 font-medium">
              {textLength}/{maxLength} characters
            </span>
          )}
        </div>
      )}
      <div className="mt-2 rounded-lg overflow-hidden transition-all duration-200 w-full">
        <MenuBar editor={editor} onImageClick={() => setShowImagePicker(true)} />
        <div className="tiptap-content-wrapper w-full" style={{ height: `${height}px` }}>
          <EditorContent editor={editor} className="tiptap-content w-full" />
        </div>
      </div>
      
      {/* Image Picker Modal */}
      {showImagePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Upload an Image</h3>
              <button 
                onClick={() => setShowImagePicker(false)}
                className="text-gray-500 hover:text-gray-700"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Upload new image section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Upload an image</h4>
              <CloudflareImageUpload
                onUploadComplete={(imageData) => {
                  // Immediately use the uploaded image
                  if (imageData?.id) {
                    // Set the selected image ID which will trigger the image insertion
                    setSelectedImageId(imageData.id);
                    
                    // Close the modal after a short delay to allow the user to see the upload completed
                    setTimeout(() => {
                      setShowImagePicker(false);
                    }, 500);
                  }
                }}
                buttonText="Choose Image to Upload"
                className="w-full"
                maxSizeMB={5}
              />
            </div>
            
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowImagePicker(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedImageId) {
                    // This will trigger the effect to insert the image
                    setSelectedImageId(selectedImageId);
                  } else {
                    setShowImagePicker(false);
                  }
                }}
                disabled={!selectedImageId}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal hover:bg-teal-dark disabled:opacity-50"
                type="button"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
      
      {error ? (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-2 text-xs text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default TipTapEditor;
