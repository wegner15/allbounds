# Cloudflare Images Components Guide

This guide explains how to use the Cloudflare Images components in the AllBounds application.

## Available Components

### 1. CloudflareImage

The basic component for displaying images from Cloudflare Images.

```tsx
import CloudflareImage from '../components/ui/CloudflareImage';

<CloudflareImage
  imageId="your-image-id"
  variant="medium"
  alt="Image description"
  className="w-full h-48 rounded-lg"
/>
```

### 2. CloudflareImageUpload

Component for uploading images to Cloudflare Images.

```tsx
import CloudflareImageUpload from '../components/ui/CloudflareImageUpload';

<CloudflareImageUpload
  onUploadComplete={(imageData) => console.log('Uploaded:', imageData.id)}
  onUploadError={(error) => console.error('Error:', error)}
  buttonText="Upload Image"
/>
```

### 3. ImageSelector

A higher-level component that combines image upload and preview.

```tsx
import ImageSelector from '../components/ui/ImageSelector';

<ImageSelector
  initialImageId={imageId}
  onImageSelected={(id) => setImageId(id)}
  label="Featured Image"
  helperText="Upload an image for this item"
/>
```

### 4. CloudflareImageDisplay

A versatile component that handles Cloudflare Images with fallback support.

```tsx
import CloudflareImageDisplay from '../components/ui/CloudflareImageDisplay';

<CloudflareImageDisplay
  imageId={imageId}
  fallbackUrl="https://example.com/fallback.jpg"
  variant="medium"
  alt="Image description"
  className="w-full h-48 rounded-lg"
/>
```

## Updating Existing Forms

To update existing forms to use Cloudflare Images:

1. Replace image URL fields with the `ImageSelector` component
2. Update your form state to store image IDs instead of URLs
3. Update your API calls to send image IDs instead of URLs

### Example Form Integration

```tsx
import React, { useState } from 'react';
import ImageSelector from '../components/ui/ImageSelector';

const MyForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageId: ''
  });

  const handleImageSelected = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      imageId
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Send formData to API
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Other form fields */}
      
      <ImageSelector
        initialImageId={formData.imageId}
        onImageSelected={handleImageSelected}
        label="Featured Image"
      />
      
      <button type="submit">Save</button>
    </form>
  );
};
```

## Updating Display Components

To update components that display images:

1. Replace `<img>` tags with `<CloudflareImageDisplay>`
2. Pass the image ID and variant to the component

### Example Display Integration

```tsx
import React from 'react';
import CloudflareImageDisplay from '../components/ui/CloudflareImageDisplay';

const ItemCard = ({ item }) => {
  return (
    <div className="card">
      <CloudflareImageDisplay
        imageId={item.imageId}
        fallbackUrl={item.legacyImageUrl} // For backward compatibility
        variant="thumbnail"
        alt={item.title}
        className="w-full h-48 object-cover"
      />
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  );
};
```

## Image Variants

The following image variants are available:

- `public` - Original image (default)
- `thumbnail` - Small thumbnail (200x200)
- `medium` - Medium-sized image (800x600)
- `large` - Large image (1200x900)

You can create custom variants through the Cloudflare Images admin interface or through the API.

## Best Practices

1. **Use appropriate variants**: Choose the right variant for each use case to optimize performance.
2. **Provide fallback URLs**: For backward compatibility, provide fallback URLs for items that might not have Cloudflare image IDs yet.
3. **Handle loading states**: The components handle loading states internally, but you can add additional loading indicators if needed.
4. **Error handling**: Always provide error handling for image uploads.
5. **Accessibility**: Always provide meaningful alt text for images.

## Migration Strategy

When migrating from URL-based images to Cloudflare Images:

1. Update your database schema to store image IDs alongside or instead of URLs
2. Create a migration script to upload existing images to Cloudflare Images
3. Update your frontend components to use the new Cloudflare Images components
4. Use the `CloudflareImageDisplay` component with fallback URLs to ensure a smooth transition

## Example Implementation

See the `ImageComponentsExample.tsx` file for a complete example of how to use these components in a form and display context.
