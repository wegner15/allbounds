import React, { useState, useEffect, useRef } from 'react';
import { Controller } from 'react-hook-form';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

// Add custom styles for the editor
import './RichTextEditorStyles.css';

interface RichTextEditorProps {
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

const RichTextEditor: React.FC<RichTextEditorProps> = ({
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
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);

  
  // Initialize Quill with standard toolbar
  useEffect(() => {
    if (quillRef.current && !quillInstance.current) {
      // Define toolbar options - simplified for better appearance
      const toolbarOptions = [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'header': [1, 2, false] }],
        ['link']
      ];

      // Create Quill instance with standard toolbar
      quillInstance.current = new Quill(quillRef.current, {
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {}
          },
        },
        placeholder: placeholder,
        theme: 'snow'
      });

      // Set initial content
      if (value) {
        quillInstance.current.clipboard.dangerouslyPasteHTML(value);
      }

      // Handle text change
      quillInstance.current.on('text-change', () => {
        const html = quillInstance.current.root.innerHTML;
        setEditorContent(html);
        onChange(html);
      });
    }
    

    return () => {
      // Clean up
      if (quillInstance.current) {
        // Remove event listeners if needed
      }
    };
  }, []);

  // Update content when value prop changes
  useEffect(() => {
    if (quillInstance.current && value !== editorContent) {
      quillInstance.current.clipboard.dangerouslyPasteHTML(value || '');
    }
  }, [value]);

  // Function to strip HTML tags and image elements for character count
  const stripHtml = (html: string) => {
    if (!html) return '';
    // Create a temporary div to parse HTML
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    
    // Remove all image elements before counting text
    const images = tmp.querySelectorAll('img');
    images.forEach(img => img.remove());
    
    return tmp.textContent || tmp.innerText || '';
  };

  const textLength = editorContent ? stripHtml(editorContent).length : 0;

  // If using react-hook-form with Controller
  if (control && name) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          // Create a unique ID for this editor instance
          const editorId = `quill-editor-${name}-${Math.random().toString(36).substring(2, 9)}`;
          
          
          // Initialize Quill with standard toolbar
          useEffect(() => {
            const editorElement = document.getElementById(editorId);
            if (!editorElement) return;
            
            // Define toolbar options - simplified for better appearance
            const toolbarOptions = [
              ['bold', 'italic', 'underline'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'header': [1, 2, false] }],
              ['link']
            ];
            
            // Create Quill instance with standard toolbar
            const quill = new Quill(editorElement, {
              modules: {
                toolbar: {
                  container: toolbarOptions,
                  handlers: {}
                }
              },
              placeholder: placeholder,
              theme: 'snow'
            });
            
            // Set initial content
            if (field.value) {
              quill.clipboard.dangerouslyPasteHTML(field.value);
            }
            
            // Handle text change
            quill.on('text-change', () => {
              const html = quill.root.innerHTML;
              field.onChange(html);
            });
            
            return () => {
              // Clean up if needed
            };
          }, []);
          
          // Update content when field.value changes externally
          useEffect(() => {
            const editorElement = document.getElementById(editorId);
            if (!editorElement) return;
            
            const quillEditor = Quill.find(editorElement) as any;
            if (quillEditor && field.value !== quillEditor.root.innerHTML) {
              quillEditor.clipboard.dangerouslyPasteHTML(field.value || '');
            }
          }, [field.value]);
          
          // Function to strip HTML tags for character count
          const stripHtml = (html: string) => {
            const tmp = document.createElement('DIV');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
          };
          
          const textLength = field.value ? stripHtml(field.value).length : 0;
          
          
          return (
            <div className="rich-text-editor">
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
              <div className={`mt-2 rounded-lg overflow-hidden transition-all duration-200 ${fieldState.error ? 'ring-2 ring-red-300' : ''}`}>
                <div 
                  id={editorId} 
                  style={{ height: `${height}px`, minHeight: '200px' }}
                ></div>
                
              </div>
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
    <div className="rich-text-editor">
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
      <div className={`mt-2 rounded-lg overflow-hidden transition-all duration-200 ${error ? 'ring-2 ring-red-300' : ''}`}>
        <div 
          ref={quillRef} 
          style={{ height: `${height}px`, minHeight: '200px' }}
        ></div>
        
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-2 text-xs text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default RichTextEditor;
