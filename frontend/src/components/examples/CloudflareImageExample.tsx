import React, { useState } from 'react';
import CloudflareImage from '../ui/CloudflareImage';
import CloudflareImageUpload from '../ui/CloudflareImageUpload';

// Example delivery URL from environment variables
const deliveryUrl = import.meta.env.VITE_CLOUDFLARE_IMAGES_DELIVERY_URL;

interface CloudflareImageExampleProps {
  initialImageId?: string;
}

const CloudflareImageExample: React.FC<CloudflareImageExampleProps> = ({ 
  initialImageId = '' 
}) => {
  const [imageId, setImageId] = useState<string>(initialImageId);
  const [selectedVariant, setSelectedVariant] = useState<string>('public');
  
  // Common image variants
  const variants = [
    { id: 'public', name: 'Original' },
    { id: 'thumbnail', name: 'Thumbnail' },
    { id: 'medium', name: 'Medium' },
    { id: 'large', name: 'Large' }
  ];

  // Handle image upload completion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUploadComplete = (imageData: any) => {
    if (imageData && imageData.id) {
      setImageId(imageData.id);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Cloudflare Image Example</h2>
      
      {/* Image Upload Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-2">Upload an Image</h3>
        <CloudflareImageUpload 
          onUploadComplete={handleUploadComplete}
          onUploadError={(error) => console.error('Upload error:', error)}
          buttonText="Upload New Image"
          className="mb-4"
        />
        
        <div className="text-sm text-gray-500">
          Upload an image to see it displayed below with different variants.
        </div>
      </div>
      
      {/* Image Display Section */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-2">Image Preview</h3>
        
        {/* Variant Selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          {variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => setSelectedVariant(variant.id)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedVariant === variant.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {variant.name}
            </button>
          ))}
        </div>
        
        {/* Image Display */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-4">
          {imageId ? (
            <div className="flex flex-col items-center">
              <CloudflareImage
                imageId={imageId}
                variant={selectedVariant}
                alt="Uploaded image preview"
                className="max-w-full max-h-96 object-contain mb-2"
                deliveryUrl={deliveryUrl}
                objectFit="contain"
              />
              <div className="text-sm text-gray-500 mt-2">
                Image ID: {imageId} | Variant: {selectedVariant}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No image uploaded yet</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Usage Examples Section */}
      <div>
        <h3 className="text-lg font-medium mb-2">Usage Examples</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-sm overflow-x-auto">
            {`// Basic usage
<CloudflareImage
  imageId="${imageId || 'your-image-id'}"
  variant="public"
  alt="Image description"
/>

// With custom dimensions and styling
<CloudflareImage
  imageId="${imageId || 'your-image-id'}"
  variant="thumbnail"
  alt="Thumbnail image"
  width={200}
  height={150}
  className="rounded-lg shadow-md"
/>

// With object fit and error handling
<CloudflareImage
  imageId="${imageId || 'your-image-id'}"
  variant="medium"
  alt="Medium image"
  objectFit="cover"
  onError={(error) => console.error('Image error:', error)}
/>

// With signed URL for private images
<CloudflareImage
  imageId="${imageId || 'your-image-id'}"
  variant="large"
  alt="Private image"
  requireSignedUrl={true}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CloudflareImageExample;
