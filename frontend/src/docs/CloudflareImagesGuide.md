# Cloudflare Images Integration Guide

This guide explains how to use the Cloudflare Images integration in the AllBounds application.

## Table of Contents

1. [Setup](#setup)
2. [Components](#components)
   - [CloudflareImage](#cloudflareimage)
   - [CloudflareImageUpload](#cloudflareimageupload)
   - [CloudflareImagesManager](#cloudflareimagesmanager)
3. [Hooks](#hooks)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)

## Setup

### Environment Variables

The Cloudflare Images integration requires the following environment variables:

**Backend (.env)**:
```
# Cloudflare Images Configuration
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_IMAGES_DELIVERY_URL=https://imagedelivery.net/your_account_hash
CLOUDFLARE_IMAGES_SIGNING_KEY=your_signing_key_for_private_images
```

**Frontend (.env)**:
```
VITE_CLOUDFLARE_IMAGES_DELIVERY_URL=https://imagedelivery.net/your_account_hash
```

### Variants

Before using the components, you should create image variants in your Cloudflare Images dashboard or through the admin interface. Common variants include:

- `public` - Original image (default)
- `thumbnail` - Small thumbnail (e.g., 200x200)
- `medium` - Medium-sized image (e.g., 800x600)
- `large` - Large image (e.g., 1200x900)

## Components

### CloudflareImage

The `CloudflareImage` component displays images from Cloudflare Images with support for different variants and signed URLs.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageId` | string | (required) | The ID of the image in Cloudflare Images |
| `variant` | string | `'public'` | The variant name to display |
| `alt` | string | `''` | Alt text for the image |
| `className` | string | `''` | Additional CSS classes |
| `width` | number \| string | `'100%'` | Width of the image |
| `height` | number \| string | `'100%'` | Height of the image |
| `requireSignedUrl` | boolean | `false` | Whether to use a signed URL for private images |
| `deliveryUrl` | string | `undefined` | Custom delivery URL (overrides environment variable) |
| `onError` | function | `undefined` | Error handler function |
| `objectFit` | string | `'cover'` | CSS object-fit property |
| `placeholder` | string | `'https://placehold.co/600x400?text=Image+Not+Found'` | Placeholder image URL |

#### Example

```tsx
<CloudflareImage
  imageId="2cdc28f0-017a-49c4-9ed7-87056c83901"
  variant="thumbnail"
  alt="Product thumbnail"
  className="rounded-lg"
  width={200}
  height={200}
  objectFit="cover"
/>
```

### CloudflareImageUpload

The `CloudflareImageUpload` component provides a button to upload images to Cloudflare Images.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUploadComplete` | function | `undefined` | Callback when upload completes successfully |
| `onUploadError` | function | `undefined` | Callback when upload fails |
| `requireSignedUrls` | boolean | `true` | Whether uploaded images require signed URLs |
| `metadata` | object | `{}` | Metadata to attach to the image |
| `className` | string | `''` | Additional CSS classes |
| `buttonText` | string | `'Upload Image'` | Text displayed on the upload button |
| `acceptedFileTypes` | string | `'image/jpeg,image/png,image/gif,image/webp'` | Accepted MIME types |
| `maxSizeMB` | number | `10` | Maximum file size in MB |
| `useDirectUpload` | boolean | `false` | Whether to use direct creator upload |

#### Example

```tsx
<CloudflareImageUpload
  onUploadComplete={(imageData) => console.log('Uploaded image:', imageData)}
  onUploadError={(error) => console.error('Upload error:', error)}
  buttonText="Upload Product Image"
  metadata={{ productId: '123', category: 'electronics' }}
/>
```

### CloudflareImagesManager

The `CloudflareImagesManager` component provides a complete admin interface for managing images in Cloudflare Images.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `deliveryUrl` | string | `undefined` | Custom delivery URL (overrides environment variable) |

#### Example

```tsx
<CloudflareImagesManager deliveryUrl={process.env.VITE_CLOUDFLARE_IMAGES_DELIVERY_URL} />
```

## Hooks

The following hooks are available for interacting with the Cloudflare Images API:

- `useDirectUpload()` - Get a direct upload URL for client-side uploads
- `useImageUpload()` - Upload an image through the backend
- `useImage(id)` - Get details of a specific image
- `useImages(page, perPage)` - List images with pagination
- `useDeleteImage()` - Delete an image
- `useCreateVariant()` - Create a new image variant
- `useVariants()` - List all image variants
- `useDeleteVariant()` - Delete an image variant
- `useSignedUrl()` - Generate a signed URL for a private image

## Usage Examples

### Basic Image Display

```tsx
import CloudflareImage from '../components/ui/CloudflareImage';

const ProductImage = ({ productImageId }) => {
  return (
    <CloudflareImage
      imageId={productImageId}
      variant="medium"
      alt="Product image"
      className="rounded-lg shadow-md"
    />
  );
};
```

### Image Upload in a Form

```tsx
import { useState } from 'react';
import CloudflareImageUpload from '../components/ui/CloudflareImageUpload';

const ProductForm = () => {
  const [imageId, setImageId] = useState('');
  
  const handleImageUpload = (imageData) => {
    setImageId(imageData.id);
  };
  
  return (
    <form>
      <div className="mb-4">
        <label className="block mb-2">Product Image</label>
        <CloudflareImageUpload
          onUploadComplete={handleImageUpload}
          buttonText="Upload Product Image"
        />
        {imageId && (
          <div className="mt-2">
            <CloudflareImage
              imageId={imageId}
              variant="thumbnail"
              alt="Product thumbnail"
              width={100}
              height={100}
            />
          </div>
        )}
      </div>
      
      <input type="hidden" name="imageId" value={imageId} />
      
      {/* Other form fields */}
    </form>
  );
};
```

### Using Signed URLs for Private Images

```tsx
import { useSignedUrl } from '../lib/hooks/useCloudflareImages';

const PrivateImage = ({ imageId }) => {
  const signedUrlMutation = useSignedUrl();
  const [imageUrl, setImageUrl] = useState('');
  
  useEffect(() => {
    const getSignedUrl = async () => {
      try {
        const response = await signedUrlMutation.mutateAsync({
          image_id: imageId,
          variant_name: 'medium',
          expiry_minutes: 60
        });
        
        setImageUrl(response.url);
      } catch (error) {
        console.error('Failed to get signed URL:', error);
      }
    };
    
    getSignedUrl();
  }, [imageId]);
  
  if (!imageUrl) {
    return <div>Loading image...</div>;
  }
  
  return <img src={imageUrl} alt="Private image" />;
};
```

## Best Practices

1. **Use Appropriate Variants**: Create and use image variants that match your use cases to optimize performance.
2. **Implement Lazy Loading**: For pages with many images, implement lazy loading to improve page load times.
3. **Handle Errors**: Always provide fallback UI when images fail to load.
4. **Secure Private Images**: Use signed URLs for images that should not be publicly accessible.
5. **Optimize Metadata**: Use metadata to organize and search for images more effectively.
6. **Set Appropriate Cache Control**: Configure Cloudflare's cache settings to balance freshness and performance.
7. **Monitor Usage**: Keep track of your Cloudflare Images usage to stay within your plan limits.

---

For more information, refer to the [Cloudflare Images documentation](https://developers.cloudflare.com/images/).
