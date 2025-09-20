import React from 'react';
import CloudflareImage from './CloudflareImage';

interface CloudflareImageDisplayProps {
  imageId?: string;
  variant?: string;
  alt?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  fallbackUrl?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * A component for displaying images from Cloudflare Images with fallback support.
 * This component handles displaying images from Cloudflare Images or falling back to a URL.
 */
const CloudflareImageDisplay: React.FC<CloudflareImageDisplayProps> = ({
  imageId,
  variant = 'medium', // Use 'medium' as default which doesn't require a token
  alt = '',
  className = '',
  width,
  height,
  fallbackUrl,
  objectFit = 'cover',
}) => {
  // Get the delivery URL from environment variables
  const deliveryUrl = import.meta.env.VITE_CLOUDFLARE_IMAGES_DELIVERY_URL;

  // If we have an imageId, use CloudflareImage
  if (imageId) {
    return (
      <CloudflareImage
        imageId={imageId}
        variant={variant}
        alt={alt}
        className={className}
        width={width}
        height={height}
        deliveryUrl={deliveryUrl}
        objectFit={objectFit}
      />
    );
  }
  
  // If we have a fallback URL, use a regular img tag
  if (fallbackUrl) {
    return (
      <img
        src={fallbackUrl}
        alt={alt}
        className={className}
        style={{ 
          width: width || '100%', 
          height: height || '100%',
          objectFit 
        }}
      />
    );
  }
  
  // If we have neither, show a placeholder
  return (
    <div 
      className={`bg-gray-100 flex items-center justify-center ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || '100%' 
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-10 w-10 text-gray-400" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
        />
      </svg>
    </div>
  );
};

export default CloudflareImageDisplay;
