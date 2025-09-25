import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountries } from '../../../lib/hooks/useCountries';
import LocationPicker from '../../../components/LocationPicker';
import GalleryManager from '../../../components/admin/GalleryManager';
import TinyMCEEditor from '../../../components/ui/TinyMCEEditor';
import type { Attraction, AttractionCreateInput, AttractionUpdateInput } from '../../../lib/hooks/useAttractions';
import type { GalleryImage } from '../../../lib/types/api';

interface AttractionFormProps {
  initialData?: Attraction;
  onSubmit: (data: AttractionCreateInput | AttractionUpdateInput) => void;
  isLoading: boolean;
}

const AttractionForm: React.FC<AttractionFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const { data: countries } = useCountries();
  
  const [formData, setFormData] = useState<AttractionCreateInput & { is_active?: boolean }>({
    name: '',
    country_id: 0,
    is_active: true,
  });
  
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<number | null>(null);


  // Set initial form data if editing an existing attraction
  useEffect(() => {
    if (initialData) {
      const {
        id,
        slug,
        created_at,
        updated_at,
        country,
        gallery_images,
        ...rest
      } = initialData;
      
      setFormData(rest);
      
      // Set gallery images if available
      if (gallery_images) {
        setGalleryImages(gallery_images.map(img => ({
          id: img.id,
          filename: img.file_path.split('/').pop() || 'image.jpg',
          file_path: img.file_path,
          alt_text: img.alt_text,
          caption: img.caption,
          entity_type: 'attraction' as const,
          entity_id: id,
          created_at: '',
          updated_at: ''
        })));
      }
      
      // Set cover image if available
      if (initialData.cover_image) {
        // Find the cover image ID from gallery images
        const coverImg = gallery_images?.find(img => img.file_path === initialData.cover_image);
        if (coverImg) {
          setCoverImageId(coverImg.id);
        }
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? null : parseFloat(value)) : value
    }));
  };

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || prev.address || '',
      city: location.city || prev.city || ''
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add cover image to form data if selected
    const submitData = {
      ...formData,
      cover_image: coverImageId ? galleryImages.find(img => img.id === coverImageId)?.file_path : undefined
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      {/* Basic Information */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Attraction Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="country_id" className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <select
              id="country_id"
              name="country_id"
              required
              value={formData.country_id || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
            >
              <option value="">Select a country</option>
              {countries?.map((country: any) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={2}
              value={formData.address || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Visitor Information */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Visitor Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              id="duration_minutes"
              name="duration_minutes"
              min="0"
              step="15"
              value={formData.duration_minutes || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
              placeholder="e.g., 120"
            />
            <p className="mt-1 text-sm text-gray-500">
              Typical visit duration in minutes (e.g., 120 for 2 hours, 30 for quick visit)
            </p>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={formData.price || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
              placeholder="e.g., 25.00"
            />
            <p className="mt-1 text-sm text-gray-500">
              Standard admission price (leave empty if free)
            </p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="opening_hours" className="block text-sm font-medium text-gray-700 mb-1">
              Opening Hours
            </label>
            <input
              type="text"
              id="opening_hours"
              name="opening_hours"
              placeholder="e.g. Mon-Fri: 9AM-5PM, Sat-Sun: 10AM-4PM"
              value={formData.opening_hours || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Operating hours and days (e.g., "Daily 9AM-6PM" or "Mon-Fri: 9AM-5PM, Weekends: 10AM-4PM")
            </p>
          </div>
        </div>
      </div>

      {/* Location Picker */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Location</h2>
        <LocationPicker
          height="400px"
          onLocationSelect={handleLocationSelect}
          initialLocation={
            formData.latitude && formData.longitude
              ? {
                  latitude: parseFloat(formData.latitude.toString()),
                  longitude: parseFloat(formData.longitude.toString()),
                  address: formData.address || '',
                  city: formData.city || ''
                }
              : undefined
          }
        />
        
        {/* Display selected coordinates */}
        {formData.latitude && formData.longitude && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Selected Location:</strong> {formData.latitude}, {formData.longitude}
            </p>
            {formData.address && (
              <p className="text-sm text-gray-600 mt-1">
                <strong>Address:</strong> {formData.address}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Description</h2>
        <div className="mb-6">
          <TinyMCEEditor
            value={formData.summary || ''}
            onChange={(content) => setFormData(prev => ({ ...prev, summary: content }))}
            label="Summary"
            helperText="Brief overview of the attraction (1-2 paragraphs)"
            placeholder="Write a concise summary of the attraction..."
            height={200}
          />
        </div>

        <div>
          <TinyMCEEditor
            value={formData.description || ''}
            onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
            label="Full Description"
            helperText="Detailed description of the attraction, its history, features, and visitor information"
            placeholder="Provide a comprehensive description of the attraction..."
            height={350}
          />
        </div>
      </div>

      {/* Gallery */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Gallery</h2>
        <GalleryManager
          entityType="attraction"
          entityId={initialData?.id}
          images={galleryImages}
          coverImageId={coverImageId}
          onImagesChange={setGalleryImages}
          onCoverImageChange={setCoverImageId}
        />
      </div>

      {/* Status */}
      {initialData && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active === true}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-teal focus:ring-teal border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Active (visible to public)
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Inactive attractions won't appear in public listings or search results
          </p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={() => navigate('/admin/attractions')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 bg-teal text-white rounded-md hover:bg-teal-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Attraction' : 'Create Attraction'}
        </button>
      </div>
    </form>
  );
};

export default AttractionForm;
