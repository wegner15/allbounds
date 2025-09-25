import React from 'react';
import DOMPurify from 'dompurify';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ 
  content, 
  className = '' 
}) => {
  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'div', 'span', 'table', 'thead', 
      'tbody', 'tr', 'td', 'th', 'hr', 'pre', 'code', 'sup', 'sub'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style',
      'width', 'height', 'colspan', 'rowspan'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-: ]|$))/i
  });

  return (
    <div 
      className={`prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-teal prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-blockquote:text-gray-600 prose-blockquote:border-teal prose-img:rounded-lg prose-img:shadow-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

// Fallback component for when content is plain text
export const TextDisplay: React.FC<RichTextDisplayProps> = ({ 
  content, 
  className = '' 
}) => {
  // Check if content contains HTML tags
  const hasHtmlTags = /<[^>]*>/g.test(content);
  
  if (hasHtmlTags) {
    return <RichTextDisplay content={content} className={className} />;
  }
  
  // Render as plain text with basic formatting
  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      {content.split('\n').map((paragraph, index) => (
        paragraph.trim() ? (
          <p key={index} className="text-gray-700 leading-relaxed mb-4">
            {paragraph}
          </p>
        ) : (
          <br key={index} />
        )
      ))}
    </div>
  );
};
