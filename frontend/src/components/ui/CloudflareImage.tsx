import React, { useState, useEffect } from 'react';
import { useSignedUrl } from '../../lib/hooks/useCloudflareImages';

// Get the Cloudflare Images delivery URL from environment variables
const CLOUDFLARE_DELIVERY_URL = import.meta.env.VITE_CLOUDFLARE_IMAGES_DELIVERY_URL || 'https://imagedelivery.net/4J4CgzUI_LpQRpA_N1TErQ';

interface CloudflareImageProps {
  imageId: string;
  variant?: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  requireSignedUrl?: boolean;
  deliveryUrl?: string;
  onError?: (error: any) => void;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  placeholder?: string;
}

const CloudflareImage: React.FC<CloudflareImageProps> = ({
  imageId,
  variant = 'medium', // Use 'medium' as default which doesn't require a token
  alt = '',
  className = '',
  width,
  height,
  requireSignedUrl = false,
  deliveryUrl,
  onError,
  objectFit = 'cover',
  placeholder = 'https://placehold.co/600x400?text=Image+Not+Found',
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const signedUrlMutation = useSignedUrl();
  
  useEffect(() => {
    const loadImage = async () => {
      if (!imageId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        if (requireSignedUrl) {
          // Get a signed URL for the image
          const response = await signedUrlMutation.mutateAsync({
            image_id: imageId,
            variant_name: variant,
            expiry_minutes: 60, // URL valid for 1 hour
          });
          
          setImageUrl(response.url);
        } else {
          // Construct the direct URL
          // If deliveryUrl is provided, use it, otherwise use the environment variable
          const baseUrl = deliveryUrl || CLOUDFLARE_DELIVERY_URL;
          setImageUrl(`${baseUrl}/${imageId}/${variant}`);
        }
        
        setIsLoading(false);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load image';
        setError(errorMessage);
        setIsLoading(false);
        if (onError) onError(err);
      }
    };
    
    loadImage();
  }, [imageId, variant, requireSignedUrl, deliveryUrl, signedUrlMutation, onError]);
  
  const handleImageError = () => {
    setError('Failed to load image');
    if (onError) onError(new Error('Failed to load image'));
  };
  
  if (isLoading) {
    return (
      <div 
        className={`cloudflare-image-loading ${className}`}
        style={{ 
          width: width || '100%', 
          height: height || '100%',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg 
          className="animate-spin h-8 w-8 text-gray-400" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }
  
  if (error || !imageUrl) {
    return (
      <img
        src={placeholder}
        alt={alt}
        className={`cloudflare-image-error ${className}`}
        style={{ 
          width: width || '100%', 
          height: height || '100%',
          objectFit
        }}
      />
    );
  }
  
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`cloudflare-image ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || '100%',
        objectFit
      }}
      onError={handleImageError}
    />
  );
};

export default CloudflareImage;
