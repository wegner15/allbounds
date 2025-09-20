import React, { useState } from 'react';
import ImageSelector from '../ui/ImageSelector';
import CloudflareImageDisplay from '../ui/CloudflareImageDisplay';

const ImageComponentsExample: React.FC = () => {
  const [selectedImageId, setSelectedImageId] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageId: ''
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image selection
  const handleImageSelected = (imageId: string) => {
    setSelectedImageId(imageId);
    setFormData(prev => ({
      ...prev,
      imageId
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    // Here you would typically send the data to your API
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Cloudflare Images Components Example</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Form with Image Upload</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Regular form fields */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          
          {/* Image Selector */}
          <div>
            <ImageSelector
              initialImageId={formData.imageId}
              onImageSelected={handleImageSelected}
              label="Featured Image"
              helperText="Upload an image for this item. Recommended size: 1200x800 pixels."
            />
          </div>
          
          {/* Hidden input to store the image ID */}
          <input type="hidden" name="imageId" value={formData.imageId} />
          
          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Image Display Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Display with Cloudflare image ID */}
          <div>
            <h3 className="text-lg font-medium mb-2">With Cloudflare Image ID</h3>
            <CloudflareImageDisplay
              imageId={selectedImageId}
              variant="medium"
              alt="Selected image"
              className="w-full h-48 rounded-lg"
            />
            <p className="mt-2 text-sm text-gray-500">
              Image ID: {selectedImageId || 'None selected'}
            </p>
          </div>
          
          {/* Display with fallback URL */}
          <div>
            <h3 className="text-lg font-medium mb-2">With Fallback URL</h3>
            <CloudflareImageDisplay
              imageId=""
              fallbackUrl="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
              alt="Fallback image"
              className="w-full h-48 rounded-lg"
            />
            <p className="mt-2 text-sm text-gray-500">
              Using fallback URL when no image ID is provided
            </p>
          </div>
          
          {/* Display with different variants */}
          <div>
            <h3 className="text-lg font-medium mb-2">Different Variants</h3>
            <div className="grid grid-cols-2 gap-2">
              <CloudflareImageDisplay
                imageId={selectedImageId}
                variant="thumbnail"
                alt="Thumbnail variant"
                className="w-full h-24 rounded-lg"
              />
              <CloudflareImageDisplay
                imageId={selectedImageId}
                variant="medium"
                alt="Medium variant"
                className="w-full h-24 rounded-lg"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Different variants of the same image
            </p>
          </div>
          
          {/* Display with no image */}
          <div>
            <h3 className="text-lg font-medium mb-2">No Image (Placeholder)</h3>
            <CloudflareImageDisplay
              alt="No image"
              className="w-full h-48 rounded-lg"
            />
            <p className="mt-2 text-sm text-gray-500">
              Placeholder shown when no image ID or fallback URL is provided
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageComponentsExample;
