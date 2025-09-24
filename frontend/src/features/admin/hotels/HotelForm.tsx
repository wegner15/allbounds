import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountries } from '../../../lib/hooks/useCountries';
import { useHotelTypes } from '../../../lib/hooks/useHotelTypes';
import { apiClient } from '../../../lib/api';
import LocationPicker from '../../../components/LocationPicker';
import TimeSelector from '../../../components/TimeSelector';
import GalleryManager from '../../../components/admin/GalleryManager';
import type { Hotel, HotelCreateInput, HotelUpdateInput } from '../../../lib/hooks/useHotels';
import type { GalleryImage } from '../../../lib/types/api';

interface HotelFormProps {
  initialData?: Hotel;
  onSubmit: (data: HotelCreateInput | HotelUpdateInput) => void;
  isLoading: boolean;
}

const HotelForm: React.FC<HotelFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const { data: countries } = useCountries();
  const { data: hotelTypes } = useHotelTypes();
  
  const [formData, setFormData] = useState<HotelCreateInput & { is_active?: boolean }>({
    name: '',
    country_id: 0,
    hotel_type_id: 0,
    stars: 0,
    is_active: true,
  });

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [coverImageId, setCoverImageId] = useState<number | null>(null);

  // Set initial form data if editing an existing hotel
  useEffect(() => {
    if (initialData) {
      const {
        id,
        slug,
        created_at,
        updated_at,
        country,
        ...rest
      } = initialData;
      
      setFormData(rest);
      
      // Load existing gallery images
      if (id) {
        fetchGalleryImages(id);
      }
    }
  }, [initialData]);

  const fetchGalleryImages = async (hotelId: number) => {
    try {
      const response = await apiClient.get<GalleryImage[]>(`/api/v1/media?entity_type=hotel&entity_id=${hotelId}`);
      setGalleryImages(response);
      
      // Set cover image if hotel has image_id
      if (initialData?.image_id) {
        setCoverImageId(parseInt(initialData.image_id));
      }
    } catch (error) {
      console.error('Failed to fetch gallery images:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleLocationSelect = (location: { latitude: number; longitude: number; address?: string; city?: string }) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || prev.address,
      city: location.city || prev.city
    }));
  };

  const handleStarsChange = (stars: number) => {
    setFormData(prev => ({
      ...prev,
      stars
    }));
  };

  const handleAmenitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const currentAmenities = formData.amenities || {};
    
    setFormData(prev => ({
      ...prev,
      amenities: {
        ...currentAmenities,
        [name]: checked
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const commonAmenities = [
    { id: 'wifi', label: 'WiFi' },
    { id: 'pool', label: 'Swimming Pool' },
    { id: 'gym', label: 'Fitness Center' },
    { id: 'spa', label: 'Spa' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'bar', label: 'Bar' },
    { id: 'parking', label: 'Parking' },
    { id: 'roomService', label: 'Room Service' },
    { id: 'airConditioning', label: 'Air Conditioning' },
    { id: 'laundry', label: 'Laundry Service' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      {/* Basic Information */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Hotel Name *
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
              {countries?.map((country) => (
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

          <div>
            <label htmlFor="hotel_type_id" className="block text-sm font-medium text-gray-700 mb-1">
              Hotel Type
            </label>
            <select
              id="hotel_type_id"
              name="hotel_type_id"
              value={formData.hotel_type_id || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
            >
              <option value="">Select hotel type</option>
              {hotelTypes?.map((hotelType) => (
                <option key={hotelType.id} value={hotelType.id}>
                  {hotelType.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Star Rating
            </label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarsChange(star)}
                  className="focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 ${star <= (formData.stars || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">{formData.stars} stars</span>
            </div>
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

      {/* Location Selection */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Hotel Location</h2>
        <LocationPicker
          initialLocation={
            formData.latitude && formData.longitude
              ? {
                  latitude: formData.latitude,
                  longitude: formData.longitude,
                  address: formData.address,
                  city: formData.city,
                }
              : undefined
          }
          onLocationSelect={handleLocationSelect}
          height="350px"
        />
        
        {/* Display selected coordinates */}
        {formData.latitude && formData.longitude && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Selected Location:</strong> {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
            </p>
            {formData.address && (
              <p className="text-sm text-gray-600 mt-1">
                <strong>Address:</strong> {formData.address}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Check-in/Check-out Times */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Check-in/Check-out Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <TimeSelector
              id="check_in_time"
              name="check_in_time"
              label="Check-in Time"
              placeholder="Select check-in time"
              value={formData.check_in_time || ''}
              onChange={(time) => setFormData(prev => ({ ...prev, check_in_time: time }))}
            />
          </div>

          <div>
            <TimeSelector
              id="check_out_time"
              name="check_out_time"
              label="Check-out Time"
              placeholder="Select check-out time"
              value={formData.check_out_time || ''}
              onChange={(time) => setFormData(prev => ({ ...prev, check_out_time: time }))}
            />
          </div>
        </div>
      </div>

      {/* Hotel Amenities */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Amenities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commonAmenities.map((amenity) => (
            <div key={amenity.id} className="flex items-center">
              <input
                type="checkbox"
                id={amenity.id}
                name={amenity.id}
                checked={!!(formData.amenities && formData.amenities[amenity.id])}
                onChange={handleAmenitiesChange}
                className="h-4 w-4 text-teal focus:ring-teal border-gray-300 rounded"
              />
              <label htmlFor={amenity.id} className="ml-2 block text-sm text-gray-700">
                {amenity.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Description</h2>
        <div className="mb-4">
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
            Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={2}
            value={formData.summary || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Full Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={formData.description || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-transparent"
          />
        </div>
      </div>

      {/* Gallery Management */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Photo Gallery</h2>
        <GalleryManager
          entityType="hotel"
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
              Active
            </label>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={() => navigate('/admin/hotels')}
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
          {isLoading ? 'Saving...' : initialData ? 'Update Hotel' : 'Create Hotel'}
        </button>
      </div>
    </form>
  );
};

export default HotelForm;
