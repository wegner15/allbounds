# Cloudflare Images Components Usage Guide

This guide provides detailed instructions on how to use the Cloudflare Images components in the AllBounds application.

## Table of Contents

1. [Setup](#setup)
2. [Components](#components)
   - [CloudflareImage](#cloudflareimage)
   - [CloudflareImageUpload](#cloudflareimageupload)
   - [ImageSelector](#imageselector)
   - [CloudflareImageDisplay](#cloudflareimageDisplay)
3. [Form Integration](#form-integration)
4. [Image Display](#image-display)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

## Setup

Before using the Cloudflare Images components, ensure that your environment is properly configured:

### Backend Configuration

Make sure your backend `.env` file contains the following variables:

```
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_IMAGES_DELIVERY_URL=https://imagedelivery.net/your_account_hash
CLOUDFLARE_IMAGES_SIGNING_KEY=your_signing_key_for_private_images
```

### Frontend Configuration

Make sure your frontend `.env` file contains:

```
VITE_CLOUDFLARE_IMAGES_DELIVERY_URL=https://imagedelivery.net/your_account_hash
```

## Components

### CloudflareImage

The most basic component for displaying images from Cloudflare Images.

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

#### Example

```tsx
import CloudflareImage from '../components/ui/CloudflareImage';

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

Component for uploading images directly to Cloudflare Images.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUploadComplete` | function | (required) | Callback when upload completes successfully |
| `onUploadError` | function | (required) | Callback when upload fails |
| `requireSignedUrls` | boolean | `true` | Whether uploaded images require signed URLs |
| `metadata` | object | `{}` | Metadata to attach to the image |
| `className` | string | `''` | Additional CSS classes |
| `buttonText` | string | `'Upload Image'` | Text displayed on the upload button |
| `acceptedFileTypes` | string | `'image/jpeg,image/png,image/gif,image/webp'` | Accepted MIME types |
| `maxSizeMB` | number | `10` | Maximum file size in MB |
| `useDirectUpload` | boolean | `false` | Whether to use direct creator upload |

#### Example

```tsx
import CloudflareImageUpload from '../components/ui/CloudflareImageUpload';

<CloudflareImageUpload
  onUploadComplete={(imageData) => console.log('Uploaded image:', imageData)}
  onUploadError={(error) => console.error('Upload error:', error)}
  buttonText="Upload Product Image"
  metadata={{ productId: '123', category: 'electronics' }}
/>
```

### ImageSelector

A higher-level component that combines upload and preview functionality.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialImageId` | string | `''` | Initial image ID to display |
| `onImageSelected` | function | (required) | Callback when an image is selected or uploaded |
| `variant` | string | `'medium'` | The variant name to display |
| `label` | string | `'Image'` | Label for the field |
| `helperText` | string | `undefined` | Helper text to display below the field |
| `className` | string | `''` | Additional CSS classes |

#### Example

```tsx
import ImageSelector from '../components/ui/ImageSelector';

const [imageId, setImageId] = useState('');

<ImageSelector
  initialImageId={imageId}
  onImageSelected={setImageId}
  label="Featured Image"
  helperText="Upload an image for this product"
/>
```

### CloudflareImageDisplay

A versatile component that displays images from Cloudflare Images with fallback support.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imageId` | string | `undefined` | The ID of the image in Cloudflare Images |
| `variant` | string | `'medium'` | The variant name to display |
| `alt` | string | `''` | Alt text for the image |
| `className` | string | `''` | Additional CSS classes |
| `width` | number \| string | `undefined` | Width of the image |
| `height` | number \| string | `undefined` | Height of the image |
| `fallbackUrl` | string | `undefined` | URL to use if imageId is not provided |
| `objectFit` | string | `'cover'` | CSS object-fit property |

#### Example

```tsx
import CloudflareImageDisplay from '../components/ui/CloudflareImageDisplay';

<CloudflareImageDisplay
  imageId={product.imageId}
  fallbackUrl={product.legacyImageUrl}
  variant="medium"
  alt={product.name}
  className="w-full h-48 rounded-lg"
/>
```

## Form Integration

### Using ImageSelector in Forms

The `ImageSelector` component is designed to be easily integrated into forms. Here's how to use it with React Hook Form:

```tsx
import { useForm } from 'react-hook-form';
import ImageSelector from '../components/ui/ImageSelector';

const ProductForm = () => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      name: '',
      description: '',
      imageId: '',
    }
  });

  const onSubmit = (data) => {
    console.log('Form data:', data);
    // Submit to API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Other form fields */}
      
      <ImageSelector
        initialImageId={watch('imageId')}
        onImageSelected={(imageId) => setValue('imageId', imageId)}
        label="Product Image"
        helperText="Upload an image for this product"
      />
      
      <button type="submit">Save Product</button>
    </form>
  );
};
```

## Image Display

### Displaying Images in Lists

When displaying images in lists, use the `CloudflareImageDisplay` component for better fallback support:

```tsx
<div className="grid grid-cols-3 gap-4">
  {products.map(product => (
    <div key={product.id} className="card">
      <CloudflareImageDisplay
        imageId={product.imageId}
        fallbackUrl={product.legacyImageUrl}
        variant="thumbnail"
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <h3>{product.name}</h3>
      <p>{product.price}</p>
    </div>
  ))}
</div>
```

### Using Different Variants

Cloudflare Images supports different variants for different use cases:

```tsx
// Thumbnail in a list
<CloudflareImage
  imageId={product.imageId}
  variant="thumbnail"
  alt={product.name}
  className="w-20 h-20 object-cover"
/>

// Medium image in a product card
<CloudflareImage
  imageId={product.imageId}
  variant="medium"
  alt={product.name}
  className="w-full h-48 object-cover"
/>

// Large image in a product detail page
<CloudflareImage
  imageId={product.imageId}
  variant="large"
  alt={product.name}
  className="w-full h-96 object-contain"
/>
```

## Testing

You can test the Cloudflare Images components using the test page we've created:

1. Navigate to `/admin/media/test` in your application
2. Test uploading images using the CloudflareImageUpload component
3. Test selecting images using the ImageSelector component
4. Test displaying images using the CloudflareImage and CloudflareImageDisplay components

## Troubleshooting

### Image Not Displaying

If an image is not displaying, check the following:

1. Verify that the `imageId` is correct
2. Check that the variant exists in Cloudflare Images
3. Ensure that the environment variables are correctly set
4. Check the browser console for errors

### Upload Errors

If image uploads are failing, check the following:

1. Verify that the Cloudflare API token has the correct permissions
2. Check that the account ID is correct
3. Ensure that the file size is within limits
4. Check the browser console for detailed error messages

### API Errors

If you're seeing API errors, check the following:

1. Verify that the backend server is running
2. Check that the API endpoints are correctly configured
3. Ensure that authentication is working correctly
4. Check the server logs for detailed error messages
